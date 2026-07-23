import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types";
import { ROLE_LABELS } from "@/constants";
import { DEMO_USERS } from "@/mocks/users";

interface AppHeaderProps {
  role: UserRole;
  onChangeRole: (role: UserRole) => void;
}

export function AppHeader({ role, onChangeRole }: AppHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="h-12 flex items-center justify-end px-4 border-b border-gray-100 bg-white flex-shrink-0">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <span className="text-gray-400">Роль:</span>
            <span className="font-medium">{ROLE_LABELS[role]}</span>
            <ChevronDown className={cn("w-3.5 h-3.5 opacity-40 transition-transform", open && "rotate-180")} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {DEMO_USERS.map((user) => (
            <DropdownMenuItem key={user.role} onClick={() => onChangeRole(user.role)}>
              {ROLE_LABELS[user.role]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

export default AppHeader;
