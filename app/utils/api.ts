import type { components } from "~/types/api-schema";

export type Data<Name extends keyof components["schemas"]> =
  components["schemas"][Name];

export type RecordData = Record<string, unknown>;

export interface Envelope<T> {
  data: T;
  meta?: { current_page: number; last_page: number; total: number };
  links?: Record<string, string | null>;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fields: Record<string, string[]> = {},
    public voteUrl: string | null = null,
  ) {
    super(message);
  }
}

export interface ApiFailure {
  code?: string;
  message?: string;
  errors?: Record<string, string[]>;
  error?: {
    code?: string;
    message?: string;
    fields?: Record<string, string[]>;
  };
  vote_url?: string | null;
}
