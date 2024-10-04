"use client";
import React from "react";
import styles from "@/styles/profile.module.css";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Info } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

const ProfilePage = ({
  params,
}: {
  params: {
    profileId: string;
  };
}) => {
  const { user } = useUser();
  const userId = useQuery(api.users.getUserById, {
    clerkId: params.profileId,
  });

  console.log(userId);

  return (
    <div className={styles.profile__feeds}>
      <div className="container mx-auto p-4 space-y-8 max-sm:ml-[-1.5rem] max-sm:max-w-[25rem]">
        <h1 className="text-2xl font-bold mb-4">Member Profile</h1>

        <section className="space-y-4 max-sm:ml-[-1.5rem]">
          <h2 className="text-xl font-semibold">About Me</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                placeholder="I am an Musician and Hip-hop Artist & Songwriter"
              />
            </div>
            <div>
              <Label htmlFor="experience">Experience</Label>
              <Input id="experience" placeholder="5-10 years" />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                placeholder="https://soundcloud.com/username"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Purpose on ProCollabs</h2>
          <div className="bg-red-200 p-4 rounded-md flex justify-between">
            <span>I&apos;m Here for Fun</span>
            <span>I&apos;m Here to Work</span>
          </div>
          <div className="space-y-2">
            <Label>
              Why are you on CollabArts? Select all that apply. I am:
            </Label>
            {[
              "A lyricist looking for composers to write with",
              "A composer looking for lyricists to write with",
              "A songwriter looking for artists/musicians to record and produce my music",
              "An artist/musician looking for songs to record and produce",
              "A client (songwriter, studio, producer, label, etc.) looking to hire artists on projects",
              "A session artist/musician/engineer looking for work-for-hire opportunities",
            ].map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox id={`purpose-${index}`} />
                <Label htmlFor={`purpose-${index}`}>{option}</Label>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Biography</h2>
          <Textarea
            placeholder="Musician, Songwriter, Composer, Lyricist"
            className="min-h-[100px]"
          />
          <p className="text-sm text-gray-500">Max. 10,000 characters</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            My Gear, Equipment, Setup...
          </h2>
          <Textarea
            placeholder="Tell us about your gear..."
            className="min-h-[100px]"
          />
          <p className="text-sm text-gray-500">Max. 5,000 characters</p>
          <Button>Save Changes</Button>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">My Social Media</h2>
          <Label>Add your social music links:</Label>
          <div className="flex flex-col md:flex-row gap-2">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="YouTube" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="soundcloud">SoundCloud</SelectItem>
                <SelectItem value="spotify">Spotify</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="https://youtube.com/user"
              className="flex-grow"
            />
            <Button>Add</Button>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Personal Information</h2>
          <p className="text-red-500">
            DO NOT put your house or apartment address. Others can see this
            information.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first-name">First Name</Label>
              <Input id="first-name" placeholder={user?.firstName} />
            </div>
            <div>
              <Label htmlFor="last-name">Last Name</Label>
              <Input id="last-name" placeholder={user?.lastName} />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input id="state" placeholder="Nevada" />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="ca">Canada</SelectItem>
                  <SelectItem value="uk">United Kingdom</SelectItem>
                  <SelectItem value="sa">South Africa</SelectItem>
                  <SelectItem value="ng">Nigeria</SelectItem>
                  <SelectItem value="ken">Kenya</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Direct Contact Information</h2>
          <p className="text-sm text-gray-600">
            If you would like to include direct contact information on your
            profile, such as a telephone number or email for your business then
            you can include it here. NOTE that this information will be visible
            publicly and can be indexed by search engines. It is NOT RECOMMENDED
            to share any personal information.
          </p>
          <Textarea
            placeholder="Enter your contact information"
            className="min-h-[100px]"
          />
          <Button>Save Changes</Button>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            Performance Rights Organization (PRO) Affiliation
          </h2>
          <p className="text-sm text-gray-600">
            If you are affiliated with a PRO, enter your CAE/IPI number here.
            Your details will be automatically entered on songwriter split
            sheets and shared with co-writers. Optionally, you can also display
            this information on your personal profile.
          </p>
          <div className="flex flex-col md:flex-row gap-2">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select PRO" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ascap">ASCAP</SelectItem>
                <SelectItem value="bmi">BMI</SelectItem>
                <SelectItem value="sesac">SESAC</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="CAE/IPI Number" className="flex-grow" />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="display-pro" />
            <Label htmlFor="display-pro">Display on my profile</Label>
          </div>
          <Button>Save Changes</Button>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            Shared Collaboration Information
          </h2>
          <p className="text-sm text-gray-600">
            Rather than your username, your Artist Name will be used whenever
            you close a project and accept copyright ownership or credit in a
            completed song.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="artist-name">Artist Name</Label>
              <Input id="artist-name" placeholder="Your artist name" />
            </div>
            <div>
              <Label htmlFor="shared-contact">Shared Contact</Label>
              <Input
                id="shared-contact"
                placeholder="Shared contact information"
              />
            </div>
          </div>
          <Button>Save Changes</Button>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Tip Jar Setup</h2>
          <p className="text-sm text-gray-600">
            Members can activate the Tip Jar feature on their profile page by
            adding a valid PayPal email or Merchant ID here.
          </p>
          <Input placeholder="PayPal email or Merchant ID" />
          <div className="flex items-center space-x-2">
            <Info className="text-blue-500" />
            <p className="text-sm text-gray-600">
              Please be aware that if using your PayPal email, the email address
              will be visible to others. PayPal Business accounts can use their
              Merchant ID instead. However, make sure that your PayPal account
              is configured to accept this method.
            </p>
          </div>
          <Button>Save Changes</Button>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            Privacy and Security Settings
          </h2>
          <div className="space-y-2">
            {[
              "Full-on Publicity Google can see my profile information, including my main profile picture",
              "Limited Publicity Google can see some of my profile information and an alternate 'public' profile picture",
              "Reveal my online status to other members",
              "Don't reveal my online status to others",
              "Use my IP address for additional log-in security (default)",
              "I am having issues staying logged in. Disable the IP check security feature",
            ].map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox id={`privacy-${index}`} />
                <Label htmlFor={`privacy-${index}`}>{option}</Label>
              </div>
            ))}
          </div>
          <Button>Save Changes</Button>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
