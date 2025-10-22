import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { message } = await req.json();

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: message },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("OpenRouter error:", res.status, text);
      throw new Error(`OpenRouter API error: ${res.status}`);
    }

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content || "Sorry, I couldn’t generate a reply.";
    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error("API route error:", err);
    return NextResponse.json({ reply: "Something went wrong. Check server logs." });
  }
}
