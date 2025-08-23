import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChecklistItem, InsertChecklistItem, Claim } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

type ChecklistItemWithClaims = ChecklistItem & { claims: Claim[] };

export function useChecklist() {
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery<ChecklistItemWithClaims[]>({
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

  const addClaimMutation = useMutation({
    mutationFn: async ({ id, claimedBy }: { id: string; claimedBy: string }) => {
      const response = await apiRequest("POST", `/api/checklist-items/${id}/claims`, { claimedBy });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checklist-items"] });
    },
  });

  const removeClaimMutation = useMutation({
    mutationFn: async ({ id, claimedBy }: { id: string; claimedBy: string }) => {
      const response = await apiRequest("DELETE", `/api/checklist-items/${id}/claims/${claimedBy}`);
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
          completedAt: new Date().toISOString()
        }
      : { 
          isCompleted: false, 
          completedBy: null,
          completedAt: null
        };
    
    return updateItemMutation.mutateAsync({ id, updates });
  };

  const toggleClaim = async (id: string, userHasClaim: boolean) => {
    const currentUser = localStorage.getItem("currentUser") || "Unknown";
    
    if (userHasClaim) {
      // Remove the user's claim
      return removeClaimMutation.mutateAsync({ id, claimedBy: currentUser });
    } else {
      // Add a new claim
      return addClaimMutation.mutateAsync({ id, claimedBy: currentUser });
    }
  };

  return {
    items,
    isLoading,
    addItem,
    toggleComplete,
    toggleClaim,
    isAddingItem: addItemMutation.isPending,
    isUpdating: updateItemMutation.isPending || addClaimMutation.isPending || removeClaimMutation.isPending,
  };
}
