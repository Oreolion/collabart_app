// components/FavoriteMoods.tsx
'use client';
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

const moods = [
  "Happy", "Sad", "Relaxed", "Energetic", "Romantic", "Angry", "Peaceful", "Mysterious",
  "Dark", "Hopeful", "Melancholy", "Euphoric", "Anxious", "Nostalgic", "Aggressive",
  "Uplifting", "Chill", "Dreamy", "Funky", "Groovy", "Intense", "Sentimental", "Serious"
];

export default function FavoriteMoods({ 
  projectId, 
  initialValues,
  onSave,
}: { 
  projectId: Id<"projects">, 
  initialValues: string[] | undefined,
  onSave: () => void,
}) {
  const [selectedMoods, setSelectedMoods] = useState<string[]>(initialValues ?? []);
  const [customMood, setCustomMood] = useState('');
  const [customMoods, setCustomMoods] = useState<string[]>(
    initialValues?.filter(m => !moods.includes(m)) ?? []
  );
  const [isSaving, setIsSaving] = useState(false);
  const updateDetails = useMutation(api.projects.updateProjectDetails);

  const handleMoodToggle = (mood: string) => {
    setSelectedMoods(prev =>
      prev.includes(mood) ? prev.filter(g => g !== mood) : [...prev, mood]
    );
  };

  const handleAddCustomMood = () => {
    if (customMood && !customMoods.includes(customMood)) {
      const newMood = customMood.trim();
      setCustomMoods(prev => [...prev, newMood]);
      setSelectedMoods(prev => [...prev, newMood]); // Also add to selected
      setCustomMood('');
    }
  };

  const handleSaveSelection = async () => {
    setIsSaving(true);
    try {
      await updateDetails({
        projectId: projectId,
        moods: [...selectedMoods], // Combines predefined and custom
      });
      onSave(); // Close modal
    } catch (error) {
      console.error("Failed to save moods:", error);
      alert("Failed to save moods.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full mx-auto border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Project Moods</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-gray-600">
          What&apos;s the vibe of this project?
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-6 max-h-60 overflow-y-auto pr-2">
          {moods.map((mood) => (
            <div key={mood} className="flex items-center space-x-2">
              <Checkbox
                id={mood}
                checked={selectedMoods.includes(mood)}
                onCheckedChange={() => handleMoodToggle(mood)}
              />
              <label
                htmlFor={mood}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {mood}
              </label>
            </div>
          ))}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Custom List</h3>
          <p className="text-sm text-gray-600 mb-2">
            Can&lsquo;t see it here? Add your own.
          </p>
          <div className="flex space-x-2 mb-4">
            <Input
              type="text"
              placeholder="Enter custom mood"
              value={customMood}
              onChange={(e) => setCustomMood(e.target.value)}
              className="flex-grow"
            />
            <Button onClick={handleAddCustomMood} type="button">Add</Button>
          </div>
          {customMoods.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {customMoods.map((mood) => (
                <div key={mood} className="flex items-center space-x-2 p-2 bg-secondary rounded-md">
                  <Checkbox
                    id={`custom-${mood}`}
                    checked={selectedMoods.includes(mood)}
                    onCheckedChange={() => handleMoodToggle(mood)}
                  />
                  <label
                    htmlFor={`custom-${mood}`}
                    className="text-sm font-medium"
                  >
                    {mood}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <Button onClick={handleSaveSelection} className="mt-6 w-full" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Moods"}
        </Button>
      </CardContent>
    </Card>
  );
}