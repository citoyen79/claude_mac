import { useApp } from '../store/AppContext'

export function Header() {
  const { state, dispatch } = useApp()

  return (
    <header
      className="h-12 flex items-center justify-between px-4 shrink-0 shadow-md"
      style={{ backgroundColor: '#026AA7' }}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">T</span>
          </div>
          <h1 className="text-white font-bold text-lg tracking-wide">
            TaskBoard
          </h1>
        </div>
      </div>

      <nav className="flex items-center gap-1">
        <button
          onClick={() => dispatch({ type: 'SET_VIEW', payload: 'board' })}
          className={`px-3 py-1.5 rounded text-sm font-medium text-white transition-colors ${
            state.view === 'board'
              ? 'bg-white/25'
              : 'hover:bg-white/15'
          }`}
        >
          보드
        </button>
        <button
          onClick={() => dispatch({ type: 'SET_VIEW', payload: 'settings' })}
          className={`px-3 py-1.5 rounded text-sm font-medium text-white transition-colors ${
            state.view === 'settings'
              ? 'bg-white/25'
              : 'hover:bg-white/15'
          }`}
        >
          설정
        </button>
      </nav>
    </header>
  )
}
