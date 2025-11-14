// components/SkillsAndTalents.tsx
"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const talents = [
  "Acoustic Bass",
  "Acoustic Guitar",
  "Arrangement",
  "Bagpipes",
  "Banjo",
  "Bassoon",
  "Cello",
  "Clarinet",
  "Contrabassoon",
  "Cornet",
  "Drum Programming",
  "Drums (acoustic)",
  "Electric Bass",
  "Electric Guitar",
  "Flute",
  "Guitar",
  "Harmonica",
  "Harp",
  "Harpsichord",
  "Keyboards",
  "Lead Guitar",
  "Lute",
  "Lyrics",
  "Mandolin",
  "Mastering",
  "Melody Writer",
  "Mixing",
  "Music Composition",
  "Oboe",
  "Percussion",
  "Piano",
  "Production",
  "Recorder",
  "Rhodes",
  "Rhythm Guitar",
  "Saxophone",
  "Synthesizer",
  "Trombone",
  "Trumpet",
  "Tuba",
  "Ukulele",
  "Upright Bass",
  "Viola",
  "Violin",
  "Vocals",
  "Vocals (female)",
  "Vocals (male)",
];

export default function SkillsAndTalents({
  projectId,
  initialValues,
  onSave,
}: {
  projectId: Id<"projects">;
  initialValues: string[] | undefined;
  onSave: () => void;
}) {
  const [selectedTalents, setSelectedTalents] = useState<string[]>(
    initialValues ?? []
  );
  const [customTalent, setCustomTalent] = useState("");
  const [customTalents, setCustomTalents] = useState<string[]>(
    initialValues?.filter((t) => !talents.includes(t)) ?? []
  );
  const [isSaving, setIsSaving] = useState(false);
  const updateDetails = useMutation(api.projects.updateProjectDetails);

  const handleTalentToggle = (talent: string) => {
    setSelectedTalents((prev) =>
      prev.includes(talent)
        ? prev.filter((t) => t !== talent)
        : [...prev, talent]
    );
  };

  const handleAddCustomTalent = () => {
    if (customTalent && !customTalents.includes(customTalent)) {
      const newTalent = customTalent.trim();
      setCustomTalents((prev) => [...prev, newTalent]);
      setSelectedTalents((prev) => [...prev, newTalent]); // Also add to selected
      setCustomTalent("");
    }
  };

  const handleSaveSelection = async () => {
    setIsSaving(true);
    try {
      await updateDetails({
        projectId: projectId,
        talents: [...selectedTalents], // Combines predefined and custom
      });
      onSave(); // Close modal
    } catch (error) {
      console.error("Failed to save talents:", error);
      alert("Failed to save talents.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full mx-auto border-none shadow-none">
      {" "}
      <CardHeader>
        {" "}
        <CardTitle className="text-2xl font-bold">
          Project Talents
        </CardTitle>{" "}
      </CardHeader>{" "}
      <CardContent>
        {" "}
        <p className="mb-4 text-sm text-gray-600">
          What skills are involved in this project?{" "}
        </p>{" "}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-6 max-h-60 overflow-y-auto pr-2">
          {" "}
          {talents.map((talent) => (
            <div key={talent} className="flex items-center space-x-2">
              {" "}
              <Checkbox
                id={talent}
                checked={selectedTalents.includes(talent)}
                onCheckedChange={() => handleTalentToggle(talent)}
              />{" "}
              <label
                htmlFor={talent}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {talent}{" "}
              </label>{" "}
            </div>
          ))}{" "}
        </div>{" "}
        <div>
          <h3 className="text-lg font-semibold mb-2">Custom List</h3>{" "}
          <p className="text-sm text-gray-600 mb-2">
            Can&lsquo;t see it here? Add your own.{" "}
          </p>{" "}
          <div className="flex space-x-2 mb-4">
            {" "}
            <Input
              type="text"
              placeholder="Enter custom talent"
              value={customTalent}
              onChange={(e) => setCustomTalent(e.target.value)}
              className="flex-grow"
            />{" "}
            <Button onClick={handleAddCustomTalent} type="button">
              Add
            </Button>{" "}
          </div>{" "}
          {customTalents.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {" "}
              {customTalents.map((talent) => (
                <div
                  key={talent}
                  className="flex items-center space-x-2 p-2 bg-secondary rounded-md"
                >
                  {" "}
                  <Checkbox
                    id={`custom-${talent}`}
                    checked={selectedTalents.includes(talent)}
                    onCheckedChange={() => handleTalentToggle(talent)}
                  />{" "}
                  <label
                    htmlFor={`custom-${talent}`}
                    className="text-sm font-medium"
                  >
                    {talent}{" "}
                  </label>{" "}
                </div>
              ))}{" "}
            </div>
          )}{" "}
        </div>
        <Button
          onClick={handleSaveSelection}
          className="mt-6 w-full"
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Talents"}{" "}
        </Button>{" "}
      </CardContent>{" "}
    </Card>
  );
}
