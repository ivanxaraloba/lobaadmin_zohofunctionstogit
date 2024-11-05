'use client';

import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 0 } },
});

export default function ReactQueryProvider({ children }: any) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
