import React from 'react';
import { GraduationCap } from '@phosphor-icons/react';

export const AlumniBadge: React.FC = () => {
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
            <GraduationCap weight="fill" className="w-3 h-3" />
            Alumni
        </span>
    );
};
