const OPENAI_API_KEY =
  process.env.EXPO_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY || "";

export async function getOpenAICareSuggestion(prompt: string) {
  if (!OPENAI_API_KEY) {
    return {
      success: false,
      text: "OpenAI API key no configurada. Agrega EXPO_PUBLIC_OPENAI_API_KEY.",
    };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Eres un asistente experto en cuidado de bonsáis.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 300,
        temperature: 0.8,
      }),
    });

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;

    return {
      success: true,
      text: text || "No se pudo generar una sugerencia de OpenAI.",
    };
  } catch (error) {
    console.error("OpenAI error:", error);
    return {
      success: false,
      text: "Error al conectar con OpenAI.",
    };
  }
}
