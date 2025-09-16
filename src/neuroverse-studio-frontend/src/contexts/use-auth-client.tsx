import { createContext, useContext, useEffect, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { serviceFactory } from "@/services";
import { toast } from "sonner";
import { Principal } from "@dfinity/principal";

interface AuthContextType {
  isAuthenticating: boolean;
  isAuthenticated: boolean;
  signInWithIcpAuthenticator: () => Promise<void>;
  signInWithPlugWallet: () => Promise<void>;
  signInWithNfid: () => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  authClient?: any;
  identity?: any;
  principal?: Principal;
  whoamiActor?: any;
  agent?: any;
  accountId?: string;
  whoAmI?: string;
  signInMethod?: string;
  host: string;
  isLoading: boolean;
  error?: Error | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const {
    data: authData,
    isLoading,
    error,
    refetch: refreshAuth,
  } = useQuery({
    queryKey: ["auth"],
    queryFn: async () => {
      await serviceFactory.initialize();
      const isAuthenticated = await serviceFactory.isAuthenticated();
      const principal = serviceFactory.getPrincipal();

      return {
        isAuthenticated,
        principal,
        identity: serviceFactory["authService"].getIdentity(),
        agent: serviceFactory["authService"].getAgent(),
        whoamiActor: serviceFactory["authService"].getWhoamiActor(),
        accountId: serviceFactory["authService"].getAccountId(),
        signInMethod: serviceFactory["authService"].getSignInMethod(),
        authClient: serviceFactory["authService"].getAuthClient(),
        host: serviceFactory["authService"].getHost(),
      };
    },
    staleTime: 1000 * 60 * 2,
    retry: (failureCount, error) => {
      // Only retry once for initialization errors
      return failureCount < 1;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  const signInWithIcpAuthenticatorMutation = useMutation({
    mutationFn: async () => {
      const result = await serviceFactory.login();
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      return result;
    },
    onSuccess: (data) => {
      toast.success("Successfully logged in!");
      // console.log(data);
    },
    onError: (error) => {
      console.error("Login error:", error);
      toast.error("Failed to login. Please try again.");
    },
  });

  const signInWithPlugWallet = async () => {
    await serviceFactory["authService"].loginWithPlug();
    queryClient.invalidateQueries({ queryKey: ["auth"] });
  };

  const signInWithNfid = async () => {
    await serviceFactory["authService"].loginWithNfid();
    queryClient.invalidateQueries({ queryKey: ["auth"] });
  };

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await serviceFactory.logout();
    },
    onSuccess: () => {
      toast.success("Successfully logged out!");
      queryClient.clear();

      refreshAuth();
    },
    onError: (error) => {
      console.error("Logout error:", error);
      toast.error("Failed to logout.");
    },
  });

  useEffect(() => {
    serviceFactory.initialize().catch(console.error);
  }, []);

  const contextValue: AuthContextType = {
    isAuthenticating: isLoading,
    isAuthenticated: authData?.isAuthenticated ?? false,
    signInWithIcpAuthenticator: async () => {
      await signInWithIcpAuthenticatorMutation.mutateAsync();
    },
    signInWithPlugWallet,
    signInWithNfid,
    logout: async () => {
      await logoutMutation.mutateAsync();
    },
    refreshAuth: async () => {
      await refreshAuth();
    },
    principal: authData?.principal,
    identity: authData?.identity,
    authClient: authData?.authClient,
    whoamiActor: authData?.whoamiActor,
    agent: authData?.agent,
    accountId: authData?.accountId,
    whoAmI: "",
    signInMethod: authData?.signInMethod,
    host: authData?.host,
    isLoading,
    error: error as Error,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
