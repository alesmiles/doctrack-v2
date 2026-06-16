import { useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, PlusCircle, FileText, Users, Handshake, RussianRuble, MailCheck, Building, HardHat, UserCog, Archive, Settings, ShieldCheck } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  activePage: string;
  onNavigate: (page: string) => void;
  onCreateProject: () => void;
  onCreateClientDoc: () => void;
  onCreateVendorDoc: () => void;
}

export function Sidebar({ collapsed, onToggle, activePage, onNavigate, onCreateProject, onCreateClientDoc, onCreateVendorDoc }: SidebarProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isContractorsOpen, setIsContractorsOpen] = useState(false);
  const sections: Array<{ title: string; items: Array<{ id: string; icon: any; label: string; badge?: number }> }> = [
    {
      title: "ДОКУМЕНТООБОРОТ",
      items: [
        { id: "do-inwork", icon: FileText, label: "ДО в работе", badge: 12 },
        { id: "clients", icon: Users, label: "Клиенты" },
      ],
    },
    {
      title: "ПЛАТЕЖИ",
      items: [
        { id: "receivables", icon: RussianRuble, label: "Дебиторка" },
        { id: "topay", icon: MailCheck, label: "На оплату" },
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
        { id: "admin", icon: ShieldCheck, label: "Доступы" },
      ],
    },
  ];

  return (
    <aside className={cn("h-screen flex flex-col border-r border-gray-200 bg-white transition-all duration-200 flex-shrink-0", collapsed ? "w-14" : "w-56")}>
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

      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <div className="mb-4">
          {!collapsed && (
            <div className="px-2 mb-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">ДОКУМЕНТООБОРОТ</div>
          )}

          <DropdownMenu open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "w-full flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors mb-0.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  collapsed && "justify-center px-0 w-auto"
                )}
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
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="w-48">
              <DropdownMenuItem onClick={onCreateProject}>Проект</DropdownMenuItem>
              <DropdownMenuItem onClick={onCreateClientDoc}>Документ клиента</DropdownMenuItem>
              <DropdownMenuItem onClick={onCreateVendorDoc}>Документ подрядчика</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            className={cn(
              "w-full flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors mb-0.5",
              activePage === "clients" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              collapsed && "justify-center px-0"
            )}
            onClick={() => onNavigate("clients")}
            title={collapsed ? "Клиенты" : undefined}
          >
            <Users className={cn("w-4 h-4 flex-shrink-0", activePage === "clients" && "text-blue-600")} />
            {!collapsed && <span className="truncate">Клиенты</span>}
          </button>

          {/* Contractors flyout */}
          <DropdownMenu open={isContractorsOpen} onOpenChange={setIsContractorsOpen}>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "w-full flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors mb-0.5",
                  (activePage === "contractors-client" || activePage === "contractors-internal")
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  collapsed && "justify-center px-0"
                )}
                title={collapsed ? "Подрядчики" : undefined}
              >
                <Handshake className={cn("w-4 h-4 flex-shrink-0", (activePage === "contractors-client" || activePage === "contractors-internal") && "text-blue-600")} />
                {!collapsed && (
                  <>
                    <span className="truncate">Подрядчики</span>
                    <ChevronDown className={cn("w-3.5 h-3.5 ml-auto opacity-40 transition-transform", isContractorsOpen && "rotate-180")} />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="w-48">
              <DropdownMenuItem
                onClick={() => onNavigate("contractors-client")}
                className={cn(activePage === "contractors-client" && "bg-blue-50 text-blue-700 font-medium")}
              >
                Клиентские
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onNavigate("contractors-internal")}
                className={cn(activePage === "contractors-internal" && "bg-blue-50 text-blue-700 font-medium")}
              >
                Внутренние
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
                    isActive ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
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

      <div className={cn("border-t border-gray-100 p-3 flex items-center gap-3", collapsed && "justify-center px-2")}>
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">ИМ</div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">Инна Михрабова</div>
            <div className="text-xs text-gray-400 truncate">Менеджер ДО</div>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
