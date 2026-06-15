import { useState } from "react"
import { Sidebar } from "./components/Sidebar"
import { ClientsPage } from "./pages/ClientsPage"
import { ContractorsPage } from "./pages/ContractorsPage"
import { ReceivablesPage } from "./pages/ReceivablesPage"

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activePage, setActivePage] = useState("clients")

  const renderPage = () => {
    switch (activePage) {
      case "clients":
        return <ClientsPage />
      case "contractors-client":
        return <ContractorsPage subPage="client" onNavigate={setActivePage} />
      case "contractors-internal":
        return <ContractorsPage subPage="internal" onNavigate={setActivePage} />
      case "receivables":
        return <ReceivablesPage />
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-sm">Раздел в разработке</p>
          </div>
        )
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
        activePage={activePage}
        onNavigate={setActivePage}
      />
      <main className="flex-1 overflow-y-auto min-w-0">
        {renderPage()}
      </main>
    </div>
  )
}
