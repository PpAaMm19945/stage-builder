import { useQuery } from '@tanstack/react-query';
import { API_URL } from '@/lib/api';
import type { AnchorPayload } from '@/components/anchor/AnchorCard';

export function useAnchor() {
    return useQuery({
        queryKey: ['daily-anchor'],
        queryFn: async (): Promise<AnchorPayload> => {
            const token = localStorage.getItem('schoolos_token');
            const res = await fetch(`${API_URL}/api/anchor/today`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
            if (!res.ok) throw new Error('Failed to fetch anchor');
            return res.json();
        },
        staleTime: 1000 * 60 * 60, // 1 hour - anchor doesn't change often
        retry: 2,
    });
}
