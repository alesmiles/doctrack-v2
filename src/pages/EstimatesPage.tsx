import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { EstimatesKanbanBoard } from "@/components/EstimatesKanbanBoard";
import { estimates as ESTIMATES } from "@/mocks/estimatesMockData";
import { Estimate } from "@/types";

interface EstimatesPageProps {
  type: Estimate["type"];
}

const PAGE_TITLE: Record<Estimate["type"], string> = {
  client: "Сметы · Клиенты",
  contractor: "Сметы · Внутренние",
  "contractor-project": "Сметы · Проектные",
};

export function EstimatesPage({ type }: EstimatesPageProps) {
  const [search, setSearch] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [kamFilter, setKamFilter] = useState("");
  const [responsibleFilter, setResponsibleFilter] = useState("");
  const [groupByClient, setGroupByClient] = useState(false);

  const typedEstimates = useMemo(() => ESTIMATES.filter((e) => e.type === type), [type]);

  const clientOptions = useMemo(() => Array.from(new Set(typedEstimates.map((e) => e.client))), [typedEstimates]);
  const kamOptions = useMemo(() => Array.from(new Set(typedEstimates.map((e) => e.kam.name))), [typedEstimates]);
  const responsibleOptions = useMemo(() => Array.from(new Set(typedEstimates.map((e) => e.responsible.name))), [typedEstimates]);

  const filteredEstimates = useMemo(() => {
    return typedEstimates.filter((e) => {
      if (clientFilter && e.client !== clientFilter) return false;
      if (kamFilter && e.kam.name !== kamFilter) return false;
      if (responsibleFilter && e.responsible.name !== responsibleFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!e.project.toLowerCase().includes(q) && !e.client.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [typedEstimates, search, clientFilter, kamFilter, responsibleFilter]);

  const hasAnyFilter = !!(search || clientFilter || kamFilter || responsibleFilter || groupByClient);
  const resetFilters = () => {
    setSearch("");
    setClientFilter("");
    setKamFilter("");
    setResponsibleFilter("");
    setGroupByClient(false);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 px-8 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">{PAGE_TITLE[type]}</h1>
      </div>

      <div className="px-8 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Поиск…"
              className="pl-9 h-9 text-sm bg-gray-50 border-gray-200 w-52"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {type === "client" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 text-sm bg-gray-50 border-gray-200">
                  {clientFilter || "Клиент"} <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setClientFilter("")}>Все клиенты</DropdownMenuItem>
                {clientOptions.map((c) => (
                  <DropdownMenuItem key={c} onClick={() => setClientFilter(c)}>{c}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 text-sm bg-gray-50 border-gray-200">
                {kamFilter || "КАМ"} <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setKamFilter("")}>Все КАМы</DropdownMenuItem>
              {kamOptions.map((k) => (
                <DropdownMenuItem key={k} onClick={() => setKamFilter(k)}>{k}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 text-sm bg-gray-50 border-gray-200">
                {responsibleFilter || "Ответственный"} <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setResponsibleFilter("")}>Все ответственные</DropdownMenuItem>
              {responsibleOptions.map((r) => (
                <DropdownMenuItem key={r} onClick={() => setResponsibleFilter(r)}>{r}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 text-sm bg-gray-50 border-gray-200"
            onClick={() => setGroupByClient((v) => !v)}
          >
            Группировка
          </Button>

          {hasAnyFilter && (
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 hover:bg-gray-100" onClick={resetFilters}>
              <span className="mr-1">×</span> Сбросить
            </Button>
          )}
        </div>
      </div>

      <EstimatesKanbanBoard estimates={filteredEstimates} groupByClient={groupByClient} />
    </div>
  );
}

export default EstimatesPage;
