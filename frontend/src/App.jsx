import { useState, useEffect } from 'react'
import './App.css'
import { registerUser, loginUser, getProfile, updateProfile } from './api'

function AuthForm({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState(null)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      let res
      if (isRegister) {
        res = await registerUser(form)
      } else {
        res = await loginUser({ email: form.email, password: form.password })
      }
      onLogin(res.token)
    } catch (err) {
      setError(err.message || 'Request failed')
    }
  }

  return (
    <div className="auth">
      <h2>{isRegister ? 'Register' : 'Login'}</h2>
      <form onSubmit={submit}>
        {isRegister && (
          <div>
            <label>Name</label>
            <input name="name" value={form.name} onChange={handleChange} />
          </div>
        )}
        <div>
          <label>Email</label>
          <input name="email" value={form.email} onChange={handleChange} />
        </div>
        <div>
          <label>Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} />
        </div>
        <button type="submit">{isRegister ? 'Register' : 'Login'}</button>
      </form>
      <button onClick={() => setIsRegister((s) => !s)} className="link">
        {isRegister ? 'Have an account? Login' : "Don't have an account? Register"}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  )
}

function Profile({ token, onLogout }) {
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const p = await getProfile(token)
        setProfile(p)
        setForm({ name: p.name || '', email: p.email || '' })
      } catch (err) {
        setError(err.message || 'Failed to load profile')
      }
    }
    load()
  }, [token])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const save = async () => {
    setError(null)
    try {
      const updated = await updateProfile(token, form)
      setProfile(updated)
      setEditing(false)
    } catch (err) {
      setError(err.message || 'Update failed')
    }
  }

  // If profile hasn't loaded yet, show loading or any error that occurred.
  if (!profile) {
    if (error) {
      return (
        <div className="profile">
          <h2>Profile</h2>
          <p className="error">{error}</p>
          <div style={{ marginTop: 12 }}>
            <button onClick={onLogout}>Back to login</button>
          </div>
        </div>
      )
    }
    return <p>Loading profile...</p>
  }

  return (
    <div className="profile">
      <h2>Your Profile</h2>
      {editing ? (
        <div>
          <div>
            <label>Name</label>
            <input name="name" value={form.name} onChange={handleChange} />
          </div>
          <div>
            <label>Email</label>
            <input name="email" value={form.email} onChange={handleChange} />
          </div>
          <button onClick={save}>Save</button>
          <button onClick={() => setEditing(false)}>Cancel</button>
        </div>
      ) : (
        <div>
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <button onClick={() => setEditing(true)}>Edit</button>
          <button onClick={onLogout}>Logout</button>
        </div>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  )
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))

  const handleLogin = (t) => {
    localStorage.setItem('token', t)
    setToken(t)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
  }

  return (
    <div className="container">
      <h1>AI Meal Planner</h1>
      {!token ? (
        <AuthForm onLogin={handleLogin} />
      ) : (
        <Profile token={token} onLogout={handleLogout} />
      )}
    </div>
  )
}

export default App
