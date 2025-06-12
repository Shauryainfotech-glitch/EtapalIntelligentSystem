import { Badge } from "@/components/ui/badge";
import { DOCUMENT_STATUSES } from "@/lib/constants";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = DOCUMENT_STATUSES[status as keyof typeof DOCUMENT_STATUSES] || {
    label: status,
    color: 'gray'
  };

  const colorClasses = {
    gray: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    yellow: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    green: 'bg-green-100 text-green-800 hover:bg-green-200',
    red: 'bg-red-100 text-red-800 hover:bg-red-200',
  };

  return (
    <Badge 
      variant="secondary" 
      className={`${colorClasses[statusConfig.color as keyof typeof colorClasses]} transition-colors`}
    >
      {statusConfig.label}
    </Badge>
  );
}
