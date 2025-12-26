import { useState, useEffect } from 'react';

// Define the shape of our workflow state
export interface WorkflowState {
    datasetId: string | null;
    preprocessingResult: any | null;
    droppedColumns: string[] | null;
    featureSelectionResult: any | null;
    selectedModel: any | null;
    recommendations: any[] | null;
    trainingResults: any | null;
    targetVariable: string | null;
    rowCount: number | null;
    columnCount: number | null;
    contentType: string | null;
    datasetDescription: string | null;
    step: number;
}

const STORAGE_KEY = 'datapredict_workflow_state';

const initialState: WorkflowState = {
    datasetId: null,
    preprocessingResult: null,
    droppedColumns: null,
    featureSelectionResult: null,
    selectedModel: null,
    recommendations: null,
    trainingResults: null,
    targetVariable: null,
    rowCount: null,
    columnCount: null,
    contentType: null,
    datasetDescription: null,
    step: 1
};

export function useWorkflowState() {
    const [state, setState] = useState<WorkflowState>(() => {
        // Initialize from storage if available
        try {
            const stored = sessionStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : initialState;
        } catch (e) {
            console.error("Failed to load workflow state", e);
            return initialState;
        }
    });

    // Auto-save whenever state changes
    useEffect(() => {
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.error("Failed to save workflow state", e);
        }
    }, [state]);

    const updateState = (updates: Partial<WorkflowState>) => {
        setState(prev => ({ ...prev, ...updates }));
    };

    const clearState = () => {
        setState(initialState);
        sessionStorage.removeItem(STORAGE_KEY);
    };

    return {
        state,
        updateState,
        clearState
    };
}
