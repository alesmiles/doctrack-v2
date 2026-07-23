import { useState } from "react"
import { Toaster } from "sonner"
import { Sidebar } from "./components/Sidebar"
import { DEMO_USERS } from "./mocks/users"
import { ClientsPage } from "./pages/ClientsPage"
import { SoglasovanieDocumentsPage } from "./pages/SoglasovanieDocumentsPage"
import { SoglasovanieQueuePage } from "./pages/SoglasovanieQueuePage"
import { ContractorsPage } from "./pages/ContractorsPage"
import { InternalContractorsPage } from "./pages/InternalContractorsPage"
import { EstimatesPage } from "./pages/EstimatesPage"
import { ReceivablesPage } from "./pages/ReceivablesPage"
import { DocumentEditorPage } from "./pages/DocumentEditorPage"
import { ClientsDirectoryPage } from "./pages/base/ClientsDirectoryPage"
import { ContractorsDirectoryPage } from "./pages/base/ContractorsDirectoryPage"
import { EmployeesDirectoryPage } from "./pages/base/EmployeesDirectoryPage"
import { SoglasovanieNaPodpisiPage } from "./pages/SoglasovanieNaPodpisiPage"
import { PlaceholderPage } from "./pages/PlaceholderPage"
import { CreateProjectModal } from "./components/CreateProjectModal"
import { CreateClientDocModal, type ClientDocFormData } from "./components/CreateClientDocModal"
import { CreateVendorDocModal } from "./components/CreateVendorDocModal"
import { CreateEstimateModal } from "./components/CreateEstimateModal"
import { ROLES, ROLE_DEMO_USER_ID, type RoleId } from "./config/roles"

// R8: id'ы, реально рендерящиеся в renderPage() — используются как кандидаты
// для редиректа при смене роли
const RENDERABLE_SIDEBAR_ITEMS: string[] = ["clients", "contractors-client", "contractors-internal"]

// R6: определяет, к какому пункту конфига доступов (SidebarItemId) относится
// текущий activePage — нужно для редиректа при смене роли, если новая роль
// не видит текущую страницу (включая "На подписи" и "Сотрудники").
function pageToSidebarItem(page: string): "clients" | "contractors-client" | "contractors-internal" | "employees" | "on-signature" | null {
  if (page === "clients" || page === "contractors-client" || page === "contractors-internal" || page === "employees") return page
  if (page.startsWith("on-signature")) return "on-signature"
  return null
}

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activePage, setActivePage] = useState("clients")
  const [currentRole, setCurrentRole] = useState<RoleId>("director")
  const [previousPage, setPreviousPage] = useState("receivables")
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [showCreateClientDoc, setShowCreateClientDoc] = useState(false)
  const [showCreateVendorDoc, setShowCreateVendorDoc] = useState(false)
  const [showCreateEstimate, setShowCreateEstimate] = useState(false)
  const [createClientDocInitial, setCreateClientDocInitial] = useState<{
    client: string
    project: string
    managerDO: string
  } | null>(null)
  const [cameFromProject, setCameFromProject] = useState(false)
  const [savedClientDocForm, setSavedClientDocForm] = useState<ClientDocFormData | null>(null)
  // R1/R2: currentUser следует за переключателем роли (см. ROLE_DEMO_USER_ID) —
  // без этого счётчик и видимость "На подписи" не совпадали бы с выбранной ролью.
  const currentUser = DEMO_USERS.find((u) => u.id === ROLE_DEMO_USER_ID[currentRole])!

  const handleRoleChange = (role: RoleId) => {
    setCurrentRole(role)
    const item = pageToSidebarItem(activePage)
    if (item && !ROLES[role].sidebarItems.includes(item)) {
      const fallback = ROLES[role].sidebarItems.find((id) => RENDERABLE_SIDEBAR_ITEMS.includes(id))
      if (fallback) setActivePage(fallback)
    }
  }

  // R9: для ролей с табличным типом отображения (сейчас — только Юрист)
  // Клиенты/Подрядчики·Клиенты/Подрядчики·Внутренние показывают заглушку
  // вместо реальной канбан-страницы (реальная таблица — вне рамок задачи).
  const useTablePlaceholder = ROLES[currentRole].boardType.documents === "table"

  const renderPage = () => {
    switch (activePage) {
      case "clients":
        return useTablePlaceholder ? <PlaceholderPage /> : <ClientsPage />
      case "soglasovanie-documents":
        return <SoglasovanieDocumentsPage currentUser={currentUser} />
      case "soglasovanie":
        return <SoglasovanieQueuePage />
      case "contractors-client":
        return useTablePlaceholder ? <PlaceholderPage /> : <ContractorsPage onNavigate={setActivePage} />
      case "contractors-internal":
        return useTablePlaceholder ? <PlaceholderPage /> : <InternalContractorsPage />
      case "on-signature":
        return <SoglasovanieNaPodpisiPage currentUser={currentUser} />
      case "estimates-client":
        return <EstimatesPage type="client" />
      case "estimates-project":
        return <EstimatesPage type="contractor-project" />
      case "estimates-internal":
        return <EstimatesPage type="contractor" />
      case "receivables":
        return <ReceivablesPage />
      case "base-clients":
        return <ClientsDirectoryPage />
      case "base-contractors":
        return <ContractorsDirectoryPage />
      case "employees":
        return <EmployeesDirectoryPage />
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
            <p className="text-gray-400 text-sm">Section in development</p>
          </div>
        )
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      <div className="flex flex-1 overflow-hidden">
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
          onCreateEstimate={() => setShowCreateEstimate(true)}
          currentUser={currentUser}
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
        />
        <main className="flex-1 overflow-y-auto min-w-0">
          {renderPage()}
        </main>
      </div>

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

      <CreateEstimateModal
        open={showCreateEstimate}
        onClose={() => setShowCreateEstimate(false)}
      />

      <Toaster richColors position="bottom-right" />
    </div>
  )
}
