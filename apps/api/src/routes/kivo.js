import express from "express";
import { generarPrompt } from "../core/prompt-kivo.js";
import { analizarMensaje } from "../core/analisis.js";
import { openai } from "../openai.js";

const router = express.Router();

router.post("/message", async (req, res) => {
  try {
    const { mensajeUsuario, historial } = req.body;

    if (!mensajeUsuario) {
        return res.status(400).json({ error: "Mensaje requerido" });
    }

    const { emocion, modo } = analizarMensaje(mensajeUsuario);

    const prompt = generarPrompt({
      mensajeUsuario,
      emocion,
      modo,
      historial
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: mensajeUsuario }
      ],
    });

    const respuesta = completion.choices[0].message.content;

    res.json({
      respuestaKivo: respuesta,
      emocion,
      modo
    });
  } catch (error) {
    console.error("Error en Kivo backend:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
