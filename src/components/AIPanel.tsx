import { useState } from "react";
import { Plus, X, Sparkles, Archive, Users, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function AIPanel({ onClose }: { onClose: () => void }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const send = () => {
    if (!message.trim()) return;
    setMessages((prev) => [...prev,
      { role: "user", text: message },
      { role: "ai", text: "Got your request! The AI assistant feature is coming soon." },
    ]);
    setMessage("");
  };
  return (
    <div className="fixed bottom-6 right-6 w-[380px] rounded-2xl border border-gray-200 bg-white shadow-2xl flex flex-col overflow-hidden z-50" style={{ height: "520px" }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <button className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 rounded-md hover:bg-gray-50">New chat</button>
        <div className="flex items-center gap-1">
          <button className="p-1 text-gray-400 hover:text-gray-600"><Plus className="w-4 h-4" /></button>
          <button className="p-1 text-gray-400 hover:text-gray-600" onClick={onClose}><X className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-base mb-1.5">What's your question?</p>
              <p className="text-sm text-gray-500 leading-relaxed max-w-[260px]">I can help with document workflow, statuses, and DocTrack projects.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[80%] rounded-2xl px-3 py-2 text-sm", m.role === "user" ? "bg-blue-600 text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm")}>{m.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="border-t border-gray-100 p-3">
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200 focus-within:border-blue-300 focus-within:bg-white transition-colors">
          <input className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400" placeholder="Задайте вопрос..." value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") send(); }} />
          <button onClick={send} className={cn("w-7 h-7 rounded-lg flex items-center justify-center transition-colors", message.trim() ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-200 text-gray-400")}>Send</button>
        </div>
        <div className="flex items-center justify-around mt-2.5 text-[11px] text-gray-400">
          <button className="flex items-center gap-1 hover:text-gray-600 transition-colors"><Archive className="w-3 h-3" /> Knowledge Base</button>
          <button className="flex items-center gap-1 hover:text-gray-600 transition-colors"><Users className="w-3 h-3" /> Support</button>
          <button className="flex items-center gap-1 hover:text-gray-600 transition-colors"><Settings className="w-3 h-3" /> Consultation</button>
        </div>
      </div>
    </div>
  );
}

export default AIPanel;
