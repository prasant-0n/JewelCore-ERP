"use client";

import { useState, useEffect, useCallback } from "react";
import { api, ApiProblemError } from "../lib/api";

export interface UseApiState<T> {
  data: T;
  isLoading: boolean;
  isLive: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useWorkstationApi<T>(
  endpoint: string,
  initialMockData: T,
): UseApiState<T> {
  const [data, setData] = useState<T>(initialMockData);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get<{ data?: T } | T>(endpoint);
      if (response && typeof response === "object") {
        if ("data" in response && (response as any).data !== undefined) {
          setData((response as any).data);
        } else {
          setData(response as T);
        }
        setIsLive(true);
        setError(null);
      }
    } catch (err) {
      // Gracefully fall back to initial mock state when backend is offline or during SSR
      setError(err as Error);
      setIsLive(false);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    isLive,
    error,
    refresh: fetchData,
  };
}
