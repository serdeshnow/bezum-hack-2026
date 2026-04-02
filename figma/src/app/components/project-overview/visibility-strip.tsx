import { Eye, EyeOff, Shield, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";

interface VisibilityStripProps {
  isCustomerVisible: boolean;
  onToggleVisibility?: (visible: boolean) => void;
  hiddenEntitiesCount?: number;
}

export function VisibilityStrip({
  isCustomerVisible,
  onToggleVisibility,
  hiddenEntitiesCount = 0,
}: VisibilityStripProps) {
  return (
    <Alert
      className={`border-2 ${
        isCustomerVisible
          ? "border-green-500 bg-green-50 dark:bg-green-950/20"
          : "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Visibility Icon - uses Alert component pattern */}
          <div
            className={`rounded-lg p-2 ${
              isCustomerVisible
                ? "bg-green-100 dark:bg-green-950"
                : "bg-orange-100 dark:bg-orange-950"
            }`}
          >
            {isCustomerVisible ? (
              <Eye className="size-5 text-green-600 dark:text-green-400" />
            ) : (
              <EyeOff className="size-5 text-orange-600 dark:text-orange-400" />
            )}
          </div>

          {/* Visibility Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">
                {isCustomerVisible
                  ? "Customer Visible Mode"
                  : "Internal Development Mode"}
              </h4>
              <Badge
                variant={isCustomerVisible ? "default" : "secondary"}
                className="text-xs"
              >
                {isCustomerVisible ? "Public" : "Private"}
              </Badge>
            </div>
            <AlertDescription className="mt-1">
              {isCustomerVisible ? (
                <span className="flex items-center gap-1">
                  <Shield className="size-3" />
                  All project data is visible to customers. Technical details
                  are filtered.
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <AlertTriangle className="size-3" />
                  {hiddenEntitiesCount > 0 && (
                    <>{hiddenEntitiesCount} entities hidden from customer view. </>
                  )}
                  Full technical details are visible to team only.
                </span>
              )}
            </AlertDescription>
          </div>
        </div>

        {/* Toggle Switch - uses Switch component */}
        <div
          className="flex items-center gap-2"
          title="Toggle between customer and internal view"
        >
          <Label
            htmlFor="visibility-toggle"
            className="cursor-pointer text-sm font-medium"
          >
            Customer View
          </Label>
          <Switch
            id="visibility-toggle"
            checked={isCustomerVisible}
            onCheckedChange={onToggleVisibility}
          />
        </div>
      </div>
    </Alert>
  );
}