const ICD_CLIENT_ID = "29526980-f8dd-4e1f-9898-7c99752b8e64_ee174145-fd98-4a6e-b518-887471a50b16";
const ICD_CLIENT_SECRET = "5WWRIkFeiQjpgqR0PEANP0Wl0skfIaE5OO57ogBFBNo=";
const TOKEN_URL = "https://icdaccessmanagement.who.int/connect/token";
const API_BASE = "https://id.who.int/icd/release/11/2024-01/mms";

let storedToken = null;

export async function refreshICDToken() {
  const body = new URLSearchParams({ grant_type: "client_credentials", client_id: ICD_CLIENT_ID, client_secret: ICD_CLIENT_SECRET });
  const response = await fetch(TOKEN_URL, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
  if (!response.ok) throw new Error(`WHO token request failed (${response.status}): ${await response.text()}`);
  const tokenData = await response.json();
  storedToken = tokenData.access_token;
  return storedToken;
}

export function getStoredToken() { return storedToken; }

async function whoFetch(url) {
  let token = getStoredToken() || await refreshICDToken();
  let response = await fetch(url, { headers: { Authorization: `Bearer ${token}`, "API-Version": "v2", "Accept-Language": "en" } });
  // Auto-refresh on 401 (expired token) and retry once
  if (response.status === 401) {
    storedToken = null;
    token = await refreshICDToken();
    response = await fetch(url, { headers: { Authorization: `Bearer ${token}`, "API-Version": "v2", "Accept-Language": "en" } });
  }
  if (!response.ok) throw new Error(`WHO ICD request failed (${response.status}): ${await response.text()}`);
  return response.json();
}

export function searchICDAPI(query) { return whoFetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`); }
export async function lookupICDCode(code) {
  try {
    const codeInfo = await whoFetch(`${API_BASE}/codeinfo/${encodeURIComponent(code)}`);
    const entityUri = codeInfo.stemId?.replace(/^http:\/\//i, "https://");
    const entity = entityUri ? await whoFetch(entityUri) : {};
    return {
      id: entityUri || null,
      theCode: codeInfo.code || code,
      title: entity.title?.["@value"] || entity.title || codeInfo.stemCode || code,
      isLeaf: entity.isLeaf ?? true
    };
  } catch (error) {
    // A non-code query or an invalid code should continue through normal WHO text search.
    if (error.message.includes("(404)")) return null;
    throw error;
  }
}
export function fetchICDEntityDetails(entityUri) {
  // WHO search responses commonly return http entity identifiers; API calls require HTTPS.
  return whoFetch(entityUri.replace(/^http:\/\//i, "https://"));
}

const WHO_BROWSER_BASE = "https://icd.who.int/browse/2024-01/mms/en";

// Build official WHO ICD-11 browser links so users can verify every record.
// browserUrl deep-links to the exact entity when we know its URI, otherwise
// falls back to a WHO search URL. Both point only at icd.who.int.
export function buildWhoLinks(entityUri, code) {
  const normalizedEntity = entityUri ? entityUri.replace(/^http:\/\//i, "https://") : null;
  const searchUrl = code
    ? `${WHO_BROWSER_BASE}?search=${encodeURIComponent(code)}`
    : WHO_BROWSER_BASE;
  const browserUrl = normalizedEntity
    ? `${WHO_BROWSER_BASE}#${encodeURIComponent(normalizedEntity)}`
    : searchUrl;
  return { browserBase: WHO_BROWSER_BASE, browserUrl, searchUrl, entityUrl: normalizedEntity };
}

// Strip WHO HTML (titles/definitions often contain <em class="..."> tags)
// into clean plain text for encyclopedia display.
export function cleanWhoText(value) {
  if (value == null) return "";
  const raw = typeof value === "string" ? value : (value["@value"] ?? value.value ?? "");
  return String(raw).replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

export function cleanWhoList(list) {
  if (!Array.isArray(list)) return [];
  return list.map(cleanWhoText).filter(Boolean);
}
