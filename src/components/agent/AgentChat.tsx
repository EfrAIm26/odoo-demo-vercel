import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { Send, X, Maximize2, Minimize2, Mic, MicOff } from "lucide-react";
import { useAppStore, getForkastProduct } from "@/store/useAppStore";
import { sendChatMessage } from "@/lib/api";
import { shouldRunDemoWorkflow, JURY_DEMO_PROMPT } from "@/lib/agentWorkflow";
import { useSpeechInput } from "@/hooks/useSpeechInput";

function renderMarkdown(text: string) {
  return text.split("\n").map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <div key={i}>
        {parts.map((part, j) =>
          part.startsWith("**") && part.endsWith("**") ? (
            <strong key={j}>{part.slice(2, -2)}</strong>
          ) : (
            <span key={j}>{part}</span>
          )
        )}
      </div>
    );
  });
}

export function AgentChat() {
  const chatOpen = useAppStore((s) => s.chatOpen);
  const chatExpanded = useAppStore((s) => s.chatExpanded);
  const setChatOpen = useAppStore((s) => s.setChatOpen);
  const setChatExpanded = useAppStore((s) => s.setChatExpanded);
  const messages = useAppStore((s) => s.chatMessages);
  const addChatMessage = useAppStore((s) => s.addChatMessage);
  const chatLoading = useAppStore((s) => s.chatLoading);
  const setChatLoading = useAppStore((s) => s.setChatLoading);
  const executeActions = useAppStore((s) => s.executeActions);
  const forkast = useAppStore((s) => s.forkast);
  const workflowActive = useAppStore((s) => s.workflowActive);
  const startWorkflow = useAppStore((s) => s.startWorkflow);
  const [input, setInput] = useState("");
  const msgsRef = useRef<HTMLDivElement>(null);

  const product = getForkastProduct(forkast.productId);

  const scrollChatToBottom = useCallback((smooth = true) => {
    const el = msgsRef.current;
    if (!el) return;
    const run = () => {
      el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    };
    run();
    requestAnimationFrame(() => {
      run();
      requestAnimationFrame(run);
    });
  }, []);

  useEffect(() => {
    if (chatOpen) scrollChatToBottom(false);
  }, [chatOpen, scrollChatToBottom]);

  useEffect(() => {
    if (!chatOpen) return;
    scrollChatToBottom(true);
  }, [messages, chatLoading, workflowActive, chatOpen, scrollChatToBottom]);

  const processUserMessage = useCallback(async (text: string, fromVoice = false) => {
    if (!text || chatLoading || workflowActive) return;

    const userMsg = {
      id: Date.now().toString(),
      role: "user" as const,
      content: fromVoice ? `${text} 🎤` : text,
    };
    addChatMessage(userMsg);
    setChatOpen(true);

    if (shouldRunDemoWorkflow(text)) {
      setChatExpanded(true);
      addChatMessage({
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: fromVoice
          ? "Te escuché. Ejecuto el flujo completo: pronóstico → merma → inventario → finanzas → órdenes de compra → factura. No necesitas moverte."
          : "Perfecto. Ejecuto el flujo completo: pronóstico → merma → inventario → finanzas → órdenes de compra → factura. No necesitas moverte, yo navego por ti.",
      });
      setTimeout(() => startWorkflow(), 600);
      return;
    }

    setChatLoading(true);
    try {
      const history = [...useAppStore.getState().chatMessages]
        .filter((m) => m.role !== "system")
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content.replace(" 🎤", "") }));

      const { text: reply, actions } = await sendChatMessage(history, {
        product: product.name,
        wastePct: forkast.kpis.wastePct,
        dailyProduction: forkast.daily,
        loss: forkast.kpis.loss,
      });

      addChatMessage({
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: reply,
        actions: actions as import("@/types").AgentAction[],
      });

      const safeActions = (actions ?? []).filter(
        (a) => a.type !== "open_inventory"
      ) as import("@/types").AgentAction[];
      if (safeActions.length) executeActions(safeActions);
    } catch (e) {
      addChatMessage({
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: e instanceof Error ? e.message : "Error de conexión.",
      });
    } finally {
      setChatLoading(false);
    }
  }, [chatLoading, workflowActive, addChatMessage, setChatOpen, setChatExpanded, startWorkflow, setChatLoading, executeActions, product, forkast]);

  const { listening, supported, startListening, stopListening } = useSpeechInput((text) => {
    setInput(text);
    processUserMessage(text, true);
  });

  async function handleSend() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    await processUserMessage(text);
  }

  if (!chatOpen) return null;

  return (
    <motion.div
      className={`chat-panel ${chatExpanded || workflowActive ? "expanded" : ""}`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10 }}
    >
      <div className="chat-header">
        <span>Foodie 🍽️ · Smart Food AI {workflowActive && <span className="agent-live">● En vivo</span>}</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button type="button" onClick={() => setChatExpanded(!chatExpanded)} aria-label="Expandir">
            {chatExpanded ? <Minimize2 size={16} color="#fff" /> : <Maximize2 size={16} color="#fff" />}
          </button>
          <button type="button" onClick={() => setChatOpen(false)} aria-label="Cerrar">
            <X size={18} color="#fff" />
          </button>
        </div>
      </div>

      <div className="chat-msgs" ref={msgsRef}>
        {messages.map((m) => (
          <div key={m.id} className={`chat-msg ${m.role}`}>
            {m.role === "assistant" ? (
              <div className="chat-content">{renderMarkdown(m.content)}</div>
            ) : (
              m.content
            )}
          </div>
        ))}
        {chatLoading && !workflowActive && (
          <div className="chat-msg assistant">Analizando datos de Patty Pastelería...</div>
        )}
      </div>

      <div className="chat-input-row">
        {supported && (
          <button
            type="button"
            className={`btn btn-mic ${listening ? "listening" : ""}`}
            onClick={listening ? stopListening : startListening}
            disabled={workflowActive}
            aria-label={listening ? "Detener micrófono" : "Hablar"}
            title="Pulsa y di el comando demo"
          >
            {listening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        )}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={listening ? "Escuchando..." : workflowActive ? "Agente ejecutando flujo..." : `Ej: ${JURY_DEMO_PROMPT.slice(0, 45)}...`}
          disabled={workflowActive || listening}
        />
        <button type="button" className="btn btn-primary" onClick={handleSend} disabled={chatLoading || workflowActive || listening}>
          <Send size={16} />
        </button>
      </div>
    </motion.div>
  );
}
