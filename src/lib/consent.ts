/**
 * Cookie consent for Google Analytics. GA is not loaded at all until a visitor
 * accepts, so no analytics cookies are set and nothing reaches Google before
 * that. The choice lives in local storage; clearing it shows the banner again.
 */

export const GA_MEASUREMENT_ID = "G-7HJ826517V";

const STORAGE_KEY = "energy-icons-analytics-consent";
/** Fired on window when the choice is reset, so the banner can reappear. */
export const CONSENT_RESET_EVENT = "energy-icons:consent-reset";

export type Consent = "granted" | "denied";

declare global {
  interface Window {
    loadAnalytics?: () => void;
  }
}

/**
 * Inline <head> script: defines window.loadAnalytics and calls it straight
 * away for returning visitors who already accepted, so their first page view
 * is counted as early as before.
 */
export const analyticsInitScript = `(function(){
window.loadAnalytics=function(){
if(window.gtag)return;
window.dataLayer=window.dataLayer||[];
window.gtag=function(){dataLayer.push(arguments);};
gtag('js',new Date());
gtag('config','${GA_MEASUREMENT_ID}');
var s=document.createElement('script');
s.async=true;
s.src='https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}';
document.head.appendChild(s);
};
try{if(localStorage.getItem('${STORAGE_KEY}')==='granted')window.loadAnalytics();}catch(e){}
})();`;

export function readConsent(): Consent | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function saveConsent(consent: Consent): void {
  try {
    localStorage.setItem(STORAGE_KEY, consent);
  } catch {
    /* private mode: the choice holds for this page only */
  }
  if (consent === "granted") {
    window.loadAnalytics?.();
    return;
  }
  // Declining after accepting: stop GA and remove the cookies it set.
  (window as unknown as Record<string, boolean>)[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
  const domain = location.hostname.replace(/^www\./, "");
  for (const name of document.cookie.split(";").map((c) => c.split("=")[0].trim())) {
    if (!name.startsWith("_ga")) continue;
    for (const d of ["", `; domain=${domain}`, `; domain=.${domain}`]) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d}`;
    }
  }
}

/** Forget the choice and show the banner again (the privacy page's "Cookie settings"). */
export function resetConsent(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* nothing stored */
  }
  window.dispatchEvent(new Event(CONSENT_RESET_EVENT));
}
