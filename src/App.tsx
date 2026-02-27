import { AppProvider, useApp } from './store/AppContext'
import { Header } from './components/Header'
import { Board } from './components/Board'
import { Settings } from './components/Settings'

function AppContent() {
  const { state } = useApp()

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      {state.view === 'board' ? <Board /> : <Settings />}
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
