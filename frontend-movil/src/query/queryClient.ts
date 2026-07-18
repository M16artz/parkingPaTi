import { QueryClient } from '@tanstack/react-query';

export const POLLING_INTERVAL_MS = 5000;

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            staleTime: 4000,
            refetchOnReconnect: true,
            refetchOnWindowFocus: true,
        },
    },
});
