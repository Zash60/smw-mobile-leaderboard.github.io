import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { formatTime, parseTimeToMilliseconds } from '../utils/timeParser'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export function StatsCharts({ runs, categories }) {
  // Gráfico de evolução de tempos
  const timeEvolutionData = useMemo(() => {
    if (!runs.length) return []
    return runs
      .slice()
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((run, index) => ({
        date: new Date(run.date).toLocaleDateString('pt-BR'),
        time: parseTimeToMilliseconds(run.time) / 1000, // em segundos
        position: index + 1,
        player: run.player
      }))
  }, [runs])

  // Gráfico de jogadores
  const playerStats = useMemo(() => {
    const stats = {}
    runs.forEach(run => {
      if (!stats[run.player]) {
        stats[run.player] = { name: run.player, runs: 0, bestTime: Infinity }
      }
      stats[run.player].runs++
      const timeMs = parseTimeToMilliseconds(run.time)
      if (timeMs < stats[run.player].bestTime) {
        stats[run.player].bestTime = timeMs
      }
    })
    return Object.values(stats)
      .sort((a, b) => a.bestTime - b.bestTime)
      .slice(0, 10)
      .map(p => ({
        ...p,
        bestTimeSeconds: p.bestTime / 1000
      }))
  }, [runs])

  // Gráfico de distribuição de tempos
  const timeDistribution = useMemo(() => {
    if (!runs.length) return []
    const times = runs.map(r => parseTimeToMilliseconds(r.time) / 1000)
    const min = Math.min(...times)
    const max = Math.max(...times)
    const range = max - min
    const step = range / 5
    
    const distribution = [
      { name: '< ' + formatTime((min + step) * 1000), value: 0 },
      { name: formatTime(min * 1000) + ' - ' + formatTime((min + step * 2) * 1000), value: 0 },
      { name: formatTime((min + step * 2) * 1000) + ' - ' + formatTime((min + step * 3) * 1000), value: 0 },
      { name: formatTime((min + step * 3) * 1000) + ' - ' + formatTime((min + step * 4) * 1000), value: 0 },
      { name: '> ' + formatTime((min + step * 4) * 1000), value: 0 }
    ]
    
    times.forEach(time => {
      const index = Math.min(Math.floor((time - min) / step), 4)
      distribution[index].value++
    })
    
    return distribution
  }, [runs])

  if (!runs.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        Sem dados suficientes para gerar estatísticas
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Evolução de Tempos */}
      <div className="card p-4">
        <h3 className="text-lg font-semibold mb-4">Evolução de Tempos</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeEvolutionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value) => formatTime(value * 1000)}
                labelFormatter={(label) => `Data: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="time" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Jogadores */}
      <div className="card p-4">
        <h3 className="text-lg font-semibold mb-4">Top 10 Jogadores</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={playerStats} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100} />
              <Tooltip formatter={(value) => formatTime(value * 1000)} />
              <Bar dataKey="bestTimeSeconds" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Distribuição de Tempos */}
      <div className="card p-4">
        <h3 className="text-lg font-semibold mb-4">Distribuição de Tempos</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={timeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {timeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-2 justify-center mt-4">
          {timeDistribution.map((entry, index) => (
            <div key={index} className="flex items-center gap-1 text-xs">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span>{entry.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
