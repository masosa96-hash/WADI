import { Router } from "express";
import { openai, AI_MODEL } from "./openai.js";
import { generateSystemPrompt } from "./wadi-brain.js";
import { supabase } from "./supabase.js";
import { AppError, AuthError, ModelError } from "./core/errors.js";
import {
  validateChatInput,
  validateProjectInput,
  validateRunInput,
} from "./middleware/validation.js";

const router = Router();

// Helper: Verify Auth Token via Supabase
const getAuthenticatedUser = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace("Bearer ", "");

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) return null;
  return user;
};

// Helper: Async Wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Helper: Format messages for AI context
const formatContext = (messages) => {
  if (!messages || messages.length === 0) return "";
  // Take last 10 messages
  const recent = messages.slice(-10);
  return recent
    .map(
      (m) =>
        `${m.role === "user" ? "Usuario" : "WADI"}: ${m.content.substring(0, 500)}`
    )
    .join("\n");
};

// ------------------------------------------------------------------
// CONVERSATIONS & CHAT PERSISTENCE
// ------------------------------------------------------------------

// 1. Create Conversation
router.post(
  "/conversations",
  asyncHandler(async (req, res) => {
    const user = await getAuthenticatedUser(req);
    if (!user) throw new AuthError("Authentication required");

    const { mode, explainLevel, topic } = req.body;

    const title = `Chat ${new Date().toLocaleDateString()}`; // Temporary title

    const { data, error } = await supabase
      .from("conversations")
      .insert([
        {
          user_id: user.id,
          title, // Can be updated later with first message content
          mode: mode || "normal",
          explain_level: explainLevel || "normal",
        },
      ])
      .select()
      .single();

    if (error) throw new AppError("DB_ERROR", error.message);
    res.json(data);
  })
);

// 2. Send Message (Persistent)
router.post(
  "/conversations/:id/messages",
  validateChatInput,
  asyncHandler(async (req, res) => {
    const user = await getAuthenticatedUser(req);
    if (!user) throw new AuthError("Authentication required");
    const { id } = req.params;
    const { message, mode, explainLevel, topic } = req.body;

    // A. Verify Ownership & Get Conversation
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (convError || !conversation) {
      throw new AuthError("Conversation not found or access denied", 404);
    }

    // B. Fetch History for Context
    const { data: history } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    const contextSummary = formatContext(history || []);

    // C. Generate AI Response
    const safeMode = mode || conversation.mode || "normal";
    const safeTopic = topic || "general";
    const safeLevel = explainLevel || conversation.explain_level || "normal";

    // We don't have separate prefs table yet, can pass empty object or extract from conversation if needed
    // For now, prompt generation relies on passed params
    const systemPrompt = generateSystemPrompt(
      safeMode,
      safeTopic,
      safeLevel,
      contextSummary,
      {}
    );

    try {
      const completion = await openai.chat.completions.create({
        model: AI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
      });

      const reply = completion.choices[0].message.content;

      // D. Save Messages to DB
      // 1. User Message
      await supabase.from("messages").insert({
        conversation_id: id,
        user_id: user.id,
        role: "user",
        content: message,
      });

      // 2. Assistant Message
      await supabase.from("messages").insert({
        conversation_id: id,
        user_id: user.id,
        role: "assistant",
        content: reply,
      });

      // E. Update Conversation (Timestamp & potentially Title)
      const updates = { updated_at: new Date().toISOString() };

      // If it's the first message, update title
      if (!history || history.length === 0) {
        updates.title =
          message.substring(0, 30) + (message.length > 30 ? "..." : "");
      }

      // Also update settings if they changed in this request?
      // User might change mode mid-chat. Let's update them.
      if (mode) updates.mode = mode;
      if (explainLevel) updates.explain_level = explainLevel;

      await supabase.from("conversations").update(updates).eq("id", id);

      res.json({ reply });
    } catch (e) {
      throw new ModelError(e.message);
    }
  })
);

// 3. List Conversations
router.get(
  "/conversations",
  asyncHandler(async (req, res) => {
    const user = await getAuthenticatedUser(req);
    if (!user) throw new AuthError("Authentication required");

    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) throw new AppError("DB_ERROR", error.message);
    res.json(data);
  })
);

// 4. Get Conversation Detail
router.get(
  "/conversations/:id",
  asyncHandler(async (req, res) => {
    const user = await getAuthenticatedUser(req);
    if (!user) throw new AuthError("Authentication required");
    const { id } = req.params;

    // Verify ownership
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (convError || !conversation) {
      throw new AuthError("Conversation not found", 404);
    }

    // Get messages
    const { data: messages, error: msgError } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    if (msgError) throw new AppError("DB_ERROR", msgError.message);

    res.json({ ...conversation, messages });
  })
);

// 5. Delete Conversation
router.delete(
  "/conversations/:id",
  asyncHandler(async (req, res) => {
    const user = await getAuthenticatedUser(req);
    if (!user) throw new AuthError("Authentication required");
    const { id } = req.params;

    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw new AppError("DB_ERROR", error.message);
    res.json({ success: true });
  })
);

// ------------------------------------------------------------------
// LEGACY / GUEST CHAT (Deprecated / Fallback)
// ------------------------------------------------------------------
// If we strictly follow instructions, we rely on Authenticated Chat.
// Keeping a stub that errors or directs to login might be safer than broken memory.
router.post("/chat", (req, res, next) => {
  next(
    new AuthError(
      "Please use /conversations endpoints. Guest chat is moving to persistent sessions."
    )
  );
});

// ------------------------------------------------------------------
// PROJECTS ROUTES
// ------------------------------------------------------------------

router.get(
  "/projects",
  asyncHandler(async (req, res) => {
    const user = await getAuthenticatedUser(req);
    if (!user) throw new AuthError("Authentication required");

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw new AppError("DB_ERROR", error.message);
    res.json(data);
  })
);

router.post(
  "/projects",
  validateProjectInput,
  asyncHandler(async (req, res) => {
    const user = await getAuthenticatedUser(req);
    if (!user) throw new AuthError("Authentication required");

    const { name, description } = req.body;
    const { data, error } = await supabase
      .from("projects")
      .insert([{ name, description, user_id: user.id }])
      .select()
      .single();

    if (error) throw new AppError("DB_ERROR", error.message);
    res.json(data);
  })
);

router.delete(
  "/projects/:id",
  asyncHandler(async (req, res) => {
    const user = await getAuthenticatedUser(req);
    if (!user) throw new AuthError("Authentication required");
    const { id } = req.params;

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw new AppError("DB_ERROR", error.message);
    res.json({ success: true, message: "Project deleted" });
  })
);

router.get(
  "/projects/:id/runs",
  asyncHandler(async (req, res) => {
    const user = await getAuthenticatedUser(req);
    if (!user) throw new AuthError("Authentication required");
    const { id } = req.params;

    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!project)
      throw new AuthError("Access denied or project not found", 403);

    const { data, error } = await supabase
      .from("runs")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: false });

    if (error) throw new AppError("DB_ERROR", error.message);
    res.json(data);
  })
);

router.post(
  "/projects/:id/runs",
  validateRunInput,
  asyncHandler(async (req, res) => {
    const user = await getAuthenticatedUser(req);
    if (!user) throw new AuthError("Authentication required");
    const { id } = req.params;
    const { input } = req.body;

    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!project)
      throw new AuthError("Access denied or project not found", 403);

    const { data: run, error: runError } = await supabase
      .from("runs")
      .insert([{ project_id: id, input, user_id: user.id }])
      .select()
      .single();

    if (runError) throw new AppError("DB_ERROR", runError.message);

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: input }],
      });
      const output = completion.choices[0].message.content;

      const { data: updatedRun, error: updateError } = await supabase
        .from("runs")
        .update({ output })
        .eq("id", run.id)
        .select()
        .single();

      if (updateError) throw new AppError("DB_ERROR", updateError.message);

      res.json(updatedRun);
    } catch (e) {
      throw new ModelError(String(e));
    }
  })
);

export default router;
