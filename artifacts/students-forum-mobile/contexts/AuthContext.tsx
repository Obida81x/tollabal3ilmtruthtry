import {
  useGetCurrentUser,
  useLogout,
  getGetCurrentUserQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { clearAuthToken } from "@/lib/tokenStorage";

const USER_CACHE_KEY = "@auth:user";

interface User {
  id: number;
  username: string;
  displayName: string;
  email?: string | null;
  gender: "male" | "female";
  isAdmin: boolean;
  isMainAdmin: boolean;
  isActive: boolean;
  createdAt: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  refetch: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  refetch: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [cachedUser, setCachedUser] = useState<User | null>(null);
  const [cacheLoaded, setCacheLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(USER_CACHE_KEY)
      .then((json) => {
        if (json) {
          try {
            setCachedUser(JSON.parse(json));
          } catch {
          }
        }
      })
      .finally(() => setCacheLoaded(true));
  }, []);

  const { data, isLoading, refetch } = useGetCurrentUser({
    query: {
      queryKey: getGetCurrentUserQueryKey(),
      retry: false,
      staleTime: 30_000,
      enabled: cacheLoaded,
    },
  });
  const logoutMutation = useLogout();

  const apiUser = (data?.user as User | null | undefined) ?? null;

  useEffect(() => {
    if (!isLoading) {
      if (apiUser) {
        AsyncStorage.setItem(USER_CACHE_KEY, JSON.stringify(apiUser)).catch(() => {});
        setCachedUser(apiUser);
      } else {
        AsyncStorage.removeItem(USER_CACHE_KEY).catch(() => {});
        setCachedUser(null);
      }
    }
  }, [apiUser, isLoading]);

  const stillWaiting = !cacheLoaded || isLoading;
  const user = apiUser ?? (stillWaiting ? cachedUser : null);

  function logout() {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        AsyncStorage.removeItem(USER_CACHE_KEY).catch(() => {});
        clearAuthToken().catch(() => {});
        setCachedUser(null);
        queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
      },
    });
  }

  return (
    <AuthContext.Provider value={{ user, isLoading: stillWaiting, refetch, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
