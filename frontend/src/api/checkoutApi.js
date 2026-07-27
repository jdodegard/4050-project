const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api') + '/checkout';

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error || `Payment failed (${res.status})`);
    error.code = data.code;
    throw error;
  }
  return data;
}

export function processMockPayment(payment) {
  return fetch(`${BASE_URL}/payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payment),
  }).then(handleResponse);
}
