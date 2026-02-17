import { BarChart3, User } from 'lucide-react'

export function Navigation({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'home', label: 'Leaderboard' },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'mod', label: 'Moderation' }
  ]

  return (
    <nav className="border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex gap-1">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2
                  ${activeTab === tab.id 
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}
                `}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
