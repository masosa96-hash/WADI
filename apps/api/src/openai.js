import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

const useGroq = !!process.env.GROQ_API_KEY;

export const openai = new OpenAI({
  apiKey: useGroq
    ? process.env.GROQ_API_KEY
    : process.env.OPENAI_API_KEY || "dummy-key",
  baseURL: useGroq ? "https://api.groq.com/openai/v1" : undefined,
});

export const AI_MODEL = useGroq ? "llama-3.3-70b-versatile" : "gpt-4o-mini";
