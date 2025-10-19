const handleRes = async (res) => {
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(json.msg || json.error || 'Request failed')
    throw err
  }
  return json
}

export const registerUser = (data) =>
  fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleRes)

export const loginUser = (data) =>
  fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleRes)

export const getProfile = (token) =>
  fetch('/api/user/me', {
    headers: { 'x-auth-token': token },
  }).then(handleRes)

export const updateProfile = (token, data) =>
  fetch('/api/user/me', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
    body: JSON.stringify(data),
  }).then(handleRes)

export default {}
