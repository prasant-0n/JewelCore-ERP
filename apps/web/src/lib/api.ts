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
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

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

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
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
    });

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

  public delete<T>(
    endpoint: string,
    headers?: Record<string, string>,
  ): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE", headers });
  }
}

export const api = new ApiClient();
