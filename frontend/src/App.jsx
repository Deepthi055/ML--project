import { useState, useEffect } from 'react'
import './App.css'
import { registerUser, loginUser, getProfile, updateProfile } from './api'

function AuthForm({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    gender: '',
    height_cm: '',
    weight_kg: '',
    activity_level: '',
    goal: '',
    health_conditions: '', // comma-separated
    diet_preferences: '', // comma-separated
    daily_calorie_target: ''
  })
  const [error, setError] = useState(null)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      let res
      if (isRegister) {
        // prepare payload: convert comma-separated fields into arrays
        const payload = { ...form }
        if (typeof payload.health_conditions === 'string') {
          payload.health_conditions = payload.health_conditions
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        }
        if (typeof payload.diet_preferences === 'string') {
          payload.diet_preferences = payload.diet_preferences
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        }
        // convert empty numeric strings to undefined
        ['age', 'height_cm', 'weight_kg', 'daily_calorie_target'].forEach((k) => {
          if (payload[k] === '') delete payload[k]
          else payload[k] = Number(payload[k])
        })

        res = await registerUser(payload)
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
          <div className="form-grid">
            <div className="form-row">
              <label>Name</label>
              <input name="name" value={form.name} onChange={handleChange} />
            </div>
            <div className="form-row">
              <label>Age</label>
              <input name="age" type="number" value={form.age} onChange={handleChange} />
            </div>
            <div>
              <label>Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label>Height (cm)</label>
              <input name="height_cm" type="number" value={form.height_cm} onChange={handleChange} />
            </div>
            <div>
              <label>Weight (kg)</label>
              <input name="weight_kg" type="number" value={form.weight_kg} onChange={handleChange} />
            </div>
            <div>
              <label>Activity level</label>
              <select name="activity_level" value={form.activity_level} onChange={handleChange}>
                <option value="">Select</option>
                <option value="sedentary">Sedentary</option>
                <option value="light">Light</option>
                <option value="moderate">Moderate</option>
                <option value="active">Active</option>
              </select>
            </div>
            <div>
              <label>Goal</label>
              <select name="goal" value={form.goal} onChange={handleChange}>
                <option value="">Select</option>
                <option value="weight_loss">Weight loss</option>
                <option value="weight_gain">Weight gain</option>
                <option value="maintain">Maintain</option>
              </select>
            </div>
            <div>
              <label>Health conditions (comma separated)</label>
              <input name="health_conditions" value={form.health_conditions} onChange={handleChange} />
            </div>
            <div>
              <label>Diet preferences (comma separated)</label>
              <input name="diet_preferences" value={form.diet_preferences} onChange={handleChange} />
            </div>
            <div className="form-row full">
              <label>Daily calorie target (optional)</label>
              <input name="daily_calorie_target" type="number" value={form.daily_calorie_target} onChange={handleChange} />
            </div>
          </div>
        )}
        <div className="form-grid">
          <div className="form-row">
            <label>Email</label>
            <input name="email" value={form.email} onChange={handleChange} />
          </div>
          <div className="form-row">
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} />
          </div>
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
      const payload = { ...form }
      if (typeof payload.health_conditions === 'string') {
        payload.health_conditions = payload.health_conditions
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      }
      if (typeof payload.diet_preferences === 'string') {
        payload.diet_preferences = payload.diet_preferences
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      }
      ['age', 'height_cm', 'weight_kg', 'daily_calorie_target'].forEach((k) => {
        if (payload[k] === '' || payload[k] === undefined) delete payload[k]
        else payload[k] = Number(payload[k])
      })

      const updated = await updateProfile(token, payload)
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
        <div className="form-grid">
          <div className="form-row">
            <label>Name</label>
            <input name="name" value={form.name} onChange={handleChange} />
          </div>
          <div className="form-row">
            <label>Email</label>
            <input name="email" value={form.email} onChange={handleChange} />
          </div>
          <div className="form-row">
            <label>Age</label>
            <input name="age" type="number" value={form.age || ''} onChange={handleChange} />
          </div>
          <div>
            <label>Gender</label>
            <select name="gender" value={form.gender || ''} onChange={handleChange}>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label>Height (cm)</label>
            <input name="height_cm" type="number" value={form.height_cm || ''} onChange={handleChange} />
          </div>
          <div>
            <label>Weight (kg)</label>
            <input name="weight_kg" type="number" value={form.weight_kg || ''} onChange={handleChange} />
          </div>
          <div>
            <label>Activity level</label>
            <select name="activity_level" value={form.activity_level || ''} onChange={handleChange}>
              <option value="">Select</option>
              <option value="sedentary">Sedentary</option>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="active">Active</option>
            </select>
          </div>
          <div>
            <label>Goal</label>
            <select name="goal" value={form.goal || ''} onChange={handleChange}>
              <option value="">Select</option>
              <option value="weight_loss">Weight loss</option>
              <option value="weight_gain">Weight gain</option>
              <option value="maintain">Maintain</option>
            </select>
          </div>
          <div>
            <label>Health conditions (comma separated)</label>
            <input name="health_conditions" value={form.health_conditions || ''} onChange={handleChange} />
          </div>
          <div>
            <label>Diet preferences (comma separated)</label>
            <input name="diet_preferences" value={form.diet_preferences || ''} onChange={handleChange} />
          </div>
          <div className="form-row full">
            <label>Daily calorie target</label>
            <input name="daily_calorie_target" type="number" value={form.daily_calorie_target || ''} onChange={handleChange} />
          </div>
          <div className="actions full">
            <button className="btn-primary" onClick={save}>Save</button>
            <button className="btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <div>
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          {profile.age && <p><strong>Age:</strong> {profile.age}</p>}
          {profile.gender && <p><strong>Gender:</strong> {profile.gender}</p>}
          {profile.height_cm && <p><strong>Height (cm):</strong> {profile.height_cm}</p>}
          {profile.weight_kg && <p><strong>Weight (kg):</strong> {profile.weight_kg}</p>}
          {profile.activity_level && <p><strong>Activity level:</strong> {profile.activity_level}</p>}
          {profile.goal && <p><strong>Goal:</strong> {profile.goal}</p>}
          {profile.health_conditions && profile.health_conditions.length > 0 && (
            <p><strong>Health conditions:</strong> {profile.health_conditions.join(', ')}</p>
          )}
          {profile.diet_preferences && profile.diet_preferences.length > 0 && (
            <p><strong>Diet preferences:</strong> {profile.diet_preferences.join(', ')}</p>
          )}
          {profile.daily_calorie_target && <p><strong>Daily calorie target:</strong> {profile.daily_calorie_target}</p>}
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
      <div className="card">
        <div className="brand">
          <h1>AI Meal Planner</h1>
          <p className="lead">Personalized meal planning powered by your profile</p>
        </div>
        <div>
          {!token ? (
            <AuthForm onLogin={handleLogin} />
          ) : (
            <Profile token={token} onLogout={handleLogout} />
          )}
        </div>
      </div>
    </div>
  )
}

export default App
