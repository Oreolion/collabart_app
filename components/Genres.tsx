import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const genres = [
  "Acoustic", "Alternative", "Ambient", "Americana", "Avant-Garde", "Baroque", "Bluegrass", "Blues",
  "Celtic", "Chant", "Childrens Music", "Christian", "Classical", "Comedy", "Contemporary", "Country",
  "Crunk", "Dance", "Dancehall", "Doo-wop", "Dubstep", "Easy Listening", "Electronica",
  "Experimental", "Folk", "Funk", "Gospel", "Goth", "Grunge", "Hard Rock",
  "Hip Hop", "Holiday", "House", "Indie", "Industrial", "Inspirational", "Instrumental", "Jazz",
  "Latin", "Lounge", "Meditation", "Metal", "Motown", "Nature", "New Age", "Old School",
  "Opera", "Orchestral", "Original Score", "Parody", "Polka", "Pop", "R&B", "Rap", "Reggae",
  "Reggaeton", "Rock", "Salsa", "Singer/Songwriter", "Ska", "Soft Rock", "Soul", "Soundtrack",
  "Spoken Word", "Swing", "Techno", "Tejano", "Torch", "Trance", "World"
]

export default function FavoriteGenres() {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [customGenre, setCustomGenre] = useState('')
  const [customGenres, setCustomGenres] = useState<string[]>([])

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    )
  }

  const handleAddCustomGenre = () => {
    if (customGenre && !customGenres.includes(customGenre)) {
      setCustomGenres(prev => [...prev, customGenre])
      setCustomGenre('')
    }
  }

  const handleSaveSelection = () => {
    console.log('Selected genres:', [...selectedGenres, ...customGenres])
    // Here you would typically send this data to your backend
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Favorite Genres</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-gray-600">
          What do you love the most?
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mb-6">
          {genres.map((genre) => (
            <div key={genre} className="flex items-center space-x-2">
              <Checkbox
                id={genre}
                checked={selectedGenres.includes(genre)}
                onCheckedChange={() => handleGenreToggle(genre)}
              />
              <label
                htmlFor={genre}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {genre}
              </label>
            </div>
          ))}
        </div>

        <Button onClick={handleSaveSelection} className="mb-6">
          Save Selection
        </Button>

        <div>
          <h3 className="text-lg font-semibold mb-2">Custom List</h3>
          <p className="text-sm text-gray-600 mb-2">
            Can&lsquo;t see it here? Add your own. Your &lsquo;genre&lsquo; will be added to your custom list.
          </p>
          <div className="flex space-x-2 mb-4">
            <Input
              type="text"
              placeholder="Enter custom genre"
              value={customGenre}
              onChange={(e) => setCustomGenre(e.target.value)}
              className="flex-grow"
            />
            <Button onClick={handleAddCustomGenre}>Add</Button>
          </div>
          {customGenres.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {customGenres.map((genre) => (
                <div key={genre} className="flex items-center space-x-2">
                  <Checkbox
                    id={`custom-${genre}`}
                    checked={selectedGenres.includes(genre)}
                    onCheckedChange={() => handleGenreToggle(genre)}
                  />
                  <label
                    htmlFor={`custom-${genre}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {genre}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}