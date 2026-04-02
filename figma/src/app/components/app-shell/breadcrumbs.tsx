import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { Skeleton } from "../ui/skeleton";

interface BreadcrumbSegment {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  state: "loading" | "populated";
  segments?: BreadcrumbSegment[];
  onNavigate?: (href: string) => void;
}

export function Breadcrumbs({ state, segments = [], onNavigate }: BreadcrumbsProps) {
  if (state === "loading") {
    return <Skeleton className="h-5 w-64" />;
  }

  if (segments.length === 0) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          
          return (
            <div key={index} className="flex items-center gap-2">
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{segment.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    onClick={(e) => {
                      if (segment.href) {
                        e.preventDefault();
                        onNavigate?.(segment.href);
                      }
                    }}
                    className="cursor-pointer"
                  >
                    {segment.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
