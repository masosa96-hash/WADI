import { Router } from "express";
import { openai, AI_MODEL } from "./openai.js";
import { WADI_SYSTEM_PROMPT, generateSystemPrompt } from "./wadi-brain.js";

const router = Router();

router.post("/chat", async (req, res) => {
  try {
    const { message, preferences, tutorMode, mode, tone } = req.body;

    // Determine Mode and Tone
    // Prioritize explicit top-level fields, fallback to preferences/tutorMode if needed
    // However, frontend will likely send them in top-level or preferences.
    // Let's assume frontend sends: { message, mode, tone, ... } OR uses preferences.
    // The previous frontend code sent {...preferences}, so we might receive `tone` directly.
    // But `mode` is new.

    // Effective Mode:
    // If tutorMode.active is true, force "tutor" unless "mode" is explicitly something else?
    // Actually, user said: "mode = tutor activates tutor instructions".
    // So if tutorMode.active is true, we should probably default mode to 'tutor'.
    // But let's rely on the `mode` field passed from frontend which we will implement next.
    // Fallback to 'general' if missing.

    const safeMode = mode || (tutorMode?.active ? "tutor" : "general");
    const safeTone = tone || preferences?.tone || "explanatory";

    const systemPrompt = generateSystemPrompt(safeMode, safeTone);

    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    });

    res.json({ reply: completion.choices[0].message.content });
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
