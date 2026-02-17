import { ThemeToggle } from './ThemeToggle'

export function Header() {
  return (
    <header className="py-6 px-4 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            SMW Speedrun Mobile
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Super Mario World Speedrun Leaderboards
          </p>
        </div>
        <ThemeToggle />
      </div>
    </header>
  )
}
