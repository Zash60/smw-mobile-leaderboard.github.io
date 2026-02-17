import { useState } from 'react'

export function LeaderboardList({ runs, loading }) {
  const [search, setSearch] = useState('')

  const filteredRuns = runs.filter(run => 
    run.player?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500">
        Loading...
      </div>
    )
  }

  if (runs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No runs submitted for this category
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Search player..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input max-w-xs"
      />
      
      <div className="space-y-2">
        {filteredRuns.map((run, index) => (
          <LeaderboardItem key={run.id} run={run} rank={index + 1} />
        ))}
      </div>

      {filteredRuns.length === 0 && search && (
        <div className="text-center py-8 text-gray-500">
          No player found for "{search}"
        </div>
      )}
    </div>
  )
}

function LeaderboardItem({ run, rank }) {
  const rankColors = {
    1: 'bg-amber-400 text-amber-900',
    2: 'bg-gray-300 text-gray-700',
    3: 'bg-amber-600 text-amber-100',
    default: 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
  }

  const rankClass = rankColors[rank] || rankColors.default

  return (
    <div className="card p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${rankClass}`}>
        #{rank}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{run.player}</span>
          {run.videoUrl && (
            <a 
              href={run.videoUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-red-500 hover:text-red-600 flex-shrink-0"
              title="Watch video"
            >
              <YouTubeIcon />
            </a>
          )}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {run.date}
        </div>
      </div>
      
      <div className="text-right">
        <div className="font-mono font-medium">{run.time}</div>
      </div>
    </div>
  )
}

function YouTubeIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21.582,6.186 C21.328,5.247 20.753,4.672 19.814,4.418 C18.109,4 12,4 12,4 C12,4 5.891,4 4.186,4.418 C3.247,4.672 2.672,5.247 2.418,6.186 C2,7.891 2,12 2,12 C2,12 2,16.109 2.418,17.814 C2.672,18.753 3.247,19.328 4.186,19.582 C5.891,20 12,20 12,20 C12,20 18.109,20 19.814,19.582 C20.753,19.328 21.328,18.753 21.582,17.814 C22,16.109 22,12 22,12 C22,12 22,7.891 21.582,6.186 Z" fill="currentColor"/>
      <path d="M9.75,15.5 L15.75,12 L9.75,8.5 L9.75,15.5 Z" fill="white"/>
    </svg>
  )
}
