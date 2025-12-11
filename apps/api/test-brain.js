const testCases = [
  // 1. Psycho / Emotional
  {
    message: "Estoy agotado de estar siempre para los demás y nunca para mí.",
    mode: "normal",
    topic: "general",
  },
  {
    message:
      "Analizá esto un poco más profundo: siento que no tengo lugar en ningún lado.",
    mode: "normal",
    topic: "general",
  },
  {
    message: "Siento culpa cuando digo que no, ¿qué ves ahí?",
    mode: "normal",
    topic: "general",
  },

  // 2. Technical / Practical
  {
    message:
      "Tengo este error en React: Cannot read property 'map' of undefined",
    mode: "normal",
    topic: "tech",
  },
  {
    message: "Ayudame a ordenar mi semana de trabajo en pasos claros.",
    mode: "normal",
    topic: "general",
  },
  {
    message: "Quiero ideas de marketing para vender servicios de fotografía.",
    mode: "normal",
    topic: "biz",
  },
];

async function runTests() {
  console.log("Starting WADI Brain Tests...\n");

  for (const test of testCases) {
    console.log(`INPUT: "${test.message}" (Topic: ${test.topic})`);
    try {
      const startTime = Date.now();
      const response = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(test),
      });
      const data = await response.json();
      const duration = Date.now() - startTime;

      console.log(`RESPONSE (${duration}ms):`);
      console.log(data.reply);
      console.log("-".repeat(50));
    } catch (error) {
      console.error("ERROR:", error.message);
    }
    console.log("\n");
  }
}

runTests();
