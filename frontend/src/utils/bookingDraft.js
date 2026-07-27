// The in-progress booking, parked in sessionStorage so it survives the
// login redirect during checkout. Cleared when the order completes.
const KEY = 'ces-booking-draft';

export function saveDraft(draft) {
  sessionStorage.setItem(KEY, JSON.stringify(draft));
}

export function loadDraft() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY));
  } catch {
    return null;
  }
}

export function clearDraft() {
  sessionStorage.removeItem(KEY);
}
