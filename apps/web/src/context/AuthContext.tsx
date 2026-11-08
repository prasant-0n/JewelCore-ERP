"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { api, DEFAULT_STORE_ID, ApiProblemError } from "@/lib/api";
import { BRANCH_STORES, type BranchStore } from "@/hooks/useStoreContext";
import { toast } from "sonner";

export interface AuthUser {
  id: string;
  organizationId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: string;
  initials?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  currentStore: BranchStore;
  stores: BranchStore[];
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    credentials: { email: string; password: string },
    storeId?: string,
  ) => Promise<void>;
  logout: () => void;
  switchStore: (storeOrId: BranchStore | string) => void;
  hasPermission: (permissionCode: string) => boolean;
  hasRole: (roleCode: string) => boolean;
  setUserDirectly: (user: AuthUser, token?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default fallback user for initial showroom hydration
export const DEFAULT_STAFF_USER: AuthUser = {
  id: "0192e300-0002-7000-8000-000000000001",
  organizationId: "0192e300-0001-7000-8000-000000000001",
  email: "rachel.r@jewelcore.internal",
  firstName: "Rachel",
  lastName: "R.",
  phone: "+91 98200 11001",
  role: "Store Branch Manager",
  initials: "RR",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [currentStore, setCurrentStore] = useState<BranchStore>(BRANCH_STORES[0]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize store and session state from storage on client mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedStoreId = localStorage.getItem("jewelcore_store_id") || DEFAULT_STORE_ID;
      const foundStore =
        BRANCH_STORES.find((s) => s.id === storedStoreId) || BRANCH_STORES[0];
      setCurrentStore(foundStore);
      api.setStoreId(foundStore.id);

      const storedToken = localStorage.getItem("jewelcore_token");
      const storedUser = localStorage.getItem("jewelcore_user");
      const isLoggedOut = localStorage.getItem("jewelcore_logged_out");

      if (isLoggedOut === "true") {
        setUser(null);
        setToken(null);
        api.setToken(null);
      } else if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser) as AuthUser;
          setUser(parsedUser);
          setToken(storedToken);
          api.setToken(storedToken);
        } catch {
          // If stored JSON corrupted, fallback
          setUser(DEFAULT_STAFF_USER);
          setToken(storedToken);
          api.setToken(storedToken);
        }
      } else if (storedToken) {
        setUser(DEFAULT_STAFF_USER);
        setToken(storedToken);
        api.setToken(storedToken);
      } else {
        // Hydrate default staff for immediate workstation usability
        setUser(DEFAULT_STAFF_USER);
      }
    }
    setIsLoading(false);
  }, []);

  // Listen for silent token renewal or session expiry broadcasts from ApiClient
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleTokenRefreshed = (e: Event) => {
      const customEvent = e as CustomEvent<{ token: string }>;
      if (customEvent.detail?.token) {
        setToken(customEvent.detail.token);
      }
    };

    const handleSessionExpired = () => {
      setUser(null);
      setToken(null);
      toast.error("Session Expired", {
        description: "Your workstation session has timed out. Please sign in again.",
      });
      router.push("/login?session_expired=true");
    };

    window.addEventListener("jewelcore:token-refreshed", handleTokenRefreshed);
    window.addEventListener("jewelcore:session-expired", handleSessionExpired);

    return () => {
      window.removeEventListener("jewelcore:token-refreshed", handleTokenRefreshed);
      window.removeEventListener("jewelcore:session-expired", handleSessionExpired);
    };
  }, [router]);

  const switchStore = useCallback((storeOrId: BranchStore | string) => {
    const targetStore =
      typeof storeOrId === "string"
        ? BRANCH_STORES.find((s) => s.id === storeOrId || s.code === storeOrId)
        : storeOrId;

    if (!targetStore) return;

    api.setStoreId(targetStore.id);
    setCurrentStore(targetStore);

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("jewelcore:store-changed", {
          detail: {
            storeId: targetStore.id,
            storeCode: targetStore.code,
            storeName: targetStore.name,
          },
        }),
      );
    }

    toast.success(`Active Branch: ${targetStore.name}`, {
      description: `Store context switched to ${targetStore.code} (${targetStore.type}).`,
    });
  }, []);

  const login = async (
    credentials: { email: string; password: string },
    storeId?: string,
  ): Promise<void> => {
    setIsLoading(true);
    try {
      const res = await api.post<{
        data: {
          accessToken: string;
          refreshToken?: string;
          user: {
            id: string;
            organizationId: string;
            email: string;
            firstName: string;
            lastName: string;
            phone?: string;
          };
        };
      }>("/auth/login", credentials);

      const { accessToken, user: rawUser } = res.data;
      api.setToken(accessToken);
      setToken(accessToken);

      const initials =
        `${rawUser.firstName?.[0] || ""}${rawUser.lastName?.[0] || ""}`.toUpperCase() ||
        rawUser.email.substring(0, 2).toUpperCase();

      const roleTitle = rawUser.email.includes("rachel")
        ? "Store Branch Manager"
        : rawUser.email.includes("vikram")
        ? "Inventory Controller"
        : rawUser.email.includes("devika")
        ? "Senior QC Gemologist"
        : rawUser.email.includes("arjun")
        ? "Showroom POS Cashier"
        : "Operational Staff";

      const authUser: AuthUser = {
        ...rawUser,
        role: roleTitle,
        initials,
      };

      setUser(authUser);

      if (typeof window !== "undefined") {
        localStorage.removeItem("jewelcore_logged_out");
        localStorage.setItem("jewelcore_token", accessToken);
        localStorage.setItem("jewelcore_user", JSON.stringify(authUser));
        api.setRefreshToken(res.data.refreshToken || "mock-jwt-refresh-token");
      }

      if (storeId) {
        switchStore(storeId);
      }

      toast.success(`Welcome back, ${authUser.firstName}`, {
        description: `Authenticated to ${currentStore.name} as ${authUser.role}.`,
      });

      let targetUrl = "/";
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get("redirect");
        if (redirect && redirect.startsWith("/")) {
          targetUrl = redirect;
        }
      }

      router.push(targetUrl);
    } catch (err) {
      if (err instanceof ApiProblemError) {
        throw err;
      }

      // If backend API is offline (standalone frontend mode):
      if (
        credentials.password !== "JewelCore@2026" &&
        credentials.password !== "Admin@123" &&
        credentials.password !== "Secret@123"
      ) {
        throw new ApiProblemError({
          title: "Unauthorized",
          status: 401,
          detail: "Invalid email or password credentials",
        });
      }

      // Valid credentials in offline/mock mode:
      const rawUser = {
        id: "0192e300-0002-7000-8000-000000000001",
        organizationId: "0192e300-0001-7000-8000-000000000001",
        email: credentials.email,
        firstName: credentials.email.includes("vikram")
          ? "Vikram"
          : credentials.email.includes("devika")
          ? "Devika"
          : credentials.email.includes("arjun")
          ? "Arjun"
          : "Rachel",
        lastName: credentials.email.includes("vikram")
          ? "M."
          : credentials.email.includes("devika")
          ? "S."
          : credentials.email.includes("arjun")
          ? "K."
          : "R.",
      };

      const accessToken = "mock-jwt-authenticated-session";
      api.setToken(accessToken);
      setToken(accessToken);

      const initials = `${rawUser.firstName[0]}${rawUser.lastName[0]}`.toUpperCase();
      const roleTitle = credentials.email.includes("rachel")
        ? "Store Branch Manager"
        : credentials.email.includes("vikram")
        ? "Compliance Director"
        : credentials.email.includes("devika")
        ? "Senior QC Gemologist"
        : credentials.email.includes("arjun")
        ? "Showroom POS Cashier"
        : "Operational Staff";

      const authUser: AuthUser = {
        ...rawUser,
        role: roleTitle,
        initials,
      };

      setUser(authUser);

      if (typeof window !== "undefined") {
        localStorage.removeItem("jewelcore_logged_out");
        localStorage.setItem("jewelcore_token", accessToken);
        localStorage.setItem("jewelcore_user", JSON.stringify(authUser));
        api.setRefreshToken("mock-jwt-refresh-token");
      }

      if (storeId) {
        switchStore(storeId);
      }

      toast.success(`Welcome back, ${authUser.firstName}`, {
        description: `Authenticated to ${currentStore.name} as ${authUser.role}.`,
      });

      let targetUrl = "/";
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get("redirect");
        if (redirect && redirect.startsWith("/")) {
          targetUrl = redirect;
        }
      }

      router.push(targetUrl);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    api.setToken(null);
    api.setRefreshToken(null);
    setToken(null);
    setUser(null);
    setPermissions([]);

    if (typeof window !== "undefined") {
      localStorage.removeItem("jewelcore_token");
      localStorage.removeItem("jewelcore_user");
      localStorage.setItem("jewelcore_logged_out", "true");
    }

    // Call API logout endpoint in background
    api.post("/auth/logout").catch(() => {
      // Ignore background logout errors
    });

    toast.info("Session Closed", {
      description: "You have signed out of your atelier workstation.",
    });

    router.push("/login");
  }, [router]);

  const setUserDirectly = useCallback((newUser: AuthUser, newToken?: string) => {
    setUser(newUser);
    if (typeof window !== "undefined") {
      localStorage.removeItem("jewelcore_logged_out");
    }
    if (newToken) {
      setToken(newToken);
      api.setToken(newToken);
      if (typeof window !== "undefined") {
        localStorage.setItem("jewelcore_token", newToken);
        localStorage.setItem("jewelcore_user", JSON.stringify(newUser));
      }
    }
  }, []);

  const hasRole = useCallback(
    (roleCode: string): boolean => {
      if (!user?.role) return false;
      return user.role.toLowerCase().includes(roleCode.toLowerCase());
    },
    [user],
  );

  const hasPermission = useCallback(
    (permissionCode: string): boolean => {
      if (
        user?.role?.includes("Manager") ||
        user?.role?.includes("Administrator") ||
        user?.role?.includes("Director")
      ) {
        return true;
      }
      return permissions.includes(permissionCode);
    },
    [user, permissions],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        currentStore,
        stores: BRANCH_STORES,
        permissions,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        switchStore,
        hasPermission,
        hasRole,
        setUserDirectly,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
