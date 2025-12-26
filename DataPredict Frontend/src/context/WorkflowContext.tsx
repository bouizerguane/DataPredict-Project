import React, { createContext, useContext, ReactNode } from 'react';
import { useWorkflowState, WorkflowState } from '../hooks/useWorkflowState';

interface WorkflowContextType {
    state: WorkflowState;
    updateState: (updates: Partial<WorkflowState>) => void;
    clearState: () => void;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export function WorkflowProvider({ children }: { children: ReactNode }) {
    const { state, updateState, clearState } = useWorkflowState();

    return (
        <WorkflowContext.Provider value={{ state, updateState, clearState }}>
            {children}
        </WorkflowContext.Provider>
    );
}

export function useWorkflow() {
    const context = useContext(WorkflowContext);
    if (context === undefined) {
        throw new Error('useWorkflow must be used within a WorkflowProvider');
    }
    return context;
}
