/** Minimal Vercel serverless handler types (subset used by this proxy). */
export interface VercelRequest {
  method?: string;
  headers: {
    authorization?: string | string[];
    [name: string]: string | string[] | undefined;
  };
  query: Record<string, string | string[] | undefined>;
}

export interface VercelResponse {
  setHeader(name: string, value: string): void;
  status(code: number): { json(body: unknown): void };
}
