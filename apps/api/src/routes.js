import { Router } from "express";
import { openai } from "./openai.js";

const router = Router();

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: message }]
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// Projects Routes
import { supabase } from "./supabase.js";

router.get("/projects", async (req, res) => {
  const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post("/projects", async (req, res) => {
  const { name, description } = req.body;
  const { data, error } = await supabase.from("projects").insert([{ name, description }]).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.get("/projects/:id/runs", async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from("runs").select("*").eq("project_id", id).order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post("/projects/:id/runs", async (req, res) => {
  const { id } = req.params;
  const { input } = req.body;
  
  // 1. Create run entry
  const { data: run, error: runError } = await supabase.from("runs").insert([{ project_id: id, input }]).select().single();
  if (runError) return res.status(500).json({ error: runError.message });

  // 2. Generate AI response
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: input }]
    });
    const output = completion.choices[0].message.content;

    // 3. Update run with output
    const { data: updatedRun, error: updateError } = await supabase
      .from("runs")
      .update({ output })
      .eq("id", run.id)
      .select()
      .single();

    if (updateError) return res.status(500).json({ error: updateError.message });
    
    res.json(updatedRun);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
