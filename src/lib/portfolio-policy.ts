export const PORTFOLIO_CONSENT_NAME = "uso-imagenes-videos-menores";
export const PORTFOLIO_CONSENT_VERSION = "2026-07-04";
export const PORTFOLIO_BUCKET = "portfolio-evidence";

export const PORTFOLIO_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf"
] as const;

export const PORTFOLIO_MAX_FILES = 10;
export const PORTFOLIO_MAX_FILE_BYTES = 10 * 1024 * 1024;

export function sanitizeStorageName(name: string) {
  const extension = name.includes(".") ? `.${name.split(".").pop()?.toLowerCase()}` : "";
  const base = name
    .replace(/\.[^.]+$/, "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "archivo";

  return `${base}${extension}`;
}

