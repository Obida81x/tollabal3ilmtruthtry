import {
  useGetCurrentUser,
  useLogout,
  getGetCurrentUserQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import React, { createContext, useContext } from "react";

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
  const { data, isLoading, refetch } = useGetCurrentUser({
    query: { queryKey: getGetCurrentUserQueryKey(), retry: false, staleTime: 30_000 },
  });
  const logoutMutation = useLogout();

  const user = (data?.user as User | null | undefined) ?? null;

  function logout() {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
      },
    });
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, refetch, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
