import { useState } from "react"
import { Toaster } from "sonner"
import { Sidebar } from "./components/Sidebar"
import { ClientsPage } from "./pages/ClientsPage"
import { ContractorsPage } from "./pages/ContractorsPage"
import { ReceivablesPage } from "./pages/ReceivablesPage"
import { DocumentEditorPage } from "./pages/DocumentEditorPage"
import { CreateProjectModal } from "./components/CreateProjectModal"
import { CreateClientDocModal, type ClientDocFormData } from "./components/CreateClientDocModal"
import { CreateVendorDocModal } from "./components/CreateVendorDocModal"

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activePage, setActivePage] = useState("clients")
  const [previousPage, setPreviousPage] = useState("receivables")
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [showCreateClientDoc, setShowCreateClientDoc] = useState(false)
  const [showCreateVendorDoc, setShowCreateVendorDoc] = useState(false)
  const [createClientDocInitial, setCreateClientDocInitial] = useState<{
    client: string
    project: string
    managerDO: string
  } | null>(null)
  const [cameFromProject, setCameFromProject] = useState(false)
  const [savedClientDocForm, setSavedClientDocForm] = useState<ClientDocFormData | null>(null)

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
      case "document-editor":
        return (
          <DocumentEditorPage
            onBack={() => {
              setActivePage(previousPage)
              setShowCreateClientDoc(true)
            }}
          />
        )
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
        onToggle={() => setSidebarCollapsed((c) => !c)}
        activePage={activePage}
        onNavigate={setActivePage}
        onCreateProject={() => setShowCreateProject(true)}
        onCreateClientDoc={() => {
          setCameFromProject(false)
          setShowCreateClientDoc(true)
        }}
        onCreateVendorDoc={() => setShowCreateVendorDoc(true)}
      />
      <main className="flex-1 overflow-y-auto min-w-0">
        {renderPage()}
      </main>

      <CreateProjectModal
        open={showCreateProject}
        onClose={() => setShowCreateProject(false)}
        onOpenCreateDoc={(client, project, managerDO) => {
          setShowCreateProject(false)
          setCreateClientDocInitial({ client, project, managerDO })
          setCameFromProject(true)
          setShowCreateClientDoc(true)
        }}
      />

      <CreateClientDocModal
        open={showCreateClientDoc}
        onClose={() => {
          setShowCreateClientDoc(false)
          setCreateClientDocInitial(null)
          setSavedClientDocForm(null)
        }}
        onBack={cameFromProject ? () => {
          setShowCreateClientDoc(false)
          setShowCreateProject(true)
        } : undefined}
        onNavigate={(page) => {
          setPreviousPage(activePage)
          setShowCreateClientDoc(false)
          setActivePage(page)
        }}
        onSaveForm={setSavedClientDocForm}
        initialValues={savedClientDocForm ?? undefined}
        initialClient={createClientDocInitial?.client}
        initialProject={createClientDocInitial?.project}
        initialManagerDO={createClientDocInitial?.managerDO}
      />

      <CreateVendorDocModal
        open={showCreateVendorDoc}
        onClose={() => setShowCreateVendorDoc(false)}
      />

      <Toaster richColors position="bottom-right" />
    </div>
  )
}
