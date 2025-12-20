import { Router } from "express";
import { openai, AI_MODEL } from "./openai.js";
import { generateSystemPrompt, generateAuditPrompt } from "./wadi-brain.js";
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

  const validRoles = ["user", "assistant", "system"];

  // Filter valid messages and take last 10
  const recent = messages
    .filter((m) => m && m.content && validRoles.includes(m.role))
    .slice(-10);

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

// 1.5 Get All Conversations
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

// 1.6 Get Single Conversation (with messages)
router.get(
  "/conversations/:id",
  asyncHandler(async (req, res) => {
    const user = await getAuthenticatedUser(req);
    if (!user) throw new AuthError("Authentication required");
    const { id } = req.params;

    // Get conversation details
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

// 1.7 Delete Conversation
router.delete(
  "/conversations/:id",
  asyncHandler(async (req, res) => {
    const user = await getAuthenticatedUser(req);
    if (!user) throw new AuthError("Authentication required");
    const { id } = req.params;

    // Check ownership
    const { count, error: checkError } = await supabase
      .from("conversations")
      .select("*", { count: "exact", head: true })
      .eq("id", id)
      .eq("user_id", user.id);

    if (checkError || count === 0) {
      throw new AuthError("Conversation not found or access denied", 404);
    }

    // Delete (Cascade should handle messages if configured, but let's be safe)
    // If cascade is NOT set in DB, we'd need to delete messages first.
    // User mentioned: "If deletion fails due to FK, generate SQL".
    // We will try to delete conversation directly.

    const { error: delError } = await supabase
      .from("conversations")
      .delete()
      .eq("id", id);

    if (delError) {
      // Fallback: Delete messages first
      await supabase.from("messages").delete().eq("conversation_id", id);
      const { error: retryError } = await supabase
        .from("conversations")
        .delete()
        .eq("id", id);
      if (retryError) throw new AppError("DB_ERROR", retryError.message);
    }

    res.json({ success: true, message: "Conversation deleted" });
  })
);

// 2. Send Message (Persistent)
// Helper: Process attachments for OpenAI
// Helper: Process attachments for OpenAI
const processAttachments = async (message, attachments) => {
  // ... (existing logic)
};

// Helper: Fetch Past Failures (Long Term Memory)
const fetchUserCriminalRecord = async (userId) => {
  try {
    // 1. Get last 5 audit logs
    const { data: audits } = await supabase
      .from("messages")
      .select("content, created_at")
      .eq("user_id", userId)
      .eq("role", "system")
      .ilike("content", "[AUDIT_LOG_V1]%") // Check for audit tag
      .order("created_at", { ascending: false })
      .limit(3);

    if (!audits || audits.length === 0) return [];

    let failures = [];

    // 2. Extract HIGH vulnerabilities
    for (const audit of audits) {
      try {
        const jsonPart = audit.content.replace("[AUDIT_LOG_V1]\n", "");
        const parsed = JSON.parse(jsonPart);
        const dateStr = new Date(audit.created_at).toISOString().split("T")[0];

        const highRisk = (parsed.vulnerabilities || [])
          .filter((v) => v.level === "HIGH")
          .map((v) => `${v.title} (${dateStr})`);

        failures = [...failures, ...highRisk];
      } catch (e) {
        console.error("Error parsing audit log memory:", e);
      }
    }

    // Deduplicate and limit
    return [...new Set(failures)].slice(0, 3);
  } catch (err) {
    console.warn("Memory fetch error", err);
    return [];
  }
};

// 1.9 User Criminal Summary (Criminal Record)
router.get(
  "/user/criminal-summary",
  asyncHandler(async (req, res) => {
    const user = await getAuthenticatedUser(req);
    if (!user) throw new AuthError("Authentication required");

    // Count Total Audits
    const { count: totalAudits, data: audits } = await supabase
      .from("messages")
      .select("content", { count: "exact" })
      .eq("user_id", user.id)
      .eq("role", "system")
      .ilike("content", "[AUDIT_LOG_V1]%");

    let totalHighRisks = 0;

    // Count High Risks
    if (audits) {
      audits.forEach((audit) => {
        try {
          const jsonPart = audit.content.replace("[AUDIT_LOG_V1]\n", "");
          const parsed = JSON.parse(jsonPart);
          const highRiskCount = (parsed.vulnerabilities || []).filter(
            (v) => v.level === "HIGH"
          ).length;
          totalHighRisks += highRiskCount;
        } catch (e) {
          // ignore parse error
        }
      });
    }

    res.json({ totalAudits: totalAudits || 0, totalHighRisks });
  })
);

// ... (Inside the endpoints, replace the logic)

// 1.8 Audit Conversation (NEW)
router.get(
  "/conversations/:id/audit",
  asyncHandler(async (req, res) => {
    const user = await getAuthenticatedUser(req);
    if (!user) throw new AuthError("Authentication required");
    const { id } = req.params;

    // 1. Fetch entire conversation history from DB
    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true }); // We need chronological order for audit

    if (error) throw new AppError("DB_ERROR", error.message);
    if (!messages || messages.length === 0) {
      return res.json({
        vulnerabilities: [
          {
            level: "HIGH",
            title: "SILENCIO PREOCUPANTE",
            description:
              "No hay historial para auditar. El vacío es el mayor riesgo.",
          },
        ],
      });
    }

    // 2. Format Context for LLM
    const context = formatContext(messages);

    // 3. Call LLM
    const systemPrompt = generateAuditPrompt();

    try {
      const completion = await openai.chat.completions.create({
        model: AI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `AUDIT THIS CONVERSATION HISTORY:\n---\n${context}\n---`,
          },
        ],
        temperature: 0.5,
        response_format: { type: "json_object" },
      });

      const outputContent = completion.choices[0].message.content;
      let vulnerabilities = [];
      try {
        const parsed = JSON.parse(outputContent);
        if (Array.isArray(parsed)) vulnerabilities = parsed;
        else if (parsed.vulnerabilities)
          vulnerabilities = parsed.vulnerabilities; // Common wrapper
        else vulnerabilities = [];
      } catch (e) {
        console.error("Failed to parse Audit JSON", e);
        throw new ModelError("AI Audit returned invalid JSON");
      }

      res.json({ vulnerabilities });

      // 4. PERSIST AUDIT (For Long Term Memory)
      if (vulnerabilities.length > 0) {
        await supabase.from("messages").insert({
          conversation_id: id,
          user_id: user.id,
          role: "system",
          content: `[AUDIT_LOG_V1]\n${JSON.stringify({ vulnerabilities })}`,
        });
      }
    } catch (err) {
      throw new ModelError(String(err));
    }
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

    const historyCount = history ? history.length : 0;
    const systemPrompt = generateSystemPrompt(
      safeMode,
      safeTopic,
      safeLevel,
      contextSummary,
      {},
      "hostile",
      false,
      historyCount
    );

    // Prepare User Content (String or Array)
    const userContent = await processAttachments(message, attachments);

    // Filter valid history for OpenAI
    const openAIHistory = (history || []).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const completion = await openai.chat.completions.create({
        model: AI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          ...openAIHistory,
          { role: "user", content: userContent },
        ],
      });

      const reply = completion.choices[0].message.content;

      // D. Save Messages to DB
      // 1. User Message
      // We store the RAW text in 'content' for legacy compatibility,
      // AND arrays in 'attachments' column.
      // ...
      // D. Save Messages to DB
      // 1. User Message
      await supabase.from("messages").insert({
        conversation_id: id,
        user_id: user.id,
        role: "user",
        content: message,
        attachments: attachments
          ? attachments.map((a) => (typeof a === "string" ? a : a.url))
          : [],
      });
      // ...

      // ...
      // B. Insert User Message
      const { error: msgError } = await supabase.from("messages").insert({
        conversation_id: currentConversationId,
        user_id: user.id,
        role: "user",
        content: message,
        attachments: attachments
          ? attachments.map((a) => (typeof a === "string" ? a : a.url))
          : [],
      });
      // ...

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

    const {
      message,
      conversationId,
      mode,
      explainLevel,
      topic,
      attachments,
      isMobile,
    } = req.body;
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
    const historyCount = history ? history.length : 0;

    // 1. Fetch Past Failures
    const pastFailures = await fetchUserCriminalRecord(user.id);

    const systemPrompt = generateSystemPrompt(
      safeMode,
      safeTopic,
      safeLevel,
      contextSummary,
      {},
      "hostile",
      isMobile,
      historyCount,
      pastFailures // INJECTED MEMORY
    );

    // Prepare User Content with Attachments
    const userContent = await processAttachments(message, attachments);

    // Filter valid history for OpenAI
    const openAIHistory = (history || []).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const startTime = Date.now();
    try {
      const completion = await openai.chat.completions.create({
        model: AI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          ...openAIHistory,
          { role: "user", content: userContent },
        ],
      });

      const reply = completion.choices[0].message.content;
      const duration = Date.now() - startTime;

      console.log(
        JSON.stringify(
          {
            type: "ADI_CEREBRO_AUDIT",
            timestamp: new Date().toISOString(),
            userId: user.id || "anon",
            workflow: {
              mode: safeMode,
              explainLevel: safeLevel,
              topic: safeTopic,
            },
            performance: {
              durationMs: duration,
              completionTokens: completion.usage?.completion_tokens,
              promptTokens: completion.usage?.prompt_tokens,
            },
            contentSample: {
              input: message.substring(0, 50),
              output: reply.substring(0, 50) + "...",
            },
            status: "SUCCESS",
          },
          null,
          2
        )
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
      console.error("[CRITICAL API ERROR]:", e);
      // Return JSON directly to prevent HTML fallback
      res.status(500).json({
        error: "ERROR DE SISTEMA - FRICCIÓN CRÍTICA",
        details: e.message,
      });
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
