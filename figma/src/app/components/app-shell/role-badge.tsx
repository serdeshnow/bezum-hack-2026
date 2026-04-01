import { Badge } from "../ui/badge";
import { User, Code, Users } from "lucide-react";

type Role = "Customer" | "Developer" | "Manager";

interface RoleBadgeProps {
  role: Role;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const roleConfig = {
    Customer: {
      icon: User,
      variant: "secondary" as const,
    },
    Developer: {
      icon: Code,
      variant: "default" as const,
    },
    Manager: {
      icon: Users,
      variant: "outline" as const,
    },
  };

  const config = roleConfig[role];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1.5">
      <Icon className="size-3" />
      {role}
    </Badge>
  );
}
