import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";
import { AGENT_WORKFLOW } from "@/lib/agentWorkflow";

export function AgentOrchestrator() {
  const navigate = useNavigate();
  const workflowActive = useAppStore((s) => s.workflowActive);
  const workflowStep = useAppStore((s) => s.workflowStep);
  const advanceWorkflow = useAppStore((s) => s.advanceWorkflow);

  useEffect(() => {
    if (!workflowActive) return;
    const step = AGENT_WORKFLOW[workflowStep];
    if (!step) {
      useAppStore.getState().finishWorkflow();
      return;
    }

    useAppStore.getState().applyWorkflowStep(step);

    if (step.route) {
      navigate(step.route);
    }

    const timer = setTimeout(() => {
      advanceWorkflow();
    }, step.delay);

    return () => clearTimeout(timer);
  }, [workflowActive, workflowStep, navigate, advanceWorkflow]);

  return null;
}
