import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { UserProfileProvider } from './context/UserProfileContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <UserProfileProvider>
          <App />
        </UserProfileProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
