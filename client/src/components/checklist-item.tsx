import { useState } from "react";
import { ChecklistItem } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Hand } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChecklistItemProps {
  item: ChecklistItem;
  currentUser: string;
  onToggleComplete: (id: string, completed: boolean) => void;
  onToggleClaim: (id: string, claimed: boolean) => void;
  isUpdating: boolean;
}

export function ChecklistItemComponent({
  item,
  currentUser,
  onToggleComplete,
  onToggleClaim,
  isUpdating
}: ChecklistItemProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const handleToggleComplete = async (checked: boolean) => {
    if (!currentUser) {
      alert("Please enter your name first!");
      return;
    }
    
    setIsChecking(true);
    await onToggleComplete(item.id, checked);
    setIsChecking(false);
  };

  const handleToggleClaim = async () => {
    if (!currentUser) {
      alert("Please enter your name first!");
      return;
    }

    setIsClaiming(true);
    const shouldClaim = !item.claimedBy || item.claimedBy !== currentUser;
    await onToggleClaim(item.id, shouldClaim);
    setIsClaiming(false);
  };

  const getStatusText = () => {
    if (item.isCompleted && item.completedBy) {
      return `✅ Completed by ${item.completedBy}`;
    }
    if (item.claimedBy) {
      return `🙋 Claimed by ${item.claimedBy}`;
    }
    return "";
  };

  const getClaimButtonVariant = () => {
    if (item.claimedBy === currentUser) {
      return "text-warning hover:text-warning/80";
    }
    if (item.claimedBy) {
      return "text-gray-400";
    }
    return "text-warning hover:text-warning/80";
  };

  return (
    <div 
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors",
        item.isCompleted && "opacity-75"
      )}
      data-testid={`item-${item.id}`}
    >
      <div className="flex items-center">
        <Checkbox
          checked={item.isCompleted}
          onCheckedChange={handleToggleComplete}
          disabled={isChecking || isUpdating}
          className="w-5 h-5"
          data-testid={`checkbox-${item.id}`}
        />
      </div>
      
      <div className="flex-1">
        <span className="text-gray-800" data-testid={`text-${item.id}`}>
          {item.text}
        </span>
        {getStatusText() && (
          <div className="text-xs text-gray-500 mt-1" data-testid={`status-${item.id}`}>
            {getStatusText()}
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggleClaim}
        disabled={isClaiming || isUpdating || (item.claimedBy && item.claimedBy !== currentUser)}
        className={cn("p-2", getClaimButtonVariant())}
        data-testid={`button-claim-${item.id}`}
      >
        <Hand className="h-4 w-4" />
      </Button>
    </div>
  );
}
