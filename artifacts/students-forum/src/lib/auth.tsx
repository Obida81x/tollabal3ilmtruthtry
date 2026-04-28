import { createContext, useContext, type ReactNode } from "react";
import {
  useGetCurrentUser,
  getGetCurrentUserQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

type CurrentUser = {
  id: number;
  username: string;
  displayName: string;
  gender: "male" | "female";
  country?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  createdAt: string | Date;
} | null;

type AuthContextValue = {
  user: CurrentUser;
  isLoading: boolean;
  refresh: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useGetCurrentUser({
    query: { queryKey: getGetCurrentUserQueryKey() },
  });
  const user = (data?.user as CurrentUser) ?? null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        refresh: () => {
          queryClient.invalidateQueries({
            queryKey: getGetCurrentUserQueryKey(),
          });
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useRequireAuth(): CurrentUser {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  if (!isLoading && !user) {
    setLocation("/login");
  }
  return user;
}
