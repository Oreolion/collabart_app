'use client'
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const talents = [
  "Acoustic Bass", "Acoustic Guitar", "Arrangement", "Bagpipes", "Banjo", "Bassoon", "Cello", "Clarinet",
  "Contrabassoon", "Cornet", "Drum Programming", "Drums (acoustic)", "Electric Bass", "Electric Guitar",
  "Flute", "Guitar", "Harmonica", "Harp", "Harpsichord", "Keyboards", "Lead Guitar", "Lute", "Lyrics",
  "Mandolin", "Mastering", "Melody Writer", "Mixing", "Music Composition", "Oboe", "Percussion",
  "Piano", "Production", "Recorder", "Rhodes", "Rhythm Guitar", "Saxophone", "Synthesizer", "Trombone",
  "Trumpet", "Tuba", "Ukulele", "Upright Bass", "Viola", "Violin", "Vocals", "Vocals (female)", "Vocals (male)"
]

export default function SkillsAndTalents() {
  const [selectedTalents, setSelectedTalents] = useState<string[]>([])
  const [customTalent, setCustomTalent] = useState('')
  const [customTalents, setCustomTalents] = useState<string[]>([])

  const handleTalentToggle = (talent: string) => {
    setSelectedTalents(prev =>
      prev.includes(talent) ? prev.filter(t => t !== talent) : [...prev, talent]
    )
  }

  const handleAddCustomTalent = () => {
    if (customTalent && !customTalents.includes(customTalent)) {
      setCustomTalents(prev => [...prev, customTalent])
      setCustomTalent('')
    }
  }

  const handleSaveSelection = () => {
    console.log('Selected talents:', [...selectedTalents, ...customTalents])
    // Here you would typically send this data to your backend
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Your Skills and Talents</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-gray-600">
          Make yourself a locatable commodity. Accurate matching of your chops makes it easier for other members to find you when they're searching.
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mb-6">
          {talents.map((talent) => (
            <div key={talent} className="flex items-center space-x-2">
              <Checkbox
                id={talent}
                checked={selectedTalents.includes(talent)}
                onCheckedChange={() => handleTalentToggle(talent)}
              />
              <label
                htmlFor={talent}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {talent}
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
            Can't see it here? Add your own. Your 'talent' will be added to your custom list.
          </p>
          <div className="flex space-x-2 mb-4">
            <Input
              type="text"
              placeholder="Enter custom talent"
              value={customTalent}
              onChange={(e) => setCustomTalent(e.target.value)}
              className="flex-grow"
            />
            <Button onClick={handleAddCustomTalent}>Add</Button>
          </div>
          {customTalents.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {customTalents.map((talent) => (
                <div key={talent} className="flex items-center space-x-2">
                  <Checkbox
                    id={`custom-${talent}`}
                    checked={selectedTalents.includes(talent)}
                    onCheckedChange={() => handleTalentToggle(talent)}
                  />
                  <label
                    htmlFor={`custom-${talent}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {talent}
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