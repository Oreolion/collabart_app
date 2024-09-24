import Image from 'next/image'
import Link from 'next/link'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Globe, Heart, DollarSign } from 'lucide-react'

export default function UserProfile() {
  return (
    <div className="container mx-auto p-4 bg-blue-400">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Sidebar */}
        <div className="w-full md:w-1/3 space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Badge variant="secondary">Basic Member</Badge>
                  <Link href="#" className="text-sm text-blue-500 hover:underline">[upgrade]</Link>
                </div>
                <div className="h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full" />
                <p className="text-sm text-gray-500">Since 17 September, 2024</p>
                <h2 className="text-xl font-bold">remy adedeji</h2>
                <p>Nairobi, nairobi</p>
                <p>Kenya</p>
                <p className="text-sm text-gray-500">Tuesday 3:34:21 pm</p>
                <p className="flex items-center text-green-500">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  I am online now
                </p>
                <div className="flex justify-center">
                  <Globe className="w-6 h-6 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Image src="/placeholder.svg?height=24&width=24" alt="Trophy" width={24} height={24} className="mr-2" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Earn your ProCollabs Awards and Achievements by entering our Challenges and by generally being an awesome collaborator!
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="w-full md:w-2/3 space-y-4">
          <div className="flex items-center gap-4">
            <Image src="/placeholder.svg?height=64&width=64" alt="User Avatar" width={64} height={64} className="rounded-full" />
            <div>
              <h1 className="text-2xl font-bold">remyoreo</h1>
              <p className="text-gray-500">Afrobeats and HipHop</p>
            </div>
          </div>

          <Card>
            <CardContent className="p-4">
              <p>
                You have nothing on display. To show off your best work,{' '}
                <Link href="#" className="text-blue-500 hover:underline">
                  add music
                </Link>{' '}
                from your portfolio or library.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Collaborator Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                remyoreo is currently active in{' '}
                <Link href="#" className="text-blue-500 hover:underline">
                  1 project
                </Link>
                .
              </p>

              <div className="space-y-2">
                <Label>Collaboration Preference</Label>
                <div className="flex justify-between items-center">
                  <Heart className="w-6 h-6" />
                  <Slider defaultValue={[75]} max={100} step={1} className="w-[200px]" />
                  <DollarSign className="w-6 h-6" />
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Here for fun</span>
                  <span>A bit of both</span>
                  <span>Here to work</span>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  'Looking for artists/musicians to record my songs',
                  'Looking for original songs to record/produce',
                  'Looking for paid work-for-hire opportunities'
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox id={`item-${index}`} checked />
                    <Label htmlFor={`item-${index}`}>{item}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}