import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes cache as per rules.md
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
