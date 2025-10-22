"use client";

import { useState, useRef, useEffect } from "react";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const chatBoxRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    chatBoxRef.current?.scrollTo({
      top: chatBoxRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: "شما", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();

      setMessages([...newMessages, { sender: "چت‌بات", text: data.reply }]);
    } catch (err) {
      setMessages([...newMessages, { sender: "چت‌بات", text: "خطایی رخ داد." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>چت با هوش مصنوعی</h1>
      <div style={styles.chatBox} ref={chatBoxRef}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              ...styles.message,
              alignSelf: msg.sender === "شما" ? "flex-end" : "flex-start",
              backgroundColor: msg.sender === "شما" ? "#000" : "#fff",
              color: msg.sender === "شما" ? "#fff" : "#000",
            }}
          >
            <strong>{msg.sender}: </strong>
            <span>{msg.text}</span>
          </div>
        ))}
        {loading && <div style={styles.loading}>در حال ارسال...</div>}
      </div>
      <div style={styles.inputContainer}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="پیام خود را تایپ کنید..."
          style={styles.input}
        />
        <button onClick={sendMessage} style={styles.button}>
          ارسال
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: "600px",
    margin: "50px auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    direction: "rtl", // Right-to-left for Persian
    fontFamily: "Tahoma, sans-serif",
  },
  header: {
    textAlign: "center",
    marginBottom: "20px",
  },
  chatBox: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    minHeight: "300px",
    maxHeight: "350px",
    overflowY: "auto",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    backgroundColor: "#f9f9f9",
  },
  message: {
    padding: "8px 12px",
    borderRadius: "15px",
    maxWidth: "80%",
    wordWrap: "break-word",
  },
  loading: {
    fontStyle: "italic",
    color: "#555",
    alignSelf: "center",
  },
  inputContainer: {
    display: "flex",
    marginTop: "15px",
    gap: "10px",
  },
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  button: {
    padding: "10px 20px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#000",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },
};
