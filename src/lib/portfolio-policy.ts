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

export type EvidenceKind = "note" | "photo" | "video" | "document" | "link" | "mixed";

export function detectExternalProvider(value: string) {
  if (!value) return "";
  try {
    const host = new URL(value).hostname.toLowerCase().replace(/^www\./, "");
    if (host === "youtu.be" || host.endsWith("youtube.com")) return "YouTube";
    if (host.endsWith("vimeo.com")) return "Vimeo";
    if (host.endsWith("loom.com")) return "Loom";
    if (host.endsWith("drive.google.com")) return "Google Drive";
    if (host.endsWith("onedrive.live.com") || host.endsWith("sharepoint.com")) return "OneDrive";
    if (host.endsWith("icloud.com")) return "iCloud";
    return host;
  } catch {
    return "";
  }
}

export function classifyEvidence({ mimeTypes, externalUrl }: { mimeTypes: readonly string[]; externalUrl?: string }): EvidenceKind {
  const hasImages = mimeTypes.some((type) => type.startsWith("image/"));
  const hasDocuments = mimeTypes.includes("application/pdf");
  const hasExternal = Boolean(externalUrl);
  const provider = detectExternalProvider(externalUrl || "");
  const externalIsVideo = ["YouTube", "Vimeo", "Loom"].includes(provider) || /\.(mp4|mov|webm)(?:$|[?#])/i.test(externalUrl || "");
  const groups = Number(hasImages) + Number(hasDocuments) + Number(hasExternal);

  if (groups > 1 || (hasImages && hasDocuments)) return "mixed";
  if (hasDocuments) return "document";
  if (hasImages) return "photo";
  if (hasExternal) return externalIsVideo ? "video" : "link";
  return "note";
}

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
