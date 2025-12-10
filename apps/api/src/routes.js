import { Router } from "express";
import { openai, AI_MODEL } from "./openai.js";
import { WADI_SYSTEM_PROMPT, generateSystemPrompt } from "./wadi-brain.js";

const router = Router();

router.post("/chat", async (req, res) => {
  try {
    const { message, mode, topic, explainLevel, tutorMode } = req.body;

    // Default values if missing
    const safeMode = mode || "normal";
    const safeTopic = topic || "general";
    const safeLevel = explainLevel || "normal";

    const systemPrompt = generateSystemPrompt(safeMode, safeTopic, safeLevel);

    // Future: Use tutorMode currentStep logic here if we were implementing "Smart Tutor" backend state.
    // For now, prompt instruction handles "Guia paso a paso".

    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    });

    // Mock Tutor Meta for now (could be real in future)
    let tutorMeta = null;
    if (safeMode === "tutor" && tutorMode) {
      // Simple increment logic mock
      tutorMeta = {
        currentStep: (tutorMode.currentStep || 0) + 0, // No increment logic yet, just echo
        totalSteps: tutorMode.totalSteps || 5,
      };
    }

    res.json({ reply: completion.choices[0].message.content, tutorMeta });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// Projects Routes
import { supabase } from "./supabase.js";

router.get("/projects", async (req, res) => {
  const { user_id } = req.query;

  let query = supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (user_id) {
    query = query.eq("user_id", user_id);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post("/projects", async (req, res) => {
  const { name, description, user_id } = req.body;
  const { data, error } = await supabase
    .from("projects")
    .insert([{ name, description, user_id }])
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.get("/projects/:id/runs", async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("runs")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post("/projects/:id/runs", async (req, res) => {
  const { id } = req.params;
  const { input } = req.body;

  // 1. Create run entry
  const { data: run, error: runError } = await supabase
    .from("runs")
    .insert([{ project_id: id, input }])
    .select()
    .single();
  if (runError) return res.status(500).json({ error: runError.message });

  // 2. Generate AI response
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: input }],
    });
    const output = completion.choices[0].message.content;

    // 3. Update run with output
    const { data: updatedRun, error: updateError } = await supabase
      .from("runs")
      .update({ output })
      .eq("id", run.id)
      .select()
      .single();

    if (updateError)
      return res.status(500).json({ error: updateError.message });

    res.json(updatedRun);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
