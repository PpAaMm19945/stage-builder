import { useQuery } from '@tanstack/react-query';
import { formations } from '@/lib/api';
import { Formation, FormationType, PrimaryVirtue } from '@/types';

interface UseFormationsParams {
    virtue?: PrimaryVirtue;
    formationType?: FormationType;
    ageMonths?: number;
    context?: string;
    enabled?: boolean;
}

export function useFormations({
    virtue,
    formationType,
    ageMonths,
    context,
    enabled = true
}: UseFormationsParams = {}) {
    return useQuery({
        queryKey: ['formations', { virtue, formationType, ageMonths, context }],
        queryFn: () => formations.list({ virtue, formationType, ageMonths, context }),
        enabled,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useFormation(id: string) {
    return useQuery({
        queryKey: ['formation', id],
        queryFn: () => formations.get(id),
        enabled: !!id,
    });
}
