import { Star, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Person } from "./types";

interface ResponsiblePersonsListProps {
  people: Person[];
  onChange: (people: Person[]) => void;
}

function makeEmptyPerson(): Person {
  return {
    id: `person-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    fullName: "",
    role: "",
    phone: "",
    telegram: "",
    email: "",
    isPrimary: false,
  };
}

export function ResponsiblePersonsList({ people, onChange }: ResponsiblePersonsListProps) {
  const updatePerson = (id: string, patch: Partial<Person>) => {
    onChange(people.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const setPrimary = (id: string) => {
    onChange(people.map((p) => ({ ...p, isPrimary: p.id === id })));
  };

  const removePerson = (id: string) => {
    onChange(people.filter((p) => p.id !== id));
  };

  const addPerson = () => {
    onChange([...people, makeEmptyPerson()]);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Ответственные лица</div>
      {people.map((person) => (
        <div key={person.id} className="rounded-lg border border-gray-200 p-3 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPrimary(person.id)}
              title={person.isPrimary ? "Основной контакт" : "Сделать основным"}
              className="flex-shrink-0"
            >
              <Star className={cn("w-4 h-4", person.isPrimary ? "fill-amber-400 text-amber-400" : "text-gray-300 hover:text-gray-400")} />
            </button>
            <input
              className="flex-1 text-sm font-medium text-gray-900 outline-none border-b border-transparent focus:border-blue-300 bg-transparent min-w-0"
              placeholder="ФИО"
              value={person.fullName}
              onChange={(e) => updatePerson(person.id, { fullName: e.target.value })}
            />
            <button
              type="button"
              onClick={() => removePerson(person.id)}
              className="flex-shrink-0 text-gray-300 hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 pl-6">
            <input
              className="text-sm text-gray-600 outline-none border-b border-transparent focus:border-blue-300 bg-transparent min-w-0"
              placeholder="Роль"
              value={person.role}
              onChange={(e) => updatePerson(person.id, { role: e.target.value })}
            />
            <input
              className="text-sm text-gray-600 outline-none border-b border-transparent focus:border-blue-300 bg-transparent min-w-0"
              placeholder="Телефон"
              value={person.phone}
              onChange={(e) => updatePerson(person.id, { phone: e.target.value })}
            />
            <input
              className="text-sm text-gray-600 outline-none border-b border-transparent focus:border-blue-300 bg-transparent min-w-0"
              placeholder="Telegram"
              value={person.telegram}
              onChange={(e) => updatePerson(person.id, { telegram: e.target.value })}
            />
            <input
              className="text-sm text-gray-600 outline-none border-b border-transparent focus:border-blue-300 bg-transparent min-w-0"
              placeholder="Email"
              value={person.email}
              onChange={(e) => updatePerson(person.id, { email: e.target.value })}
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addPerson}
        className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 transition-colors mt-1 self-start"
      >
        <Plus className="w-3.5 h-3.5" /> добавить ещё одного
      </button>
    </div>
  );
}
