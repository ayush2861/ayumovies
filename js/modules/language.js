/**
 * StreamFlix — Language Module
 * Manages UI language preferences and per-content language availability.
 */
const LANG_KEY = 'sf_lang';
export const SUPPORTED_LANGUAGES = [
  { code: 'en',    name: 'English',    flag: '🇬🇧', tmdb: 'en' },
  { code: 'hi',    name: 'Hindi',      flag: '🇮🇳', tmdb: 'hi' },
  { code: 'ta',    name: 'Tamil',      flag: '🇮🇳', tmdb: 'ta' },
  { code: 'te',    name: 'Telugu',     flag: '🇮🇳', tmdb: 'te' },
  { code: 'es',    name: 'Spanish',    flag: '🇪🇸', tmdb: 'es' },
  { code: 'fr',    name: 'French',     flag: '🇫🇷', tmdb: 'fr' },
  { code: 'de',    name: 'German',     flag: '🇩🇪', tmdb: 'de' },
  { code: 'ja',    name: 'Japanese',   flag: '🇯🇵', tmdb: 'ja' },
  { code: 'ko',    name: 'Korean',     flag: '🇰🇷', tmdb: 'ko' },
  { code: 'pt',    name: 'Portuguese', flag: '🇧🇷', tmdb: 'pt' },
];
/**
 * Get preferred language (default: 'en').
 */
export function getPreferredLang() {
  try { return localStorage.getItem(LANG_KEY) || 'hi'; } catch (_) { return 'hi'; }
}
/**
 * Save preferred language.
 */
export function setPreferredLang(code) {
  try { localStorage.setItem(LANG_KEY, code); } catch (_) {}
}
/**
 * Given a movie/show object, return the list of available language codes.
 * TMDB's `spoken_languages` is used when present; otherwise we fall back
 * to the original_language + English.
 */
export function getAvailableLanguages(media) {
  const spoken = (media.spoken_languages || []).map(l => l.iso_639_1).filter(Boolean);
  const orig   = media.original_language;
  // Always ensure English and the original language are listed first
  const set = new Set(['en', orig, ...spoken].filter(Boolean));
  return [...set].filter(code => SUPPORTED_LANGUAGES.some(l => l.code === code));
}
/**
 * Get language object by code.
 */
export function getLang(code) {
  return SUPPORTED_LANGUAGES.find(l => l.code === code) || SUPPORTED_LANGUAGES[0];
}
/**
 * Build a vidsrc embed URL with the chosen language/audio track hint.
 * (vidsrc.to doesn't officially support lang params, so we append as a hint
 *  and set the Accept-Language for future-proofing.)
 */
/* ==========================
   STREAMING SERVERS
========================== */
const SERVERS = {
    nxsha: "https://web.nxsha.app",
    server1: "https://vidsrcme.su",
    server2: "https://web.nxsha.space",
   vidfast: "https://vidnest.fun"
};
/* Nxsha language mapping */
const NXSHA_LANG = {
    en: "english",
    hi: "hindi"
   
};
let currentServer = "nxsha";
export function setServer(server) {
    if (SERVERS[server]) {
        currentServer = server;
    }
}
export function getCurrentServer() {
    return currentServer;
}
export function buildEmbedUrl(
    media,
    langCode,
    season = 1,
    episode = 1
) {
    const base = SERVERS[currentServer];
    const isTV =
        media.media_type === "tv" ||
        (!media.title && media.name);
    const nxshaLang =
        NXSHA_LANG[langCode] || "english";

    /* ---------- TV Shows ---------- */
    if (isTV) {
        if (currentServer === "nxsha" || currentServer === "server2") {
            return `${base}/embed/tv/${media.id}/${season}/${episode}?lang=${nxshaLang}`;
        }
        if (currentServer === "vidfast") {
            return `https://vidnest.fun/tv/${media.id}/${season}/${episode}?autoPlay=true`;
        }
        // Fallback for server1 (vsembed.su)
        return `${base}/embed/tv/${media.id}/${season}/${episode}`;
    }

    /* ---------- Movies ---------- */
    if (currentServer === "nxsha" || currentServer === "server2") {
        return `${base}/embed/movie/${media.id}?lang=${nxshaLang}`;
    }
    if (currentServer === "vidfast") {
        return `https://vidnest.fun/movie/${media.id}?autoPlay=true`;
    }
    // Fallback for server1 (vsembed.su)
    return `${base}/embed/movie/${media.id}`;
}
