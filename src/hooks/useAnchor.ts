import { useQuery } from '@tanstack/react-query';
import { API_URL } from '@/lib/api';
import type { AnchorPayload } from '@/components/anchor/AnchorCard';

export function useAnchor() {
    return useQuery({
        queryKey: ['daily-anchor'],
        queryFn: async (): Promise<AnchorPayload> => {
            const token = localStorage.getItem('schoolos_token');
            const url = `${API_URL}/api/anchor/today`;
            console.log('[useAnchor] Fetching today\'s anchor from:', url);

            try {
                const res = await fetch(url, {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });

                console.log('[useAnchor] Response status:', res.status, res.statusText);

                if (!res.ok) {
                    const errorText = await res.text();
                    console.error('[useAnchor] Fetch failed:', errorText);
                    throw new Error(`Failed to fetch anchor: ${res.status}`);
                }

                const data = await res.json();
                console.log('[useAnchor] Anchor data received:', data);
                return data;
            } catch (err) {
                console.error('[useAnchor] Network or parsing error:', err);
                throw err;
            }
        },
        staleTime: 1000 * 60 * 60, // 1 hour - anchor doesn't change often
        retry: 2,
    });
}
