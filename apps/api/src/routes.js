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
  const recent = messages
    .filter((m) => m && m.content && validRoles.includes(m.role))
    .slice(-15);

  return recent
    .map(
      (m) =>
        `${m.role === "user" ? "Usuario" : "WADI"}: ${m.content.substring(0, 500)}`
    )
    .join("\n");
};

// Helper: Process attachments for OpenAI
const processAttachments = async (message, attachments) => {
  if (!attachments || attachments.length === 0) return message;

  // Si hay adjuntos, preparamos el contenido estructurado
  const content = [{ type: "text", text: message }];

  attachments.forEach((att) => {
    const url = typeof att === "string" ? att : att.url;
    if (url && (url.startsWith("data:image") || url.includes("supabase"))) {
      content.push({ type: "image_url", image_url: { url } });
    }
  });

  return content;
};

// Helper: Fetch Past Failures (Long Term Memory)
const fetchUserCriminalRecord = async (userId) => {
  try {
    const { data: audits } = await supabase
      .from("messages")
      .select("content, created_at")
      .eq("user_id", userId)
      .eq("role", "system")
      .ilike("content", "[AUDIT_LOG_V1]%")
      .order("created_at", { ascending: false })
      .limit(3);

    if (!audits || audits.length === 0) return [];
    let failures = [];

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
        console.error("Memory parse error", e);
      }
    }
    return [...new Set(failures)].slice(0, 3);
  } catch (err) {
    return [];
  }
};

const calculateRank = (points) => {
  if (points >= 801) return "ENTIDAD_DE_ORDEN";
  if (points >= 401) return "ESTRATEGA_JUNIOR";
  if (points >= 101) return "CIVIL_PROMEDIO";
  return "GENERADOR_DE_HUMO";
};

// --- ROUTES ---

router.get(
  "/user/criminal-summary",
  asyncHandler(async (req, res) => {
    const user = await getAuthenticatedUser(req);
    if (!user) throw new AuthError("Authentication required");

    const { data: audits } = await supabase
      .from("messages")
      .select("content")
      .eq("user_id", user.id)
      .eq("role", "system")
      .ilike("content", "[AUDIT_LOG_V1]%");

    let totalHighRisks = 0;
    if (audits) {
      audits.forEach((audit) => {
        try {
          const parsed = JSON.parse(
            audit.content.replace("[AUDIT_LOG_V1]\n", "")
          );
          totalHighRisks += (parsed.vulnerabilities || []).filter(
            (v) => v.level === "HIGH"
          ).length;
        } catch (e) {}
      });
    }
    res.json({ totalAudits: audits?.length || 0, totalHighRisks });
  })
);

router.post(
  "/user/admit-failure",
  asyncHandler(async (req, res) => {
    const user = await getAuthenticatedUser(req);
    if (!user) throw new AuthError("Authentication required");

    const { data: profile } = await supabase
      .from("profiles")
      .select("efficiency_points")
      .eq("id", user.id)
      .maybeSingle();
    const newPoints = (profile?.efficiency_points || 0) - 50;
    const newRank = calculateRank(newPoints);

    await supabase.from("profiles").upsert({
      id: user.id,
      active_focus: null,
      efficiency_points: newPoints,
      efficiency_rank: newRank,
      updated_at: new Date().toISOString(),
    });

    res.json({
      reply:
        "Está bien. A veces el plan se rompe y lo más inteligente es soltarlo antes de que nos hunda a los dos. Perdimos un poco de impulso, pero recuperamos la claridad. Borrón y cuenta nueva. ¿Qué tenemos en la cabeza ahora?",
      efficiencyPoints: newPoints,
      efficiencyRank: newRank,
    });
  })
);

// In-memory store for guest sessions (Volatile)
const guestSessions = new Map();

router.post(
  "/chat",
  validateChatInput,
  asyncHandler(async (req, res) => {
    let user = await getAuthenticatedUser(req);

    // Guest Mode: If no user, user stays null, but we proceed carefully.
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
    let history = [];
    let profile = {
      efficiency_rank: "VISITANTE",
      efficiency_points: 0,
      active_focus: null,
    };
    let pastFailures = [];

    // --- CASE A: AUTHENTICATED USER ---
    if (user) {
      if (!currentConversationId) {
        const { data: newConv } = await supabase
          .from("conversations")
          .insert([
            {
              user_id: user.id,
              title: message.substring(0, 60),
              mode: mode || "normal",
              explain_level: explainLevel || "normal",
            },
          ])
          .select()
          .single();
        currentConversationId = newConv.id;
      }

      await supabase.from("messages").insert({
        conversation_id: currentConversationId,
        user_id: user.id,
        role: "user",
        content: message,
        attachments: attachments || [],
      });

      const { data: dbHistory } = await supabase
        .from("messages")
        .select("role, content")
        .eq("conversation_id", currentConversationId)
        .order("created_at", { ascending: true });
      history = dbHistory || [];

      // [SAFETY]: If DB read missed the insert (race condition), manually add current message
      if (history.length === 0) {
        history.push({ role: "user", content: message });
      }

      const { data: dbProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (dbProfile) profile = dbProfile;

      pastFailures = await fetchUserCriminalRecord(user.id);
    }
    // --- CASE B: GUEST MODE (IN-MEMORY) ---
    else {
      if (!currentConversationId) {
        currentConversationId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        guestSessions.set(currentConversationId, []);
      }

      if (!guestSessions.has(currentConversationId)) {
        guestSessions.set(currentConversationId, []);
      }
      history = guestSessions.get(currentConversationId);

      // Add User Message to Memory
      history.push({ role: "user", content: message });

      profile = {
        efficiency_rank: "VISITANTE_CURIOSO",
        efficiency_points: 0,
        active_focus: null,
      };
    }

    // --- COMMON: GENERATE AI RESPONSE ---

    // [FIX]: Ensure history sent to context formatting DOES NOT include the current message.
    // The history fetched from DB (Case A) or Memory (Case B) already includes the current user message at the end.
    // We want the AI to see 'Previous Context' + 'Current Prompt'.
    const previousHistory = history.slice(0, -1);
    const messageCount = previousHistory.length;

    const fullSystemPrompt = generateSystemPrompt(
      mode || "normal",
      topic || "general",
      explainLevel || "normal",
      formatContext(previousHistory), // Only format PREVIOUS messages for context
      {},
      "hostile",
      isMobile,
      messageCount, // Pass count of PREVIOUS messages. 0 = Start.
      pastFailures,
      profile.efficiency_rank,
      profile.efficiency_points,
      profile.active_focus
    );

    const userContent = await processAttachments(message, attachments);

    // Prepare OpenAI Messages: System + Previous History + Current User Message
    const openAIHistory = previousHistory.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const completion = await openai.chat.completions.create({
        model: AI_MODEL,
        messages: [
          { role: "system", content: fullSystemPrompt },
          ...openAIHistory,
          { role: "user", content: userContent },
        ],
      });

      const reply = completion.choices[0].message.content;

      let newPoints = profile.efficiency_points;
      let newRank = profile.efficiency_rank;
      let systemDeath = false;

      // Persistence Update
      if (user) {
        let pointChange = reply.includes("[FOCO_LIBERADO]")
          ? 20
          : reply.includes("[FORCE_DECISION]")
            ? -10
            : 0;
        newPoints += pointChange;
        systemDeath = newPoints <= -50;

        if (systemDeath) {
          await supabase.from("messages").delete().eq("user_id", user.id);
          await supabase.from("conversations").delete().eq("user_id", user.id);
          newPoints = 0;
        }

        newRank = calculateRank(newPoints);

        await supabase.from("profiles").upsert({
          id: user.id,
          efficiency_points: newPoints,
          efficiency_rank: newRank,
          active_focus: reply.includes("[FOCO_LIBERADO]")
            ? null
            : profile.active_focus,
          updated_at: new Date().toISOString(),
        });

        if (!systemDeath) {
          await supabase.from("messages").insert({
            conversation_id: currentConversationId,
            user_id: user.id,
            role: "assistant",
            content: reply,
          });
        }
      } else {
        guestSessions
          .get(currentConversationId)
          .push({ role: "assistant", content: reply });
      }

      res.json({
        reply: systemDeath ? "SYSTEM FAILURE" : reply,
        conversationId: currentConversationId,
        efficiencyPoints: newPoints,
        efficiencyRank: newRank,
        systemDeath,
        isGuest: !user,
      });
    } catch (e) {
      res.status(500).json({ error: "ERROR DE SISTEMA", details: e.message });
    }
  })
);

// --- PROYECTOS (Simplificados) ---
router.get(
  "/projects",
  asyncHandler(async (req, res) => {
    const user = await getAuthenticatedUser(req);
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    res.json(data);
  })
);

router.post(
  "/projects",
  validateProjectInput,
  asyncHandler(async (req, res) => {
    const user = await getAuthenticatedUser(req);
    const { data } = await supabase
      .from("projects")
      .insert([{ ...req.body, user_id: user.id }])
      .select()
      .single();
    res.json(data);
  })
);

router.delete(
  "/projects/:id",
  asyncHandler(async (req, res) => {
    const user = await getAuthenticatedUser(req);
    await supabase
      .from("projects")
      .delete()
      .eq("id", req.params.id)
      .eq("user_id", user.id);
    res.json({ success: true });
  })
);

// Conversations list
router.get(
  "/conversations",
  asyncHandler(async (req, res) => {
    const user = await getAuthenticatedUser(req);
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    res.json(data);
  })
);

router.delete(
  "/conversations/:id",
  asyncHandler(async (req, res) => {
    const user = await getAuthenticatedUser(req);
    await supabase
      .from("conversations")
      .delete()
      .eq("id", req.params.id)
      .eq("user_id", user.id);
    res.json({ success: true });
  })
);

// 1.6 Get Single Conversation (with messages)
router.get(
  "/conversations/:id",
  asyncHandler(async (req, res) => {
    const user = await getAuthenticatedUser(req);
    if (!user) throw new AuthError("Authentication required");
    const { id } = req.params;

    // Obtener metadatos de la conversación
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (convError || !conversation) {
      throw new AppError("NOT_FOUND", "Conversación no encontrada", 404); // Assuming AppError handles this signature or existing error handler does
    }

    // Obtener los mensajes vinculados
    const { data: messages, error: msgError } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    if (msgError) throw new AppError("DB_ERROR", msgError.message);

    res.json({ ...conversation, messages });
  })
);

export default router;
