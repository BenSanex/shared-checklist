import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ChecklistSection } from "@/components/checklist-section";
import { useChecklist } from "@/hooks/use-checklist";
import { Plus } from "lucide-react";
import castleRockImage from "@assets/dji_fly_20230730_104736_139_1690769208787_photo_optimized_1755964455161.jpg";

export default function Home() {
  const [currentUser, setCurrentUser] = useState("");
  const [userName, setUserName] = useState("");
  const [showNameEntry, setShowNameEntry] = useState(false);
  const [newItemText, setNewItemText] = useState("");
  
  const { 
    items, 
    isLoading, 
    addItem, 
    toggleComplete, 
    toggleClaim, 
    isAddingItem,
    isUpdating 
  } = useChecklist();

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      setCurrentUser(savedUser);
    } else {
      setShowNameEntry(true);
    }
  }, []);

  const handleSetUserName = () => {
    if (userName.trim()) {
      setCurrentUser(userName.trim());
      localStorage.setItem("currentUser", userName.trim());
      setShowNameEntry(false);
      setUserName("");
    }
  };

  const handleChangeUser = () => {
    setCurrentUser("");
    localStorage.removeItem("currentUser");
    setShowNameEntry(true);
  };

  const handleAddNewItem = async () => {
    if (newItemText.trim()) {
      await addItem({
        text: newItemText.trim(),
        category: "custom"
      });
      setNewItemText("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      action();
    }
  };

  const grillingItems = items.filter(item => item.category === "grilling");
  const foodItems = items.filter(item => item.category === "food");
  const customItems = items.filter(item => item.category === "custom");

  const completedCount = items.filter(item => item.isCompleted).length;
  const totalCount = items.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading checklist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Castle Rock Photo */}
      <header 
        className="relative h-48 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${castleRockImage})`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <div className="relative z-10 p-6 text-white">
          <h1 className="text-2xl font-bold mb-2" data-testid="title">🏰 Castle Rock Trip</h1>
          <p className="text-sm opacity-90 mb-4" data-testid="subtitle">Family Checklist</p>
          
          {/* Name Entry Section */}
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            {showNameEntry ? (
              <div data-testid="name-entry">
                <label className="block text-sm font-medium mb-2">Enter your name:</label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, handleSetUserName)}
                    className="flex-1 text-black"
                    data-testid="input-username"
                  />
                  <Button 
                    onClick={handleSetUserName}
                    className="bg-primary text-white hover:bg-primary/90"
                    data-testid="button-join"
                  >
                    Join
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between" data-testid="user-session">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  <span className="text-sm">
                    In session as: <strong data-testid="text-current-user">{currentUser}</strong>
                  </span>
                </div>
                <button
                  onClick={handleChangeUser}
                  className="text-xs underline opacity-75 hover:opacity-100"
                  data-testid="button-change-user"
                >
                  Change
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-24">
        {/* Progress Summary */}
        <div className="bg-white mx-4 mt-4 p-4 rounded-lg shadow-sm border" data-testid="progress-summary">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-xs text-gray-500" data-testid="text-progress">
              {completedCount} of {totalCount} completed
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" data-testid="progress-bar" />
        </div>

        {/* Grilling & Fire Setup Section */}
        <ChecklistSection
          title="🔥 Grilling & Fire Setup"
          items={grillingItems}
          currentUser={currentUser}
          onToggleComplete={toggleComplete}
          onToggleClaim={toggleClaim}
          isUpdating={isUpdating}
        />

        {/* Food & Prep Section */}
        <ChecklistSection
          title="🍴 Food & Prep"
          items={foodItems}
          currentUser={currentUser}
          onToggleComplete={toggleComplete}
          onToggleClaim={toggleClaim}
          isUpdating={isUpdating}
        />

        {/* Custom Items Section */}
        {customItems.length > 0 && (
          <ChecklistSection
            title="📝 Added Items"
            items={customItems}
            currentUser={currentUser}
            onToggleComplete={toggleComplete}
            onToggleClaim={toggleClaim}
            isUpdating={isUpdating}
          />
        )}
      </main>

      {/* Fixed Bottom Add Item Section */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="p-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Add new item..."
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, handleAddNewItem)}
              className="flex-1"
              data-testid="input-new-item"
            />
            <Button
              onClick={handleAddNewItem}
              disabled={isAddingItem || !newItemText.trim()}
              className="bg-primary text-white hover:bg-primary/90"
              data-testid="button-add-item"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
