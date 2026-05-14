/**
 * iPhyloGeo API client.
 *
 * Base URL is read from VITE_API_BASE_URL (defaults to http://localhost:8000).
 * All functions return typed promises and throw on non-2xx responses.
 */

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:8000";

// ── Internal helper ───────────────────────────────────────────────────────────

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error((body as { detail?: string }).detail ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UploadResult {
  file_id: string;
}

export interface JobStatus {
  status: "pending" | "climatic_trees" | "alignment" | "genetic_trees" | "output" | "complete" | "error" | "not_found";
  progress: number;
  estimated_time?: number;
  elapsed_time?: number;
  error?: string;
}

export interface CreateJobRequest {
  climatic_file_id: string;
  genetic_file_id?: string;
  aligned_genetic_file_id?: string;
  genetic_tree_file_id?: string;
  climatic_params?: Record<string, unknown>;
  genetic_params?: Record<string, unknown>;
  name?: string;
  email?: string;
  lang?: string;
  temporary?: boolean;
}

export interface AnalysisResult {
  _id: string;
  name: string;
  status: string;
  created_at: string;
  expired_at: string;
  result_type: string[];
  output?: Record<string, (string | number | null)[]>;
  climatic_trees?: Record<string, string>;
  genetic_trees?: Record<string, string>;
  climatic_params?: Record<string, unknown>;
  genetic_params?: Record<string, unknown>;
}

// ── Upload ────────────────────────────────────────────────────────────────────

function uploadFile(path: string, file: File): Promise<UploadResult> {
  const form = new FormData();
  form.append("file", file);
  return request<UploadResult>(path, { method: "POST", body: form });
}

export const upload = {
  /** Upload a CSV or Excel climatic data file. */
  climatic: (file: File) => uploadFile("/api/upload/climatic", file),

  /** Upload a FASTA genetic sequence file. */
  genetic: (file: File) => uploadFile("/api/upload/genetic", file),

  /** Upload a pre-aligned genetic file (aphylogeo JSON or FASTA). */
  aligned: (file: File) => uploadFile("/api/upload/aligned", file),

  /** Upload a pre-computed genetic tree file (aphylogeo JSON). */
  tree: (file: File) => uploadFile("/api/upload/tree", file),
};

// ── Jobs ──────────────────────────────────────────────────────────────────────

export const jobs = {
  /** Create a new analysis job and start the pipeline. Returns result_id. */
  create: (body: CreateJobRequest) =>
    request<{ result_id: string }>("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),

  /** Poll the status + progress of a running job. */
  status: (resultId: string) =>
    request<JobStatus>(`/api/jobs/${resultId}/status`),
};

// ── Results ───────────────────────────────────────────────────────────────────

export const results = {
  /** List all persisted results. */
  list: () => request<AnalysisResult[]>("/api/results"),

  /** Get a single result by ID. */
  get: (id: string) => request<AnalysisResult>(`/api/results/${id}`),

  /** Delete a result. */
  delete: (id: string) =>
    request<{ message: string }>(`/api/results/${id}`, { method: "DELETE" }),

  /** Download result as an Excel file. Returns a Blob. */
  download: async (id: string): Promise<Blob> => {
    const res = await fetch(`${BASE}/api/results/${id}/download`);
    if (!res.ok) throw new Error(`Download failed: HTTP ${res.status}`);
    return res.blob();
  },

  /** Send a results-ready email notification. */
  email: (id: string, email: string, lang = "en") =>
    request<{ message: string }>(`/api/results/${id}/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, lang }),
    }),
};

// ── Settings ──────────────────────────────────────────────────────────────────

export const settings = {
  /** Get current analysis settings. */
  get: () => request<Record<string, unknown>>("/api/settings"),

  /** Overwrite analysis settings. */
  update: (body: Record<string, unknown>) =>
    request<Record<string, unknown>>("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
};

// ── File Previews ─────────────────────────────────────────────────────────────

export interface ClimaticPreview {
  columns: string[];
  rows: Record<string, unknown>[];
}

export interface GeneticPreview {
  sequences: Record<string, string>;
  full_length: number;
}

export const preview = {
  climatic: (fileId: string) =>
    request<ClimaticPreview>(`/api/upload/climatic/${fileId}/preview`),

  genetic: (fileId: string) =>
    request<GeneticPreview>(`/api/upload/genetic/${fileId}/preview`),
};

// ── Convenience re-export ─────────────────────────────────────────────────────

export const api = { upload, jobs, results, settings, preview };
export default api;
