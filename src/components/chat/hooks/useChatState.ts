import { useState, useCallback } from 'react';

export type ChatMode = 'IDLE' | 'THINKING' | 'STREAMING' | 'ACTION' | 'EXECUTING' | 'FEEDBACK';

export interface ChatState {
    mode: ChatMode;
    thinkingText: string | null;
    pendingAction: PendingAction | null;
    executionSteps: ExecutionStep[];
    streamingSteps: ExecutionStep[];
}

export interface PendingAction {
    id?: string;
    type: string;
    data: any;
    reason: string;
}

export interface ExecutionStep {
    id: number;
    label: string;
    status: 'pending' | 'active' | 'complete' | 'error';
}

const initialState: ChatState = {
    mode: 'IDLE',
    thinkingText: null,
    pendingAction: null,
    executionSteps: [],
    streamingSteps: [],
};

export function useChatState() {
    const [state, setState] = useState<ChatState>(initialState);

    const startThinking = useCallback((text?: string) => {
        setState(prev => ({
            ...prev,
            mode: 'THINKING',
            thinkingText: text || 'Connecting to Cortex...',
            streamingSteps: [],
        }));
    }, []);

    const updateThinking = useCallback((text: string) => {
        setState(prev => ({
            ...prev,
            thinkingText: text,
        }));
    }, []);

    const startStreaming = useCallback(() => {
        setState(prev => ({
            ...prev,
            mode: 'STREAMING',
            thinkingText: null,
        }));
    }, []);

    const updateStreamingStep = useCallback((step: ExecutionStep) => {
        setState(prev => {
            const existing = prev.streamingSteps.find(s => s.id === step.id);
            if (existing) {
                // Update existing
                return {
                    ...prev,
                    streamingSteps: prev.streamingSteps.map(s =>
                        s.id === step.id ? { ...s, ...step } : s
                    )
                };
            } else {
                // Add new
                return {
                    ...prev,
                    streamingSteps: [...prev.streamingSteps, step]
                };
            }
        });
    }, []);

    const showAction = useCallback((action: PendingAction) => {
        setState(prev => ({
            ...prev,
            mode: 'ACTION',
            pendingAction: action,
        }));
    }, []);

    const startExecuting = useCallback((steps?: ExecutionStep[]) => {
        setState(prev => ({
            ...prev,
            mode: 'EXECUTING',
            executionSteps: steps || [
                { id: 1, label: 'Validating request', status: 'pending' },
                { id: 2, label: 'Applying changes', status: 'pending' },
            ],
        }));
    }, []);

    const updateExecutionStep = useCallback((stepId: number, status: ExecutionStep['status']) => {
        setState(prev => ({
            ...prev,
            executionSteps: prev.executionSteps.map(step =>
                step.id === stepId ? { ...step, status } : step
            ),
        }));
    }, []);

    const showFeedback = useCallback(() => {
        setState(prev => ({
            ...prev,
            mode: 'FEEDBACK',
            pendingAction: null,
            executionSteps: [],
        }));
    }, []);

    const reset = useCallback(() => {
        setState(initialState);
    }, []);

    const goIdle = useCallback(() => {
        // Mark all active/pending steps as complete so UI doesn't show "Thinking"
        setState(prev => ({
            ...prev,
            mode: 'IDLE',
            thinkingText: null,
            streamingSteps: prev.streamingSteps.map(step =>
                (step.status === 'active' || step.status === 'pending')
                    ? { ...step, status: 'complete' }
                    : step
            )
        }));
    }, []);

    const cancelAction = useCallback(() => {
        setState(prev => ({
            ...prev,
            mode: 'IDLE',
            pendingAction: null,
        }));
    }, []);

    return {
        ...state,
        // State transitions
        startThinking,
        updateThinking,
        startStreaming,
        updateStreamingStep,
        showAction,
        startExecuting,
        updateExecutionStep,
        showFeedback,
        reset,
        goIdle,
        cancelAction,
        // Convenience getters
        isInputDisabled: state.mode !== 'IDLE',
        isLoading: state.mode === 'THINKING' || state.mode === 'STREAMING' || state.mode === 'EXECUTING',
    };
}

export type UseChatStateReturn = ReturnType<typeof useChatState>;
