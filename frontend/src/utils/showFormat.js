// "2026-07-21T14:00:00" -> "Mon, Jul 21" and "2:00 PM"
export function showDate(startsAt) {
  return new Date(startsAt).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

export function showTime(startsAt) {
  return new Date(startsAt).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit',
  });
}
