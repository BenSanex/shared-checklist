import { ChecklistItem, Claim } from "@shared/schema";
import { ChecklistItemComponent } from "./checklist-item";

type ChecklistItemWithClaims = ChecklistItem & { claims: Claim[] };

interface ChecklistSectionProps {
  title: string;
  items: ChecklistItemWithClaims[];
  currentUser: string;
  onToggleComplete: (id: string, completed: boolean) => void;
  onToggleClaim: (id: string, userHasClaim: boolean) => void;
  isUpdating: boolean;
}

export function ChecklistSection({
  title,
  items,
  currentUser,
  onToggleComplete,
  onToggleClaim,
  isUpdating
}: ChecklistSectionProps) {
  if (items.length === 0) return null;

  return (
    <section className="bg-white mx-4 mt-4 rounded-lg shadow-sm border overflow-hidden" data-testid={`section-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
      <div className="bg-primary/10 px-4 py-3 border-b">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2" data-testid={`heading-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
          {title}
        </h2>
      </div>
      <div className="p-4 space-y-3">
        {items.map((item) => (
          <ChecklistItemComponent
            key={item.id}
            item={item}
            currentUser={currentUser}
            onToggleComplete={onToggleComplete}
            onToggleClaim={onToggleClaim}
            isUpdating={isUpdating}
          />
        ))}
      </div>
    </section>
  );
}
