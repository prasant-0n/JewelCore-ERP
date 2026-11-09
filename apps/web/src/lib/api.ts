export interface ProblemDetails {
  type?: string;
  title: string;
  status: number;
  detail: string;
  code?: string;
  requestId?: string;
  invalidParams?: Array<{ name: string; reason: string }>;
}

export class ApiProblemError extends Error {
  public problem: ProblemDetails;

  constructor(problem: ProblemDetails) {
    super(problem.detail || problem.title || "An API error occurred");
    this.name = "ApiProblemError";
    this.problem = problem;
  }
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000/api/v1";

// Default Store ID for multi-tenant showroom context (INV-11)
export const DEFAULT_STORE_ID = "0192e300-0001-7000-8000-000000000001";

class ApiClient {
  private activeStoreId: string = DEFAULT_STORE_ID;
  private token: string | null = null;

  public setStoreId(storeId: string) {
    this.activeStoreId = storeId;
    if (typeof window !== "undefined") {
      localStorage.setItem("jewelcore_store_id", storeId);
    }
  }

  public getStoreId(): string {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("jewelcore_store_id");
      if (stored) return stored;
    }
    return this.activeStoreId;
  }

  public setToken(token: string | null) {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("jewelcore_token", token);
      } else {
        localStorage.removeItem("jewelcore_token");
      }
    }
  }

  public getToken(): string | null {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("jewelcore_token");
      if (stored) return stored;
    }
    return this.token;
  }

  public setRefreshToken(token: string | null) {
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("jewelcore_refresh_token", token);
      } else {
        localStorage.removeItem("jewelcore_refresh_token");
      }
    }
  }

  public getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("jewelcore_refresh_token");
    }
    return null;
  }

  private refreshPromise: Promise<string | null> | null = null;

  public async refreshTokenSilently(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    const existingToken = this.getToken();

    // If we have neither a refresh token nor an existing session token, do not attempt refresh or expire session
    if (!refreshToken && !existingToken) {
      return null;
    }

    this.refreshPromise = (async () => {
      try {
        if (!refreshToken) {
          // If we had a mock/client token without backend refresh token:
          if (existingToken && typeof window !== "undefined") {
            const renewed = "mock-jwt-refreshed-session-" + Date.now();
            this.setToken(renewed);
            window.dispatchEvent(
              new CustomEvent("jewelcore:token-refreshed", {
                detail: { token: renewed },
              }),
            );
            return renewed;
          }
          return null;
        }

        const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-store-id": this.getStoreId(),
          },
          credentials: "include",
          body: JSON.stringify({ refreshToken }),
        });

        if (!res.ok) {
          // If offline or mock token active:
          if (existingToken && typeof window !== "undefined") {
            const renewed = "mock-jwt-refreshed-session-" + Date.now();
            this.setToken(renewed);
            window.dispatchEvent(
              new CustomEvent("jewelcore:token-refreshed", {
                detail: { token: renewed },
              }),
            );
            return renewed;
          }
          throw new Error("Session refresh rejected");
        }

        const body = (await res.json()) as {
          data?: { accessToken?: string; refreshToken?: string };
        };
        const newAccessToken = body.data?.accessToken;
        if (newAccessToken) {
          this.setToken(newAccessToken);
          if (body.data?.refreshToken) {
            this.setRefreshToken(body.data.refreshToken);
          }
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("jewelcore:token-refreshed", {
                detail: { token: newAccessToken },
              }),
            );
          }
          return newAccessToken;
        }
        return null;
      } catch {
        if (refreshToken) {
          this.handleSessionExpired();
        }
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private handleSessionExpired() {
    this.setToken(null);
    this.setRefreshToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("jewelcore_user");
      localStorage.setItem("jewelcore_logged_out", "true");
      window.dispatchEvent(new CustomEvent("jewelcore:session-expired"));
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry = false,
  ): Promise<T> {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-store-id": this.getStoreId(),
      ...((options.headers as Record<string, string>) || {}),
    };

    const token = this.getToken();
    if (token && !headers["Authorization"]) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    // Intercept 401 Unauthorized for automatic silent token renewal
    if (
      response.status === 401 &&
      !isRetry &&
      !endpoint.includes("/auth/login") &&
      !endpoint.includes("/auth/refresh") &&
      !endpoint.includes("/auth/step-up") &&
      !endpoint.includes("/auth/persona-token") &&
      (this.getRefreshToken() || this.getToken())
    ) {
      const newToken = await this.refreshTokenSilently();
      if (newToken) {
        // Replay original request with refreshed token
        const retryHeaders = {
          ...headers,
          Authorization: `Bearer ${newToken}`,
        };
        return this.request<T>(
          endpoint,
          { ...options, headers: retryHeaders },
          true,
        );
      }
    }

    if (!response.ok) {
      let problem: ProblemDetails;
      try {
        problem = await response.json();
      } catch {
        problem = {
          title: response.statusText || "Request Failed",
          status: response.status,
          detail: `HTTP ${response.status} returned from server`,
        };
      }
      throw new ApiProblemError(problem);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  public get<T>(
    endpoint: string,
    headers?: Record<string, string>,
  ): Promise<T> {
    return this.request<T>(endpoint, { method: "GET", headers });
  }

  public post<T>(
    endpoint: string,
    body?: unknown,
    headers?: Record<string, string>,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  public put<T>(
    endpoint: string,
    body?: unknown,
    headers?: Record<string, string>,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  public patch<T>(
    endpoint: string,
    body?: unknown,
    headers?: Record<string, string>,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  public delete<T>(
    endpoint: string,
    headers?: Record<string, string>,
  ): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE", headers });
  }

  public async downloadFile(
    endpoint: string,
    fallbackFilename: string,
    options: RequestInit = {},
  ): Promise<void> {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    const headers: Record<string, string> = {
      "x-store-id": this.getStoreId(),
      ...((options.headers as Record<string, string>) || {}),
    };

    const token = this.getToken();
    if (token && !headers["Authorization"]) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to download file: HTTP ${response.status}`);
    }

    const blob = await response.blob();
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = fallbackFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  }
}

export const api = new ApiClient();

if (typeof window !== "undefined") {
  (window as unknown as { api?: ApiClient }).api = api;
}
