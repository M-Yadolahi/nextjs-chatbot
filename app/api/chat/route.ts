import { NextResponse } from "next/server";

async function fetchWithRetry(url: string, options: RequestInit, retries = 3, delay = 5000) {
    for (let i = 0; i < retries; i++) {
        const res = await fetch(url, options);

        if (res.status === 429) {
            console.warn(`Rate limit hit. Waiting ${delay / 1000}s before retry (${i + 1}/${retries})`);
            await new Promise((r) => setTimeout(r, delay));
            continue; // retry
        }

        if (!res.ok) {
            throw new Error(`API error: ${res.status}`);
        }

        return res;
    }

    throw new Error("Too many retries — rate limit still exceeded");
}

export async function POST(req: Request) {
    const { message } = await req.json();

    try {
        const res = await fetchWithRetry("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
            }
            ,
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: message },
                ],
            }),
        });

        const data = await res.json();
        const reply = data?.choices?.[0]?.message?.content || "Sorry, I couldn’t generate a reply.";

        return NextResponse.json({ reply });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({
            reply: err.message.includes("rate limit")
                ? "Server is busy — please wait a few seconds and try again."
                : "Something went wrong.",
        });
    }
}
