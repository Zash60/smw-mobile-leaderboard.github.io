import { useState } from 'react'
import { Header } from './components/layout/Header'
import { Navigation } from './components/layout/Navigation'
import { CategorySelector } from './components/leaderboard/CategorySelector'
import { LeaderboardList } from './components/leaderboard/LeaderboardList'
import { SubmitForm } from './components/submissions/SubmitForm'
import { ModPanel } from './components/mod/ModPanel'
import { StatsCharts } from './components/stats/StatsCharts'
import { UserProfile } from './components/user/UserProfile'
import { useCategories, useLeaderboard, useRunActions } from './hooks/useFirebase'

function App() {
  const [gameId, setGameId] = useState('smw')
  const [activeTab, setActiveTab] = useState('home')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [submitModalOpen, setSubmitModalOpen] = useState(false)

  const { categories, loading: categoriesLoading } = useCategories(gameId)
  const { runs, loading: runsLoading } = useLeaderboard(
    gameId,
    selectedCategory?.categoryId,
    selectedCategory?.variableId,
    selectedCategory?.valueId
  )
  const { submitRun } = useRunActions(gameId)

  const handleCategorySelect = (selection) => {
    setSelectedCategory(selection)
  }

  const handleSubmitRun = async (runData) => {
    try {
      await submitRun(runData)
      alert('Run submitted successfully!')
    } catch (err) {
      alert('Error submitting run: ' + err.message)
    }
  }

  const handleGameToggle = () => {
    const newGameId = gameId === 'smw' ? 'smwext' : 'smw'
    setGameId(newGameId)
    setSelectedCategory(null)
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <Navigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
      />

      <main className="max-w-5xl mx-auto py-6 px-4">
        {activeTab === 'home' && (
          <HomeTab
            gameId={gameId}
            categories={categories}
            categoriesLoading={categoriesLoading}
            selectedCategory={selectedCategory}
            runs={runs}
            runsLoading={runsLoading}
            onCategorySelect={handleCategorySelect}
            onGameToggle={handleGameToggle}
            onSubmitModalOpen={() => setSubmitModalOpen(true)}
          />
        )}

        {activeTab === 'stats' && (
          <StatsTab runs={runs} categories={categories} selectedCategory={selectedCategory} />
        )}

        {activeTab === 'profile' && (
          <ProfileTab />
        )}

        {activeTab === 'mod' && (
          <ModPanel gameId={gameId} />
        )}
      </main>

      <SubmitForm
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        categories={categories}
        gameId={gameId}
        onSubmit={handleSubmitRun}
      />
    </div>
  )
}

function HomeTab({
  gameId,
  categories,
  categoriesLoading,
  selectedCategory,
  runs,
  runsLoading,
  onCategorySelect,
  onGameToggle,
  onSubmitModalOpen
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onGameToggle}
          className="btn btn-secondary"
        >
          {gameId === 'smw' ? 'View Extensions' : 'View Main Categories'}
        </button>
        
        <button
          onClick={onSubmitModalOpen}
          className="btn btn-primary"
        >
          Submit Run
        </button>
      </div>

      <div className="card p-4">
        <CategorySelector
          categories={categories}
          gameId={gameId}
          loading={categoriesLoading}
          onCategorySelect={onCategorySelect}
        />
      </div>

      {selectedCategory && (
        <div>
          {gameId === 'smw' && (
            <h2 className="text-xl font-semibold mb-4">{selectedCategory.title}</h2>
          )}
          <LeaderboardList runs={runs} loading={runsLoading} />
        </div>
      )}

      {!selectedCategory && !categoriesLoading && (
        <div className="text-center py-12 text-gray-500">
          Select a category to view the leaderboard
        </div>
      )}
    </div>
  )
}

function StatsTab({ runs, categories, selectedCategory }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Estatísticas</h2>
        {selectedCategory && (
          <span className="text-sm px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
            {selectedCategory.title}
          </span>
        )}
      </div>
      {!selectedCategory ? (
        <div className="text-center py-12 text-gray-500">
          Selecione uma categoria no Leaderboard para ver estatísticas
        </div>
      ) : (
        <StatsCharts runs={runs} categories={categories} categoryName={selectedCategory.title} />
      )}
    </div>
  )
}

function ProfileTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Meu Perfil</h2>
      <UserProfile />
    </div>
  )
}

export default App
