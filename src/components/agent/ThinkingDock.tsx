import type { CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Brain } from "lucide-react";import { useAppStore } from "@/store/useAppStore";
import { AGENT_WORKFLOW, FLOW_STAGES } from "@/lib/agentWorkflow";

export function ThinkingDock() {
  const workflowActive = useAppStore((s) => s.workflowActive);
  const workflowStep = useAppStore((s) => s.workflowStep);
  const thinkingChain = useAppStore((s) => s.thinkingChain);
  const workflowPhase = useAppStore((s) => s.workflowPhase);
  const dockExpanded = useAppStore((s) => s.thinkingDockExpanded);
  const setDockExpanded = useAppStore((s) => s.setThinkingDockExpanded);

  const visible = workflowActive || thinkingChain.length > 0;
  if (!visible) return null;

  const currentStageIdx = FLOW_STAGES.findIndex((s) => s.id === workflowPhase);

  return (
    <AnimatePresence>
      <motion.div
        className={`thinking-dock ${dockExpanded ? "expanded" : ""}`}
        initial={{ y: 120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 120, opacity: 0 }}
      >
        <div className="thinking-dock-bar">
          <div className="thinking-dock-left">
            <Brain size={16} className="thinking-dock-icon" />
            <span className="thinking-dock-title">Foodie 🍽️</span>
            {workflowActive && <span className="thinking-dock-live">ejecutando</span>}
          </div>
          <button type="button" className="thinking-dock-toggle" onClick={() => setDockExpanded(!dockExpanded)}>
            {dockExpanded ? "Minimizar" : "Expandir"}
          </button>
        </div>

        <div className="flow-pipeline">
          {FLOW_STAGES.map((stage, i) => {
            const done = currentStageIdx > i || (!workflowActive && thinkingChain.length > 0);
            const active = workflowActive && stage.id === workflowPhase;
            return (
              <div key={stage.id} className="flow-pipeline-item">
                <motion.div
                  className={`flow-node ${done ? "done" : ""} ${active ? "active" : ""}`}
                  style={{ "--flow-color": stage.color } as CSSProperties}
                  animate={active ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ repeat: active ? Infinity : 0, duration: 1.5 }}
                >
                  <span className="flow-node-icon">{stage.icon}</span>
                  <span className="flow-node-label">{stage.label}</span>
                </motion.div>
                {i < FLOW_STAGES.length - 1 && (
                  <ChevronRight size={14} className={`flow-arrow ${done ? "done" : ""}`} />
                )}
              </div>
            );
          })}
        </div>

        {dockExpanded && (
          <motion.div
            className="thinking-dock-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
          >
            <div className="thinking-stream">
              {thinkingChain.map((t, i) => {
                const step = AGENT_WORKFLOW[Math.min(i, AGENT_WORKFLOW.length - 1)];
                const stage = FLOW_STAGES.find((s) => s.id === (step?.phase || workflowPhase));
                return (
                  <motion.div
                    key={i}
                    className="thinking-line"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ borderLeftColor: stage?.color || "#40916c" }}
                  >
                    <span className="thinking-line-tag" style={{ color: stage?.color }}>{stage?.label || "Paso"}</span>
                    {t}
                  </motion.div>
                );
              })}
              {workflowActive && (
                <div className="thinking-line active" style={{ borderLeftColor: FLOW_STAGES[currentStageIdx]?.color }}>
                  <span className="thinking-cursor" />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
