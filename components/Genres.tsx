// components/FavoriteGenres.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const genres = [
  "Acoustic",
  "Alternative",
  "Ambient",
  "Americana",
  "Avant-Garde",
  "Baroque",
  "Bluegrass",
  "Blues",
  "Celtic",
  "Chant",
  "Childrens Music",
  "Christian",
  "Classical",
  "Comedy",
  "Contemporary",
  "Country",
  "Crunk",
  "Dance",
  "Dancehall",
  "Doo-wop",
  "Dubstep",
  "Easy Listening",
  "Electronica",
  "Experimental",
  "Folk",
  "Funk",
  "Gospel",
  "Goth",
  "Grunge",
  "Hard Rock",
  "Hip Hop",
  "Holiday",
  "House",
  "Indie",
  "Industrial",
  "Inspirational",
  "Instrumental",
  "Jazz",
  "Latin",
  "Lounge",
  "Meditation",
  "Metal",
  "Motown",
  "Nature",
  "New Age",
  "Old School",
  "Opera",
  "Orchestral",
  "Original Score",
  "Parody",
  "Polka",
  "Pop",
  "R&B",
  "Rap",
  "Reggae",
  "Reggaeton",
  "Rock",
  "Salsa",
  "Singer/Songwriter",
  "Ska",
  "Soft Rock",
  "Soul",
  "Soundtrack",
  "Spoken Word",
  "Swing",
  "Techno",
  "Tejano",
  "Torch",
  "Trance",
  "World",
];

export default function FavoriteGenres({
  projectId,
  initialValues,
  onSave,
}: {
  projectId: Id<"projects">;
  initialValues: string[] | undefined;
  onSave: () => void;
}) {
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    initialValues ?? []
  );
  const [customGenre, setCustomGenre] = useState("");
  const [customGenres, setCustomGenres] = useState<string[]>(
    initialValues?.filter((g) => !genres.includes(g)) ?? []
  );
  const [isSaving, setIsSaving] = useState(false);
  const updateDetails = useMutation(api.projects.updateProjectDetails);

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleAddCustomGenre = () => {
    if (customGenre && !customGenres.includes(customGenre)) {
      const newGenre = customGenre.trim();
      setCustomGenres((prev) => [...prev, newGenre]);
      setSelectedGenres((prev) => [...prev, newGenre]); // Also add to selected
      setCustomGenre("");
    }
  };

  const handleSaveSelection = async () => {
    setIsSaving(true);
    try {
      await updateDetails({
        projectId: projectId,
        genres: [...selectedGenres], // Combines predefined and custom
      });
      onSave(); // Close modal
    } catch (error) {
      console.error("Failed to save genres:", error);
      alert("Failed to save genres.");
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
          Project Genres
        </CardTitle>{" "}
      </CardHeader>{" "}
      <CardContent>
        {" "}
        <p className="mb-4 text-sm text-gray-600">
          What do you love the most?{" "}
        </p>{" "}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-6 max-h-60 overflow-y-auto pr-2">
          {" "}
          {genres.map((genre) => (
            <div key={genre} className="flex items-center space-x-2">
              {" "}
              <Checkbox
                id={genre}
                checked={selectedGenres.includes(genre)}
                onCheckedChange={() => handleGenreToggle(genre)}
              />{" "}
              <label
                htmlFor={genre}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {genre}{" "}
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
              placeholder="Enter custom genre"
              value={customGenre}
              onChange={(e) => setCustomGenre(e.target.value)}
              className="flex-grow"
            />{" "}
            <Button onClick={handleAddCustomGenre} type="button">
              Add
            </Button>{" "}
          </div>{" "}
          {customGenres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {" "}
              {customGenres.map((genre) => (
                <div
                  key={genre}
                  className="flex items-center space-x-2 p-2 bg-secondary rounded-md"
                >
                  {" "}
                  <Checkbox
                    id={`custom-${genre}`}
                    checked={selectedGenres.includes(genre)}
                    onCheckedChange={() => handleGenreToggle(genre)}
                  />{" "}
                  <label
                    htmlFor={`custom-${genre}`}
                    className="text-sm font-medium"
                  >
                    {genre}{" "}
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
          {isSaving ? "Saving..." : "Save Genres"}{" "}
        </Button>{" "}
      </CardContent>{" "}
    </Card>
  );
}
