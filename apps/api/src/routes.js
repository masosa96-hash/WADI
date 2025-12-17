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
// Helper: Process attachments for OpenAI
const processAttachments = async (message, attachments) => {
  if (!attachments || attachments.length === 0) {
    return message; // Return string if no attachments
  }

  const content = [{ type: "text", text: message }];

  for (const url of attachments) {
    // Basic extension check
    const lowerUrl = url.toLowerCase();
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/.test(lowerUrl);
    const isText = /\.(txt|md|csv|json|js|ts|py)$/.test(lowerUrl);

    if (isImage) {
      content.push({
        type: "image_url",
        image_url: { url: url },
      });
    } else if (isText) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const textData = await response.text();
          content.push({
            type: "text",
            text: `\n\n--- ARCHIVO ADJUNTO (${url}) ---\n${textData}\n--- FIN ARCHIVO ---\n`,
          });
        }
      } catch (err) {
        console.error("Error fetching text attachment:", err);
      }
    }
  }

  return content;
};

// ... (Inside the endpoints, replace the logic)

// 2. Send Message (Persistent)
router.post(
  "/conversations/:id/messages",
  validateChatInput,
  asyncHandler(async (req, res) => {
    const user = await getAuthenticatedUser(req);
    if (!user) throw new AuthError("Authentication required");
    const { id } = req.params;
    const { message, mode, explainLevel, topic, attachments } = req.body;

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

    // Handle history context simplistically for now (string only)
    // Ideally we should parse array content if stored as JSON, but legacy is string.
    const contextSummary = formatContext(history || []);

    // C. Generate AI Response
    const safeMode = mode || conversation.mode || "normal";
    const safeTopic = topic || "general";
    const safeLevel = explainLevel || conversation.explain_level || "normal";

    const systemPrompt = generateSystemPrompt(
      safeMode,
      safeTopic,
      safeLevel,
      contextSummary,
      {}
    );

    // Prepare User Content (String or Array)
    const userContent = await processAttachments(message, attachments);

    try {
      const completion = await openai.chat.completions.create({
        model: AI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
      });

      const reply = completion.choices[0].message.content;

      // D. Save Messages to DB
      // 1. User Message
      // We store the RAW text in 'content' for legacy compatibility,
      // AND arrays in 'attachments' column.
      await supabase.from("messages").insert({
        conversation_id: id,
        user_id: user.id,
        role: "user",
        content: message, // Human readable summary
        attachments: attachments || [],
      });

      // 2. Assistant Message
      await supabase.from("messages").insert({
        conversation_id: id,
        user_id: user.id,
        role: "assistant",
        content: reply,
      });

      // E. Update Conversation
      const updates = { updated_at: new Date().toISOString() };
      if (!history || history.length === 0) {
        updates.title =
          message.substring(0, 30) + (message.length > 30 ? "..." : "");
      }
      if (mode) updates.mode = mode;
      if (explainLevel) updates.explain_level = explainLevel;

      await supabase.from("conversations").update(updates).eq("id", id);

      res.json({ reply });
    } catch (e) {
      throw new ModelError(e.message);
    }
  })
);

// ...

// UNIFIED SMART CHAT ENDPOINT
router.post(
  "/chat",
  validateChatInput,
  asyncHandler(async (req, res) => {
    const user = await getAuthenticatedUser(req);
    if (!user) throw new AuthError("Authentication required");

    const { message, conversationId, mode, explainLevel, topic, attachments } =
      req.body;
    let currentConversationId = conversationId;
    let conversation;

    // A. Handle Conversation Resolution
    if (!currentConversationId) {
      const title =
        message.substring(0, 60) + (message.length > 60 ? "..." : "");
      const { data: newConv, error: createError } = await supabase
        .from("conversations")
        .insert([
          {
            user_id: user.id,
            title,
            mode: mode || "normal",
            explain_level: explainLevel || "normal",
          },
        ])
        .select()
        .single();

      if (createError) throw new AppError("DB_ERROR", createError.message);
      conversation = newConv;
      currentConversationId = newConv.id;
    } else {
      const { data: existing, error: findError } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", currentConversationId)
        .eq("user_id", user.id)
        .single();

      if (findError || !existing) {
        throw new AuthError("Conversation not found or access denied", 404);
      }
      conversation = existing;
    }

    // B. Insert User Message
    const { error: msgError } = await supabase.from("messages").insert({
      conversation_id: currentConversationId,
      user_id: user.id,
      role: "user",
      content: message,
      attachments: attachments || [],
    });
    if (msgError) throw new AppError("DB_ERROR", msgError.message);

    // C. Build Context
    const { data: history } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", currentConversationId)
      .order("created_at", { ascending: true });

    const contextSummary = formatContext(history || []);

    // D. Generate AI Response
    const safeMode = mode || conversation.mode || "normal";
    const safeTopic = topic || "general";
    const safeLevel = explainLevel || conversation.explain_level || "normal";

    const systemPrompt = generateSystemPrompt(
      safeMode,
      safeTopic,
      safeLevel,
      contextSummary,
      {}
    );

    // Prepare User Content with Attachments
    const userContent = await processAttachments(message, attachments);

    const startTime = Date.now();
    try {
      const completion = await openai.chat.completions.create({
        model: AI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
      });

      const reply = completion.choices[0].message.content;
      const duration = Date.now() - startTime;

      console.log(
        JSON.stringify({
          type: "adi_chat_metric",
          mode: safeMode,
          explainLevel: safeLevel,
          durationMs: duration,
        })
      );

      // E. Insert Assistant Message
      await supabase.from("messages").insert({
        conversation_id: currentConversationId,
        user_id: user.id,
        role: "assistant",
        content: reply,
      });

      // F. Update Conversation
      const updates = { updated_at: new Date().toISOString() };
      if (mode) updates.mode = mode;
      if (explainLevel) updates.explain_level = explainLevel;

      await supabase
        .from("conversations")
        .update(updates)
        .eq("id", currentConversationId);

      // G. Response
      res.json({
        conversationId: currentConversationId,
        reply,
        mode: safeMode,
        topic: safeTopic,
        explainLevel: safeLevel,
      });
    } catch (e) {
      throw new ModelError(e.message);
    }
  })
);

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
