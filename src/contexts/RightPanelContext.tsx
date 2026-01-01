import { useState, createContext, useContext, ReactNode } from 'react';

interface RightPanelContextType {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    content: ReactNode | null;
    setContent: (content: ReactNode | null) => void;
    title: string;
    setTitle: (title: string) => void;
}

const RightPanelContext = createContext<RightPanelContextType | null>(null);

export function RightPanelProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [content, setContent] = useState<ReactNode | null>(null);
    const [title, setTitle] = useState('');

    return (
        <RightPanelContext.Provider
            value={{ isOpen, setIsOpen, content, setContent, title, setTitle }}
        >
            {children}
        </RightPanelContext.Provider>
    );
}

export function useRightPanel() {
    const context = useContext(RightPanelContext);
    if (!context) {
        throw new Error('useRightPanel must be used within RightPanelProvider');
    }
    return context;
}
