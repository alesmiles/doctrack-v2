import { useEffect, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, PlusCircle, FileText, Users, Handshake, RussianRuble, MailCheck, Building, HardHat, UserCog, Archive, Settings, ShieldCheck, Calculator, Check } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { CurrentUser } from "@/types";
import { ROLES, ROLE_LABELS, ROLE_FOOTER_DEMO, type RoleId } from "@/config/roles";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  activePage: string;
  onNavigate: (page: string) => void;
  onCreateProject: () => void;
  onCreateClientDoc: () => void;
  onCreateVendorDoc: () => void;
  onCreateEstimate: () => void;
  currentUser: CurrentUser;
  currentRole: RoleId;
  onRoleChange: (role: RoleId) => void;
}

// R3: порядок пунктов переключателя роли в футере сайдбара
const ROLE_MENU_ORDER: RoleId[] = ["director", "lawyer", "kam", "producer", "do_specialist"];

function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function Sidebar({ collapsed, onToggle, activePage, onNavigate, onCreateProject, onCreateClientDoc, onCreateVendorDoc, onCreateEstimate, currentUser, currentRole, onRoleChange }: SidebarProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<"contractors" | "estimates" | null>(null);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  const showClients = currentUser.role !== "producer";
  const showContractors = ROLES[currentRole].sidebarItems.includes("contractors-client") || ROLES[currentRole].sidebarItems.includes("contractors-internal");
  const showEstimates = ROLES[currentRole].sidebarItems.includes("estimates");

  // R1: единая переменная — раскрыта не более чем одна из групп «Подрядчики»/«Сметы»
  useEffect(() => {
    if (activePage === "contractors-client" || activePage === "contractors-internal") {
      setOpenAccordion("contractors");
    } else if (activePage === "estimates-client" || activePage === "estimates-project" || activePage === "estimates-internal") {
      setOpenAccordion("estimates");
    } else {
      setOpenAccordion(null);
    }
  }, [activePage]);

  const sections: Array<{ title: string; items: Array<{ id: string; icon: any; label: string; badge?: number }> }> = [
    {
      title: "ДОКУМЕНТООБОРОТ",
      items: [
        { id: "do-inwork", icon: FileText, label: "В работе", badge: 12 },
        { id: "clients", icon: Users, label: "Клиенты" },
      ],
    },
    {
      title: "ПЛАТЕЖИ",
      items: [
        { id: "receivables", icon: RussianRuble, label: "Дебиторка" },
        { id: "topay", icon: MailCheck, label: "К оплате" },
      ],
    },
    {
      title: "БАЗА",
      items: [
        { id: "base-clients", icon: Building, label: "Клиенты" },
        { id: "base-contractors", icon: HardHat, label: "Подрядчики" },
        { id: "employees", icon: UserCog, label: "Сотрудники" },
      ],
    },
    {
      title: "СИСТЕМА",
      items: [
        { id: "archive", icon: Archive, label: "Архив" },
        { id: "settings-nav", icon: Settings, label: "Настройки" },
        { id: "admin", icon: ShieldCheck, label: "Доступ" },
      ],
    },
  ];

  return (
    <aside className={cn("h-full flex flex-col border-r border-gray-200 bg-white transition-all duration-200 flex-shrink-0", collapsed ? "w-14" : "w-56")}>
      <div className="flex items-center h-14 border-b border-gray-100 px-4 justify-between">
        <div className={cn("flex items-center", collapsed ? "justify-center w-full" : "gap-3")}>
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">D</div>
          {!collapsed && <span className="font-semibold text-gray-900 text-sm">DocTrack</span>}
        </div>
        <button
          onClick={onToggle}
          className="rounded-lg w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
          title={collapsed ? "Развернуть боковую панель" : "Свернуть боковую панель"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 min-h-0 overflow-y-auto py-3 px-2">
        <div className="mb-4">
          {!collapsed && (
            <div className="px-2 mb-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">ДОКУМЕНТООБОРОТ</div>
          )}

          <button
            className={cn(
              "w-full flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors mb-0.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              collapsed && "justify-center px-0 w-auto"
            )}
            onClick={() => setIsCreateOpen((o) => !o)}
            title={collapsed ? "Создать" : undefined}
          >
            <PlusCircle className="w-4 h-4 flex-shrink-0" />
            {!collapsed && (
              <>
                <span className="truncate">Создать</span>
                <ChevronDown className={cn("w-3.5 h-3.5 ml-auto opacity-40 transition-transform", isCreateOpen && "rotate-180")} />
              </>
            )}
          </button>

          {!collapsed && isCreateOpen && (
            <div className="ml-[26px] pl-3 border-l-[1.5px] border-gray-200">
              <button
                className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors mb-0.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                onClick={onCreateProject}
              >
                <span className="truncate">Проект</span>
              </button>
              <button
                className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors mb-0.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                onClick={onCreateClientDoc}
              >
                <span className="truncate">Документ клиента</span>
              </button>
              <button
                className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors mb-0.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                onClick={onCreateVendorDoc}
              >
                <span className="truncate">Документ подрядчика</span>
              </button>
              <button
                className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors mb-0.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                onClick={onCreateEstimate}
              >
                <span className="truncate">Смета</span>
              </button>
            </div>
          )}

          {showClients && ROLES[currentRole].sidebarItems.includes("clients") && (
            <button
              className={cn(
                "w-full flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors mb-0.5",
                activePage === "clients" ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                collapsed && "justify-center px-0"
              )}
              onClick={() => onNavigate("clients")}
              title={collapsed ? "Клиенты" : undefined}
            >
              <Users className={cn("w-4 h-4 flex-shrink-0", activePage === "clients" && "text-blue-600")} />
              {!collapsed && <span className="truncate">Клиенты</span>}
            </button>
          )}

          {showContractors && (
            <>
              <button
                className={cn(
                  "w-full flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors mb-0.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  collapsed && "justify-center px-0 w-auto"
                )}
                onClick={() => setOpenAccordion((prev) => (prev === "contractors" ? null : "contractors"))}
                title={collapsed ? "Подрядчики" : undefined}
              >
                <Handshake className="w-4 h-4 flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="truncate">Подрядчики</span>
                    <ChevronDown className={cn("w-3.5 h-3.5 ml-auto opacity-40 transition-transform", openAccordion === "contractors" && "rotate-180")} />
                  </>
                )}
              </button>

              {!collapsed && openAccordion === "contractors" && (
                <div className="ml-[26px] pl-3 border-l-[1.5px] border-gray-200">
                  {ROLES[currentRole].sidebarItems.includes("contractors-client") && (
                    <button
                      className={cn(
                        "w-full flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors mb-0.5",
                        activePage === "contractors-client" ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                      onClick={() => onNavigate("contractors-client")}
                    >
                      <span className="truncate">Клиентские</span>
                    </button>
                  )}
                  {ROLES[currentRole].sidebarItems.includes("contractors-internal") && (
                    <button
                      className={cn(
                        "w-full flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors mb-0.5",
                        activePage === "contractors-internal" ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                      onClick={() => onNavigate("contractors-internal")}
                    >
                      <span className="truncate">Внутренние</span>
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {showEstimates && (
            <>
              <button
                className={cn(
                  "w-full flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors mb-0.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  collapsed && "justify-center px-0 w-auto"
                )}
                onClick={() => setOpenAccordion((prev) => (prev === "estimates" ? null : "estimates"))}
                title={collapsed ? "Сметы" : undefined}
              >
                <Calculator className="w-4 h-4 flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="truncate">Сметы</span>
                    <ChevronDown className={cn("w-3.5 h-3.5 ml-auto opacity-40 transition-transform", openAccordion === "estimates" && "rotate-180")} />
                  </>
                )}
              </button>

              {!collapsed && openAccordion === "estimates" && (
                <div className="ml-[26px] pl-3 border-l-[1.5px] border-gray-200">
                  <button
                    className={cn(
                      "w-full flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors mb-0.5",
                      activePage === "estimates-client" ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                    onClick={() => onNavigate("estimates-client")}
                  >
                    <span className="truncate">Клиентские</span>
                  </button>
                  <button
                    className={cn(
                      "w-full flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors mb-0.5",
                      activePage === "estimates-project" ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                    onClick={() => onNavigate("estimates-project")}
                  >
                    <span className="truncate">Проектные</span>
                  </button>
                  <button
                    className={cn(
                      "w-full flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors mb-0.5",
                      activePage === "estimates-internal" ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                    onClick={() => onNavigate("estimates-internal")}
                  >
                    <span className="truncate">Внутренние</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Rest sections */}
        {sections.slice(1).map((section) => (
          <div key={section.title} className="mb-4">
            {!collapsed && (
              <div className="px-2 mb-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{section.title}</div>
            )}
            {section.items.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  className={cn(
                    "w-full flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors mb-0.5",
                    isActive ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    collapsed && "justify-center px-0"
                  )}
                  title={collapsed ? item.label : undefined}
                  onClick={() => onNavigate(item.id)}
                >
                  <item.icon className={cn("w-4 h-4 flex-shrink-0", isActive && "text-blue-600")} />
                  {!collapsed && (
                    <>
                      <span className="truncate">{item.label}</span>
                      {item.badge != null && (
                        <span className="ml-auto text-[10px] bg-gray-100 text-gray-600 rounded-full px-1.5 py-0.5 font-medium">{item.badge}</span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <DropdownMenu open={isRoleMenuOpen} onOpenChange={setIsRoleMenuOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "border-t border-gray-100 p-3 flex items-center gap-3 flex-shrink-0 w-full text-left hover:bg-gray-50 transition-colors",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? "Сменить роль" : undefined}
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
              {getInitials(ROLE_FOOTER_DEMO[currentRole].name)}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{ROLE_FOOTER_DEMO[currentRole].name}</div>
                <div className="text-xs text-gray-400 truncate">{ROLE_FOOTER_DEMO[currentRole].title}</div>
              </div>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className="w-48">
          {ROLE_MENU_ORDER.map((role) => (
            <DropdownMenuItem key={role} onClick={() => onRoleChange(role)}>
              <span className="flex-1 truncate">{ROLE_LABELS[role]}</span>
              {role === currentRole && <Check className="w-3.5 h-3.5 ml-2 text-blue-600 flex-shrink-0" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </aside>
  );
}

export default Sidebar;
