import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useSubmissions, useRunActions, useCategories } from '../../hooks/useFirebase'
import { SubmissionCard } from '../submissions/SubmissionCard'
import { LoginForm } from './LoginForm'

export function ModPanel({ gameId }) {
  const { user, logout, login } = useAuth()
  const [status, setStatus] = useState('pending')
  const [loginError, setLoginError] = useState('')

  const handleLogin = async (email, password) => {
    try {
      await login(email, password)
    } catch (err) {
      setLoginError(err.message)
    }
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} error={loginError} />
  }

  return <ModPanelContent gameId={gameId} status={status} setStatus={setStatus} logout={logout} />
}

function ModPanelContent({ gameId, status, setStatus, logout }) {
  const { submissions, loading } = useSubmissions(gameId, status)
  const { categories } = useCategories(gameId)
  const { verifyRun, rejectRun, deleteRun, updateRun } = useRunActions(gameId)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const handleVerify = async (id) => {
    try {
      await verifyRun(id)
      alert('Run approved!')
    } catch (err) {
      alert('Error approving run: ' + err.message)
    }
  }

  const handleReject = async (id) => {
    try {
      await rejectRun(id)
      alert('Run rejected!')
    } catch (err) {
      alert('Error rejecting run: ' + err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this run?')) return
    try {
      await deleteRun(id)
      alert('Run deleted!')
    } catch (err) {
      alert('Error deleting run: ' + err.message)
    }
  }

  const handleEdit = async (id, updates) => {
    try {
      await updateRun(id, updates)
      alert('Run updated!')
    } catch (err) {
      alert('Error updating run: ' + err.message)
    }
  }

  const tabs = [
    { id: 'pending', label: 'Pending' },
    { id: 'verified', label: 'Verified' },
    { id: 'rejected', label: 'Rejected' }
  ]

  const emptyMessages = {
    pending: 'No pending submissions',
    verified: 'No verified submissions',
    rejected: 'No rejected submissions'
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Moderation Panel</h2>
        <button onClick={handleLogout} className="btn btn-secondary">
          Logout
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setStatus(tab.id)}
            className={`
              px-4 py-2 text-sm font-medium rounded-lg transition-colors
              ${status === tab.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {emptyMessages[status]}
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map(sub => (
            <SubmissionCard
              key={sub.id}
              submission={sub}
              categories={categories}
              gameId={gameId}
              onVerify={handleVerify}
              onReject={handleReject}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}
    </div>
  )
}
