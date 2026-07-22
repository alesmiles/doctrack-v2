import { useMemo, useState } from "react";
import { ChevronDown, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { SidePanel } from "@/components/base/SidePanel";
import { SoglasovanieKanbanBoard } from "@/components/SoglasovanieKanbanBoard";
import { cn } from "@/lib/utils";
import { CurrentUser } from "@/types";
import { RAW_PROJECTS } from "@/mocks/projects";
import {
  DOCUMENTS,
  DOC_DIRECTION_LABELS,
  DocDirection,
  DocType,
  SoglasovanieDocument,
  SoglasovanieGroupBy,
  getContragentName,
  getProjectTitle,
  getResponsibleName,
} from "@/data/soglasovanie-seed";

interface SoglasovanieDocumentsPageProps {
  currentUser: CurrentUser;
}

const DIRECTIONS: DocDirection[] = ["clients", "contractors_client", "contractors_internal"];

function getKamName(projectId: number | undefined): string {
  return RAW_PROJECTS.find((p) => p.id === projectId)?.kam.name ?? "";
}

export function SoglasovanieDocumentsPage({ currentUser }: SoglasovanieDocumentsPageProps) {
  const [direction, setDirection] = useState<DocDirection>("clients");
  const [search, setSearch] = useState("");
  const [contragentFilter, setContragentFilter] = useState("");
  const [secondaryFilter, setSecondaryFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<DocType | "">("");
  const [myApprovalsOnly, setMyApprovalsOnly] = useState(false);
  const [groupBy, setGroupBy] = useState<SoglasovanieGroupBy>("project");
  const [selectedDocument, setSelectedDocument] = useState<SoglasovanieDocument | null>(null);

  const handleDirectionChange = (next: DocDirection) => {
    setDirection(next);
    setContragentFilter("");
    setSecondaryFilter("");
  };

  const documentsInDirection = useMemo(() => DOCUMENTS.filter((d) => d.direction === direction), [direction]);

  const contragentOptions = useMemo(
    () => Array.from(new Set(documentsInDirection.map((d) => getContragentName(d)))),
    [documentsInDirection]
  );
  const secondaryOptions = useMemo(() => {
    if (direction === "clients") return Array.from(new Set(documentsInDirection.map((d) => getKamName(d.projectId)).filter(Boolean)));
    if (direction === "contractors_client") return Array.from(new Set(documentsInDirection.map((d) => getProjectTitle(d.projectId))));
    return Array.from(new Set(documentsInDirection.map((d) => getResponsibleName(d.responsibleId))));
  }, [direction, documentsInDirection]);
  const typeOptions = useMemo(() => Array.from(new Set(documentsInDirection.map((d) => d.type))), [documentsInDirection]);

  const filteredDocuments = useMemo(() => {
    const q = search.trim().toLowerCase();
    return documentsInDirection.filter((doc) => {
      if (myApprovalsOnly && doc.assignedTo !== currentUser.id) return false;
      if (typeFilter && doc.type !== typeFilter) return false;
      if (contragentFilter && getContragentName(doc) !== contragentFilter) return false;

      if (secondaryFilter) {
        if (direction === "clients" && getKamName(doc.projectId) !== secondaryFilter) return false;
        if (direction === "contractors_client" && getProjectTitle(doc.projectId) !== secondaryFilter) return false;
        if (direction === "contractors_internal" && getResponsibleName(doc.responsibleId) !== secondaryFilter) return false;
      }

      if (q) {
        const haystack = [doc.name, getContragentName(doc), doc.type].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [documentsInDirection, search, contragentFilter, secondaryFilter, typeFilter, myApprovalsOnly, currentUser.id, direction]);

  const myApprovalsCount = filteredDocuments.length;

  const contragentLabel = direction === "clients" ? "Клиент" : "Подрядчик";
  const secondaryLabel = direction === "clients" ? "КАМ" : direction === "contractors_client" ? "Проект клиента" : "Ответственный";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 px-8 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Согласование · Документы</h1>
      </div>

      <div className="px-8 pb-3">
        <div className="inline-flex items-center gap-1 rounded-lg bg-gray-50 p-1">
          {DIRECTIONS.map((d) => (
            <button
              key={d}
              type="button"
              data-direction={d}
              aria-pressed={direction === d}
              onClick={() => handleDirectionChange(d)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                direction === d ? "border border-blue-300 bg-blue-50 text-blue-700" : "border border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              {DOC_DIRECTION_LABELS[d]}
            </button>
          ))}
        </div>
      </div>

      <div className="px-8 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-shrink-0">
            <Search className="absolute left-2.5 top-1/2 w-4 h-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Поиск…"
              className="h-9 w-52 border-gray-200 bg-gray-50 pl-9 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 border-gray-200 bg-gray-50 text-sm">
                {contragentFilter || contragentLabel}
                <ChevronDown className="ml-1 w-3.5 h-3.5 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setContragentFilter("")}>Все</DropdownMenuItem>
              {contragentOptions.map((o) => (
                <DropdownMenuItem key={o} onClick={() => setContragentFilter(o)}>{o}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 border-gray-200 bg-gray-50 text-sm">
                {secondaryFilter || secondaryLabel}
                <ChevronDown className="ml-1 w-3.5 h-3.5 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSecondaryFilter("")}>Все</DropdownMenuItem>
              {secondaryOptions.map((o) => (
                <DropdownMenuItem key={o} onClick={() => setSecondaryFilter(o)}>{o}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 border-gray-200 bg-gray-50 text-sm">
                {typeFilter || "Тип"}
                <ChevronDown className="ml-1 w-3.5 h-3.5 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setTypeFilter("")}>Все типы</DropdownMenuItem>
              {typeOptions.map((t) => (
                <DropdownMenuItem key={t} onClick={() => setTypeFilter(t)}>{t}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="mx-1 h-6 w-px flex-shrink-0 bg-gray-200" />

          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "h-9 border-gray-200 bg-gray-50 text-sm",
              myApprovalsOnly && "border-blue-300 bg-blue-50 text-blue-700"
            )}
            onClick={() => setMyApprovalsOnly((v) => !v)}
          >
            Мои согласования{myApprovalsOnly ? ` · ${myApprovalsCount}` : ""}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 border-gray-200 bg-gray-50 text-sm"
            onClick={() => setGroupBy((v) => (v === "project" ? "contragent" : "project"))}
          >
            Группировка
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 flex-shrink-0 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=open]:bg-gray-100 data-[state=open]:text-gray-600"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="text-xs text-gray-400">Настройки фильтров</DropdownMenuLabel>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <SoglasovanieKanbanBoard
        direction={direction}
        documents={filteredDocuments}
        groupBy={groupBy}
        onCardClick={setSelectedDocument}
      />

      <SidePanel title={selectedDocument?.name ?? ""} open={selectedDocument != null} onClose={() => setSelectedDocument(null)}>
        {selectedDocument && <p className="text-sm text-gray-500">{selectedDocument.name}</p>}
      </SidePanel>
    </div>
  );
}

export default SoglasovanieDocumentsPage;
