import { useState, useEffect } from 'react'
import './App.css'
import { registerUser, loginUser, getProfile, updateProfile } from './api'

function AuthForm({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
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
    target_weight: '',
    health_conditions: [], // Array for multi-select
    other_health_condition: '',
    diet_preferences: [], // Array for multi-select
    other_diet_preference: '',
    daily_calorie_target: '',
    carbs_percentage: '',
    protein_percentage: '',
    fat_percentage: ''
  })
  const [error, setError] = useState(null)
  const [bmi, setBmi] = useState(null)

  const handleChange = (e) => {
    const value = e.target.value
    setForm({ ...form, [e.target.name]: value })
    
    // Calculate BMI on weight/height change
    if (e.target.name === 'height_cm' || e.target.name === 'weight_kg') {
      calculateBMI(
        e.target.name === 'height_cm' ? value : form.height_cm,
        e.target.name === 'weight_kg' ? value : form.weight_kg
      )
    }
  }

  const handleMultiSelect = (field, value) => {
    const currentValues = form[field] || []
    if (currentValues.includes(value)) {
      setForm({ ...form, [field]: currentValues.filter(v => v !== value) })
    } else {
      setForm({ ...form, [field]: [...currentValues, value] })
    }
  }

  const calculateBMI = (height, weight) => {
    if (height && weight && height > 0) {
      const heightInMeters = height / 100
      const bmiValue = (weight / (heightInMeters * heightInMeters)).toFixed(1)
      setBmi(bmiValue)
    } else {
      setBmi(null)
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
      setError(null)
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => prev - 1)
    setError(null)
  }

  const validateStep = (step) => {
    setError(null)
    switch (step) {
      case 1:
        if (!form.name || !form.email || !form.password) {
          setError('Please fill in all required fields')
          return false
        }
        if (form.password.length < 6) {
          setError('Password must be at least 6 characters')
          return false
        }
        return true
      case 2:
        if (!form.age || !form.gender || !form.height_cm || !form.weight_kg || !form.activity_level) {
          setError('Please fill in all required fields')
          return false
        }
        if (form.age < 13) {
          setError('You must be at least 13 years old')
          return false
        }
        return true
      case 3:
        if (!form.goal) {
          setError('Please select your health goal')
          return false
        }
        return true
      default:
        return true
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      let res
      if (isRegister) {
        // prepare payload
        const payload = { ...form }
        
        // Ensure arrays exist before spreading
        if (!Array.isArray(payload.health_conditions)) {
          payload.health_conditions = []
        }
        if (!Array.isArray(payload.diet_preferences)) {
          payload.diet_preferences = []
        }
        
        // Add other conditions/preferences to arrays if filled
        if (payload.other_health_condition) {
          payload.health_conditions = [...payload.health_conditions, payload.other_health_condition]
        }
        if (payload.other_diet_preference) {
          payload.diet_preferences = [...payload.diet_preferences, payload.other_diet_preference]
        }
        
        // Clean up temporary fields
        delete payload.other_health_condition
        delete payload.other_diet_preference
        
        // convert empty numeric strings to undefined
        const numericFields = ['age', 'height_cm', 'weight_kg', 'daily_calorie_target', 'target_weight', 
         'carbs_percentage', 'protein_percentage', 'fat_percentage']
        
        numericFields.forEach((k) => {
          if (payload[k] === '' || payload[k] === undefined || payload[k] === null) {
            delete payload[k]
          } else if (payload[k]) {
            payload[k] = Number(payload[k])
          }
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="form-section">
            <div className="form-section-title">👤 Account Information</div>
            <div className="form-grid">
              <div className="form-row">
                <label>Full Name <span className="required">*</span></label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Enter your full name" required />
              </div>
              <div className="form-row">
                <label>Email <span className="required">*</span></label>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" required />
              </div>
              <div className="form-row">
                <label>Password <span className="required">*</span></label>
                <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="At least 6 characters" required />
              </div>
            </div>
          </div>
        )
      
      case 2:
        return (
          <div className="form-section">
            <div className="form-section-title">📊 Physical Statistics</div>
            <div className="form-grid">
              <div className="form-row">
                <label>Age <span className="required">*</span></label>
                <input name="age" type="number" min="13" value={form.age} onChange={handleChange} placeholder="Your age (13+)" required />
              </div>
              <div className="form-row">
                <label>Gender <span className="required">*</span></label>
                <select name="gender" value={form.gender} onChange={handleChange} required>
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-Binary</option>
                  <option value="prefer-not-to-say">Prefer Not to Say</option>
                </select>
              </div>
              <div className="form-row">
                <label>Height (cm) <span className="required">*</span></label>
                <input name="height_cm" type="number" min="1" value={form.height_cm} onChange={handleChange} placeholder="e.g., 170" required />
              </div>
              <div className="form-row">
                <label>Weight (kg) <span className="required">*</span></label>
                <input name="weight_kg" type="number" min="1" step="0.1" value={form.weight_kg} onChange={handleChange} placeholder="e.g., 70" required />
              </div>
              {bmi && (
                <div className="bmi-display">
                  <strong>Your BMI:</strong> <span className="bmi-value">{bmi}</span>
                  <span className="bmi-category">({getBMICategory(bmi)})</span>
                </div>
              )}
              <div className="form-row">
                <label>Activity Level <span className="required">*</span></label>
                <select name="activity_level" value={form.activity_level} onChange={handleChange} required>
                  <option value="">Select Activity Level</option>
                  <option value="sedentary">Sedentary - Little or no exercise</option>
                  <option value="light">Lightly Active - Exercise 1-3 days/week</option>
                  <option value="moderate">Moderately Active - Exercise 3-5 days/week</option>
                  <option value="active">Very Active - Exercise 6-7 days/week</option>
                </select>
              </div>
            </div>
          </div>
        )
      
      case 3:
        return (
          <div className="form-section">
            <div className="form-section-title">🎯 Health Goals</div>
            <div className="form-grid">
              <div className="form-row">
                <label>Weight Goal <span className="required">*</span></label>
                <select name="goal" value={form.goal} onChange={handleChange} required>
                  <option value="">Select Your Goal</option>
                  <option value="weight_loss">Lose Weight</option>
                  <option value="maintain">Maintain Weight</option>
                  <option value="weight_gain">Gain Weight</option>
                </select>
              </div>
              <div className="form-row">
                <label>Target Weight (kg) <span className="optional-label">(Optional)</span></label>
                <input name="target_weight" type="number" step="0.1" value={form.target_weight} onChange={handleChange} placeholder="Your target weight" />
              </div>
            </div>
            
            <div className="checkbox-group">
              <label className="group-label">Dietary Preferences <span className="optional-label">(Select all that apply)</span></label>
              <div className="checkbox-options">
                {['Vegetarian', 'Vegan', 'Keto', 'Gluten-Free', 'Paleo', 'Low-Carb'].map(pref => (
                  <label key={pref} className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={form.diet_preferences.includes(pref)} 
                      onChange={() => handleMultiSelect('diet_preferences', pref)}
                    />
                    <span>{pref}</span>
                  </label>
                ))}
              </div>
              <input 
                name="other_diet_preference" 
                className="other-input"
                value={form.other_diet_preference} 
                onChange={handleChange} 
                placeholder="Other dietary preferences or allergies..."
              />
            </div>
          </div>
        )
      
      case 4:
        return (
          <div className="form-section">
            <div className="form-section-title">🏥 Health Conditions</div>
            <div className="checkbox-group">
              <label className="group-label">Health Conditions <span className="optional-label">(Select all that apply)</span></label>
              <div className="checkbox-options">
                {['Diabetes', 'Hypertension', 'Heart Disease', 'Thyroid Disorders', 'High Cholesterol', 'PCOS'].map(condition => (
                  <label key={condition} className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={form.health_conditions.includes(condition)} 
                      onChange={() => handleMultiSelect('health_conditions', condition)}
                    />
                    <span>{condition}</span>
                  </label>
                ))}
              </div>
              <input 
                name="other_health_condition" 
                className="other-input"
                value={form.other_health_condition} 
                onChange={handleChange} 
                placeholder="Other health conditions..."
              />
            </div>
          </div>
        )
      
      case 5:
        return (
          <div className="form-section">
            <div className="form-section-title">📈 Daily Overview <span className="optional-label">(All Optional)</span></div>
            <div className="form-grid">
              <div className="form-row">
                <label>Daily Calorie Target</label>
                <input name="daily_calorie_target" type="number" value={form.daily_calorie_target} onChange={handleChange} placeholder="e.g., 2000 kcal" />
              </div>
            </div>
            <div className="nutrient-breakdown">
              <p className="breakdown-title">Nutrient Distribution (should total 100%)</p>
              <div className="form-grid">
                <div className="form-row">
                  <label>Carbohydrates (%)</label>
                  <input name="carbs_percentage" type="number" min="0" max="100" value={form.carbs_percentage} onChange={handleChange} placeholder="e.g., 50" />
                </div>
                <div className="form-row">
                  <label>Proteins (%)</label>
                  <input name="protein_percentage" type="number" min="0" max="100" value={form.protein_percentage} onChange={handleChange} placeholder="e.g., 25" />
                </div>
                <div className="form-row">
                  <label>Fats (%)</label>
                  <input name="fat_percentage" type="number" min="0" max="100" value={form.fat_percentage} onChange={handleChange} placeholder="e.g., 25" />
                </div>
              </div>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return 'Underweight'
    if (bmi < 25) return 'Normal'
    if (bmi < 30) return 'Overweight'
    return 'Obese'
  }

  const totalSteps = 5

  return (
    <div className="auth">
      <h2>{isRegister ? 'Create Your Account' : 'Welcome Back'}</h2>
      
      {isRegister && (
        <div className="progress-bar">
          <div className="progress-steps">
            {[1, 2, 3, 4, 5].map(step => (
              <div key={step} className={`progress-step ${currentStep >= step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}>
                <div className="step-number">{currentStep > step ? '✓' : step}</div>
                <div className="step-label">
                  {step === 1 && 'Account'}
                  {step === 2 && 'Stats'}
                  {step === 3 && 'Goals'}
                  {step === 4 && 'Health'}
                  {step === 5 && 'Overview'}
                </div>
              </div>
            ))}
          </div>
          <div className="progress-fill" style={{ width: `${(currentStep / totalSteps) * 100}%` }}></div>
        </div>
      )}

      <form onSubmit={submit}>
        {isRegister ? (
          <>
            {renderStepContent()}
            
            <div className="form-navigation">
              {currentStep > 1 && (
                <button type="button" onClick={prevStep} className="btn-ghost">
                  ← Previous
                </button>
              )}
              {currentStep < totalSteps ? (
                <button type="button" onClick={nextStep} className="btn-primary">
                  Next →
                </button>
              ) : (
                <button type="submit" className="btn-primary">
                  Create Account 🎉
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="form-grid">
              <div className="form-row">
                <label>Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" required />
              </div>
              <div className="form-row">
                <label>Password</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Enter your password" required />
              </div>
            </div>
            <button type="submit">Login</button>
          </>
        )}
      </form>
      
      <button onClick={() => { setIsRegister((s) => !s); setCurrentStep(1); setError(null); }} className="link">
        {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
      </button>
      
      {error && <p className="error">{error}</p>}
    </div>
  )
}

function Profile({ token, onLogout, isHeaderMode = false }) {
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [error, setError] = useState(null)
  const [showProfile, setShowProfile] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const p = await getProfile(token)
        setProfile(p)
        setForm({ 
          name: p.name || '', 
          email: p.email || '',
          age: p.age || '',
          gender: p.gender || '',
          height_cm: p.height_cm || '',
          weight_kg: p.weight_kg || '',
          activity_level: p.activity_level || '',
          goal: p.goal || '',
          target_weight: p.target_weight || '',
          health_conditions: Array.isArray(p.health_conditions) ? p.health_conditions.join(', ') : '',
          diet_preferences: Array.isArray(p.diet_preferences) ? p.diet_preferences.join(', ') : '',
          daily_calorie_target: p.daily_calorie_target || '',
          carbs_percentage: p.carbs_percentage || '',
          protein_percentage: p.protein_percentage || '',
          fat_percentage: p.fat_percentage || ''
        })
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
      
      // Handle string to array conversion if needed
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
      
      // Convert numeric fields safely
      const numericFields = ['age', 'height_cm', 'weight_kg', 'daily_calorie_target', 
                            'target_weight', 'carbs_percentage', 'protein_percentage', 'fat_percentage']
      
      numericFields.forEach((k) => {
        if (payload[k] === '' || payload[k] === undefined || payload[k] === null) {
          delete payload[k]
        } else if (payload[k]) {
          payload[k] = Number(payload[k])
        }
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
          <p className="error">{error}</p>
        </div>
      )
    }
    return <p>Loading...</p>
  }

  // Header mode - compact profile icon
  if (isHeaderMode) {
    return (
      <div className="header-profile">
        <div className="header-profile-icon" onClick={() => setShowProfile(!showProfile)}>
          <div className="profile-avatar">
            {profile?.name ? profile.name.charAt(0).toUpperCase() : '👤'}
          </div>
          <span className="profile-name">{profile?.name}</span>
          <span className={`dropdown-arrow ${showProfile ? 'open' : ''}`}>▼</span>
        </div>
        
        {showProfile && (
          <div className="header-profile-dropdown">
            <div className="dropdown-header">
              <p><strong>{profile.name}</strong></p>
              <p className="dropdown-email">{profile.email}</p>
            </div>
            <div className="dropdown-divider"></div>
            <button className="dropdown-item" onClick={() => { setShowProfile(false); }}>
              <span>👤</span> View Full Profile
            </button>
            <button className="dropdown-item" onClick={() => { setShowProfile(false); }}>
              <span>⚙️</span> Settings
            </button>
            <div className="dropdown-divider"></div>
            <button className="dropdown-item logout" onClick={onLogout}>
              <span>🚪</span> Logout
            </button>
          </div>
        )}
      </div>
    )
  }

  // Full profile mode
  return (
    <div className="profile">
      <div className="profile-header">
        <div className="profile-icon-container" onClick={() => setShowProfile(!showProfile)}>
          <div className="profile-icon">
            {profile?.name ? profile.name.charAt(0).toUpperCase() : '👤'}
          </div>
          <div className="profile-info-preview">
            <h3>{profile?.name || 'User'}</h3>
            <p className="profile-subtitle">Click to {showProfile ? 'hide' : 'view'} profile</p>
          </div>
          <span className={`profile-toggle ${showProfile ? 'open' : ''}`}>▼</span>
        </div>
      </div>

      {showProfile && !editing && (
        <div className="profile-display">
          <div className="profile-section">
            <h3>👤 Personal Information</h3>
            <p><strong>Name:</strong> {profile.name}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            {profile.age && <p><strong>Age:</strong> {profile.age} years</p>}
            {profile.gender && <p><strong>Gender:</strong> {profile.gender}</p>}
          </div>

          {(profile.height_cm || profile.weight_kg) && (
            <div className="profile-section">
              <h3>📊 Body Metrics</h3>
              {profile.height_cm && <p><strong>Height:</strong> {profile.height_cm} cm</p>}
              {profile.weight_kg && <p><strong>Weight:</strong> {profile.weight_kg} kg</p>}
              {profile.height_cm && profile.weight_kg && (
                <p className="bmi-info">
                  <strong>BMI:</strong> {((profile.weight_kg / Math.pow(profile.height_cm / 100, 2)).toFixed(1))}
                </p>
              )}
              {profile.activity_level && <p><strong>Activity Level:</strong> {profile.activity_level}</p>}
            </div>
          )}

          {(profile.goal || profile.target_weight) && (
            <div className="profile-section">
              <h3>🎯 Goals</h3>
              {profile.goal && <p><strong>Weight Goal:</strong> {profile.goal.replace('_', ' ')}</p>}
              {profile.target_weight && <p><strong>Target Weight:</strong> {profile.target_weight} kg</p>}
              {profile.daily_calorie_target && <p><strong>Daily Calorie Target:</strong> {profile.daily_calorie_target} kcal</p>}
            </div>
          )}

          {(profile.diet_preferences?.length > 0 || profile.health_conditions?.length > 0) && (
            <div className="profile-section">
              <h3>🌿 Health & Diet</h3>
              {profile.diet_preferences && profile.diet_preferences.length > 0 && (
                <p><strong>Diet Preferences:</strong> {profile.diet_preferences.join(', ')}</p>
              )}
              {profile.health_conditions && profile.health_conditions.length > 0 && (
                <p><strong>Health Conditions:</strong> {profile.health_conditions.join(', ')}</p>
              )}
            </div>
          )}

          {(profile.carbs_percentage || profile.protein_percentage || profile.fat_percentage) && (
            <div className="profile-section">
              <h3>📈 Nutrient Distribution</h3>
              <div className="nutrient-display">
                {profile.carbs_percentage && <p><strong>Carbohydrates:</strong> {profile.carbs_percentage}%</p>}
                {profile.protein_percentage && <p><strong>Proteins:</strong> {profile.protein_percentage}%</p>}
                {profile.fat_percentage && <p><strong>Fats:</strong> {profile.fat_percentage}%</p>}
              </div>
            </div>
          )}

          <div className="profile-actions">
            <button onClick={() => setEditing(true)} className="btn-primary">Edit Profile</button>
            <button onClick={onLogout} className="btn-ghost">Logout</button>
          </div>
        </div>
      )}

      {editing && (
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
            <button className="btn-ghost" onClick={() => { setEditing(false); setShowProfile(false); }}>Cancel</button>
          </div>
        </div>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  )
}

// Dashboard Pages
function DashboardPage() {
  return (
    <div className="page-content">
      <div className="page-header">
        <h2>📊 Dashboard</h2>
        <p className="page-subtitle">Welcome back! Here's your nutrition overview</p>
      </div>
      
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>🎯 Today's Goal</h3>
          <div className="card-content">
            <p className="big-number">2000 <span className="unit">kcal</span></p>
            <p className="card-label">Daily Target</p>
          </div>
        </div>
        
        <div className="dashboard-card">
          <h3>🔥 Calories Consumed</h3>
          <div className="card-content">
            <p className="big-number">1450 <span className="unit">kcal</span></p>
            <p className="card-label">550 remaining</p>
          </div>
        </div>
        
        <div className="dashboard-card">
          <h3>💪 Activity</h3>
          <div className="card-content">
            <p className="big-number">350 <span className="unit">kcal</span></p>
            <p className="card-label">Burned today</p>
          </div>
        </div>
        
        <div className="dashboard-card">
          <h3>⚖️ Weight Progress</h3>
          <div className="card-content">
            <p className="big-number">-2.5 <span className="unit">kg</span></p>
            <p className="card-label">This month</p>
          </div>
        </div>
      </div>
      
      <div className="dashboard-section">
        <h3>📈 Nutrient Breakdown</h3>
        <div className="nutrient-bars">
          <div className="nutrient-bar">
            <div className="bar-label">
              <span>Carbs</span>
              <span>50%</span>
            </div>
            <div className="bar-track">
              <div className="bar-fill carbs" style={{width: '50%'}}></div>
            </div>
          </div>
          <div className="nutrient-bar">
            <div className="bar-label">
              <span>Protein</span>
              <span>25%</span>
            </div>
            <div className="bar-track">
              <div className="bar-fill protein" style={{width: '25%'}}></div>
            </div>
          </div>
          <div className="nutrient-bar">
            <div className="bar-label">
              <span>Fats</span>
              <span>25%</span>
            </div>
            <div className="bar-track">
              <div className="bar-fill fats" style={{width: '25%'}}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MealPlanPage() {
  return (
    <div className="page-content">
      <div className="page-header">
        <h2>🍽️ Meal Plan Generator</h2>
        <p className="page-subtitle">AI-powered meal planning tailored to your goals</p>
      </div>
      <div className="coming-soon">
        <p>🚀 Coming Soon!</p>
        <p className="coming-soon-subtitle">Generate personalized meal plans</p>
      </div>
    </div>
  )
}

function FoodRecognitionPage() {
  return (
    <div className="page-content">
      <div className="page-header">
        <h2>📷 Food Recognition</h2>
        <p className="page-subtitle">Identify food from images using AI</p>
      </div>
      <div className="coming-soon">
        <p>🚀 Coming Soon!</p>
        <p className="coming-soon-subtitle">Upload or capture food images for instant recognition</p>
      </div>
    </div>
  )
}

function CalorieEstimationPage() {
  return (
    <div className="page-content">
      <div className="page-header">
        <h2>🔢 Calorie Estimation</h2>
        <p className="page-subtitle">Estimate calories and nutrients in your meals</p>
      </div>
      <div className="coming-soon">
        <p>🚀 Coming Soon!</p>
        <p className="coming-soon-subtitle">Get accurate calorie and nutrient information</p>
      </div>
    </div>
  )
}

function GroceryListPage() {
  return (
    <div className="page-content">
      <div className="page-header">
        <h2>🛒 Grocery List</h2>
        <p className="page-subtitle">Generate shopping lists from your meal plans</p>
      </div>
      <div className="coming-soon">
        <p>🚀 Coming Soon!</p>
        <p className="coming-soon-subtitle">Smart grocery lists based on your meal plans</p>
      </div>
    </div>
  )
}

function ChatbotPage() {
  return (
    <div className="page-content">
      <div className="page-header">
        <h2>💬 Chatbot Assistant</h2>
        <p className="page-subtitle">Your AI nutrition and meal planning assistant</p>
      </div>
      <div className="coming-soon">
        <p>🚀 Coming Soon!</p>
        <p className="coming-soon-subtitle">Ask questions about nutrition, recipes, and meal planning</p>
      </div>
    </div>
  )
}

function NutritionPage() {
  return (
    <div className="page-content">
      <div className="page-header">
        <h2>🥗 Nutrition Tracker</h2>
        <p className="page-subtitle">Track your daily nutrition intake</p>
      </div>
      <div className="coming-soon">
        <p>🚀 Coming Soon!</p>
        <p className="coming-soon-subtitle">Log meals and track your nutrition</p>
      </div>
    </div>
  )
}

function RecipesPage() {
  return (
    <div className="page-content">
      <div className="page-header">
        <h2>📖 Recipes</h2>
        <p className="page-subtitle">Healthy recipes tailored to your goals</p>
      </div>
      <div className="coming-soon">
        <p>🚀 Coming Soon!</p>
        <p className="coming-soon-subtitle">Discover recipes that match your dietary preferences</p>
      </div>
    </div>
  )
}

function ProfilePage({ token, onLogout }) {
  return (
    <div className="page-content">
      <div className="page-header">
        <h2>👤 My Profile</h2>
        <p className="page-subtitle">Manage your account and preferences</p>
      </div>
      <Profile token={token} onLogout={onLogout} isHeaderMode={false} />
    </div>
  )
}

function SettingsPage() {
  return (
    <div className="page-content">
      <div className="page-header">
        <h2>⚙️ Settings</h2>
        <p className="page-subtitle">Customize your experience</p>
      </div>
      <div className="coming-soon">
        <p>🚀 Coming Soon!</p>
        <p className="coming-soon-subtitle">Preferences and account settings</p>
      </div>
    </div>
  )
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [currentPage, setCurrentPage] = useState('dashboard')

  const handleLogin = (t) => {
    localStorage.setItem('token', t)
    setToken(t)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setCurrentPage('dashboard')
  }

  // If not logged in, show auth form
  if (!token) {
    return (
      <div className="container">
        <div className="card">
          <div className="brand">
            <h1>AI Meal Planner</h1>
            <p className="lead">Personalized meal planning powered by your profile</p>
          </div>
          <div>
            <AuthForm onLogin={handleLogin} />
          </div>
        </div>
      </div>
    )
  }

  // Dashboard layout when logged in
  return (
    <div className="dashboard-container">
      {/* Top Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>🌱 AI Meal Planner</h1>
        </div>
        <div className="header-right">
          <Profile token={token} onLogout={handleLogout} isHeaderMode={true} />
        </div>
      </header>

      {/* Main Dashboard */}
      <div className="dashboard-main">
        {/* Left Sidebar Navigation */}
        <aside className="dashboard-sidebar">
          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentPage('dashboard')}
            >
              <span className="nav-icon">📊</span>
              <span className="nav-label">Progress Dashboard</span>
            </button>
            <button 
              className={`nav-item ${currentPage === 'food-recognition' ? 'active' : ''}`}
              onClick={() => setCurrentPage('food-recognition')}
            >
              <span className="nav-icon">📷</span>
              <span className="nav-label">Food Recognition</span>
            </button>
            <button 
              className={`nav-item ${currentPage === 'calorie-estimation' ? 'active' : ''}`}
              onClick={() => setCurrentPage('calorie-estimation')}
            >
              <span className="nav-icon">🔢</span>
              <span className="nav-label">Calorie Estimation</span>
            </button>
            <button 
              className={`nav-item ${currentPage === 'meal-plan' ? 'active' : ''}`}
              onClick={() => setCurrentPage('meal-plan')}
            >
              <span className="nav-icon">🍽️</span>
              <span className="nav-label">Meal Plan Generator</span>
            </button>
            <button 
              className={`nav-item ${currentPage === 'grocery-list' ? 'active' : ''}`}
              onClick={() => setCurrentPage('grocery-list')}
            >
              <span className="nav-icon">�</span>
              <span className="nav-label">Grocery List</span>
            </button>
            <button 
              className={`nav-item ${currentPage === 'chatbot' ? 'active' : ''}`}
              onClick={() => setCurrentPage('chatbot')}
            >
              <span className="nav-icon">💬</span>
              <span className="nav-label">Chatbot Assistant</span>
            </button>
            <button 
              className={`nav-item ${currentPage === 'profile' ? 'active' : ''}`}
              onClick={() => setCurrentPage('profile')}
            >
              <span className="nav-icon">👤</span>
              <span className="nav-label">Profile</span>
            </button>
            <button 
              className={`nav-item ${currentPage === 'settings' ? 'active' : ''}`}
              onClick={() => setCurrentPage('settings')}
            >
              <span className="nav-icon">⚙️</span>
              <span className="nav-label">Settings</span>
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="dashboard-content">
          {currentPage === 'dashboard' && <DashboardPage />}
          {currentPage === 'food-recognition' && <FoodRecognitionPage />}
          {currentPage === 'calorie-estimation' && <CalorieEstimationPage />}
          {currentPage === 'meal-plan' && <MealPlanPage />}
          {currentPage === 'grocery-list' && <GroceryListPage />}
          {currentPage === 'chatbot' && <ChatbotPage />}
          {currentPage === 'profile' && <ProfilePage token={token} onLogout={handleLogout} />}
          {currentPage === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  )
}

export default App
