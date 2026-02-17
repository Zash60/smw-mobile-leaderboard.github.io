import { useState } from 'react'
import { User, Settings, LogOut, Trophy, Clock, Calendar } from 'lucide-react'
import { useUserProfile } from '../../context/UserProfileContext'
import { formatTime, parseTimeToMilliseconds } from '../../utils/timeParser'

export function UserProfile() {
  const { currentUser, userProfile, setUser, updateProfile } = useUserProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    displayName: userProfile?.displayName || '',
    bio: userProfile?.bio || '',
    location: userProfile?.location || '',
    twitter: userProfile?.twitter || '',
    youtube: userProfile?.youtube || ''
  })

  if (!currentUser) {
    return (
      <div className="card p-6 text-center">
        <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold mb-2">Perfil de Visitante</h3>
        <p className="text-gray-500 mb-4">Você está navegando anonimamente. Faça login para salvar seu histórico e estatísticas.</p>
        <div className="flex gap-3 justify-center">
          <button 
            onClick={() => setUser({ id: 'guest_' + Date.now(), name: 'Visitante' })}
            className="btn btn-secondary"
          >
            Continuar como Visitante
          </button>
          <button 
            onClick={() => setUser({ id: 'user_' + Date.now(), name: 'zash' })}
            className="btn btn-primary"
          >
            Entrar
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-4">O login é opcional. Você pode usar todas as funcionalidades como visitante.</p>
      </div>
    )
  }

  const handleSave = async () => {
    await updateProfile(editForm)
    setIsEditing(false)
  }

  // Calcular estatísticas do usuário (simulado - em produção viria do backend)
  const stats = {
    totalRuns: userProfile?.totalRuns || 0,
    bestTime: userProfile?.bestTime || '-',
    joinDate: userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString('pt-BR') : '-'
  }

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
            {userProfile?.avatar ? (
              <img src={userProfile.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
            ) : (
              currentUser.name?.[0]?.toUpperCase() || <User className="w-8 h-8" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{userProfile?.displayName || currentUser.name}</h2>
            <p className="text-gray-500">{userProfile?.bio || 'Sem bio'}</p>
            {userProfile?.location && (
              <p className="text-sm text-gray-400 mt-1">📍 {userProfile.location}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="btn btn-icon"
            title="Editar perfil"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setUser(null)}
            className="btn btn-icon text-red-500"
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Nome de exibição</label>
            <input
              type="text"
              className="input"
              value={editForm.displayName}
              onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea
              className="input"
              rows={3}
              value={editForm.bio}
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Localização</label>
            <input
              type="text"
              className="input"
              value={editForm.location}
              onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="btn btn-primary">
              Salvar
            </button>
            <button onClick={() => setIsEditing(false)} className="btn btn-secondary">
              Cancelar
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
          <div className="text-2xl font-bold">{stats.totalRuns}</div>
          <div className="text-sm text-gray-500">Runs enviadas</div>
        </div>
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Clock className="w-6 h-6 mx-auto mb-2 text-blue-500" />
          <div className="text-2xl font-bold">{stats.bestTime}</div>
          <div className="text-sm text-gray-500">Melhor tempo</div>
        </div>
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Calendar className="w-6 h-6 mx-auto mb-2 text-green-500" />
          <div className="text-2xl font-bold">{stats.joinDate}</div>
          <div className="text-sm text-gray-500">Membro desde</div>
        </div>
      </div>

      {userProfile?.twitter || userProfile?.youtube ? (
        <div className="mt-6 flex gap-4">
          {userProfile.twitter && (
            <a 
              href={`https://twitter.com/${userProfile.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              Twitter: @{userProfile.twitter}
            </a>
          )}
          {userProfile.youtube && (
            <a 
              href={`https://youtube.com/${userProfile.youtube}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-500 hover:underline"
            >
              YouTube
            </a>
          )}
        </div>
      ) : null}
    </div>
  )
}
