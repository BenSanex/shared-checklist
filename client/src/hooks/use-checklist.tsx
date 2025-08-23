import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChecklistItem, InsertChecklistItem } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function useChecklist() {
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery<ChecklistItem[]>({
    queryKey: ["/api/checklist-items"],
    refetchInterval: 2000, // Poll every 2 seconds for real-time updates
  });

  const addItemMutation = useMutation({
    mutationFn: async (newItem: InsertChecklistItem) => {
      const response = await apiRequest("POST", "/api/checklist-items", newItem);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checklist-items"] });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const response = await apiRequest("PATCH", `/api/checklist-items/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checklist-items"] });
    },
  });

  const addItem = async (item: InsertChecklistItem) => {
    return addItemMutation.mutateAsync(item);
  };

  const toggleComplete = async (id: string, completed: boolean) => {
    const updates = completed 
      ? { 
          isCompleted: true, 
          completedBy: localStorage.getItem("currentUser") || "Unknown",
          completedAt: new Date()
        }
      : { 
          isCompleted: false, 
          completedBy: null,
          completedAt: null
        };
    
    return updateItemMutation.mutateAsync({ id, updates });
  };

  const toggleClaim = async (id: string, claimed: boolean) => {
    const updates = claimed
      ? {
          claimedBy: localStorage.getItem("currentUser") || "Unknown",
          claimedAt: new Date()
        }
      : {
          claimedBy: null,
          claimedAt: null
        };

    return updateItemMutation.mutateAsync({ id, updates });
  };

  return {
    items,
    isLoading,
    addItem,
    toggleComplete,
    toggleClaim,
    isAddingItem: addItemMutation.isPending,
    isUpdating: updateItemMutation.isPending,
  };
}
