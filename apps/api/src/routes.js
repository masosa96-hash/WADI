import { Router } from "express";
import { randomUUID } from "crypto";
import { openai, AI_MODEL } from "./openai.js";
import { WADI_SYSTEM_PROMPT, generateSystemPrompt } from "./wadi-brain.js";
import { supabase } from "./supabase.js";
import { AppError, AuthError, ModelError } from "./core/errors.js";
import {
  getSessionMemory,
  updateSessionMemory,
  summarizeMessages,
} from "./memory/sessionMemory.js";
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

  // Verify token with Supabase (JWT verification)
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) return null;
  return user;
};

// Helper: Async Wrapper for error handling
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ------------------------------------------------------------------
// PUBLIC / SEMI-PUBLIC ROUTES (Chat can be anonymous for guest?)
// Current requirements imply "Iniciá tu primera conversación" so maybe?
// Critical block didn't specify strict auth for chat, but "RLS" for data.
// We'll keep chat open or check logic. Current Frontend uses guest login.
// Guest login produces a token! So we can treat it as Authenticated.
// ------------------------------------------------------------------

router.post(
  "/chat",
  validateChatInput,
  asyncHandler(async (req, res) => {
    const { message, mode, topic, explainLevel, tutorMode, sessionId } =
      req.body;

    // 1. Session Management
    const currentSessionId = sessionId || randomUUID();
    const memory = getSessionMemory(currentSessionId);
    const contextSummary = summarizeMessages(memory.messages);
    const userPrefs = memory.preferences;

    // 2. Resolve Parameters (Priority: Request > Memory > Default)
    const safeMode = mode || "normal";
    const safeTopic = topic || "general";
    const safeLevel =
      explainLevel || userPrefs.preferredExplainLevel || "normal";

    // 3. Generate Prompt with Memory
    const systemPrompt = generateSystemPrompt(
      safeMode,
      safeTopic,
      safeLevel,
      contextSummary,
      userPrefs
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

      // 4. Update Memory (Async/Non-blocking)
      updateSessionMemory(currentSessionId, message, reply, {
        explainLevel: explainLevel || undefined, // Update if explicit
        // simple heuristic: if message is short/slang, maybe tone change? kept simple for now
      });

      // 5. Build Response
      let tutorMeta = null;
      if (safeMode === "tutor" && tutorMode) {
        tutorMeta = {
          currentStep: (tutorMode.currentStep || 0) + 0,
          totalSteps: tutorMode.totalSteps || 5,
        };
      }

      res.json({
        reply,
        sessionId: currentSessionId,
        mode: safeMode,
        topic: safeTopic,
        explainLevel: safeLevel,
        meta: { usedContext: !!contextSummary },
        tutorMeta,
      });
    } catch (e) {
      throw new ModelError(e.message);
    }
  })
);

// ------------------------------------------------------------------
// PROTECTED ROUTES (Projects & Runs)
// ------------------------------------------------------------------

router.get(
  "/projects",
  asyncHandler(async (req, res) => {
    const user = await getAuthenticatedUser(req);
    if (!user) throw new AuthError("Authentication required (Bearer token)");

    // Secure: Force user_id match
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

    // Secure: Use user.id from token
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

router.get(
  "/projects/:id/runs",
  asyncHandler(async (req, res) => {
    const user = await getAuthenticatedUser(req);
    if (!user) throw new AuthError("Authentication required");
    const { id } = req.params;

    // Secure: Verify project ownership first
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

    // Secure: Verify project ownership
    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!project)
      throw new AuthError("Access denied or project not found", 403);

    // 1. Create run (with user_id if column exists, safe to add usually)
    const { data: run, error: runError } = await supabase
      .from("runs")
      .insert([{ project_id: id, input, user_id: user.id }])
      .select()
      .single();

    if (runError) throw new AppError("DB_ERROR", runError.message);

    // 2. Generate AI
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: input }],
      });
      const output = completion.choices[0].message.content;

      // 3. Update run
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
