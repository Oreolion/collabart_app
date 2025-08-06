"use client";
import React, { useState } from "react";
import styles from "@/styles/profile.module.css";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Info } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Slider } from "@/components/ui/slider";
import SkillsAndTalents from "@/components/Talents";
import FavoriteGenres from "@/components/Genres";

const ProfilePage = ({
  params,
}: {
  params: {
    profileId: string;
  };
}) => {
  const [activeTab, setActiveTab] = useState("account");

  const { user } = useUser();
  const userId = useQuery(api.users.getUserById, {
    clerkId: params.profileId,
  });

  console.log(userId);

  const membershipData = {
    plan: "Basic Membership Subscription",
    spaceAllocation: "1 GB space / 2 concurrent projects",
    periodFrom: "Sep 17, 2024",
    periodTo: "Sep 17, 2025",
    totalOpenProjects: "1 / 2",
    totalSpaceUsed: "0.00 / 1 GB",
  };

  const usageData = [
    { type: "Projects", files: "0", used: "0 MB" },
    { type: "Completed", files: "0", used: "0 MB" },
    { type: "Auditions", files: "0", used: "0 MB" },
    { type: "Media", files: "0", used: "0 MB" },
  ];

  const membershipServices = [
    {
      id: "110",
      name: "Silver Membership Upgrade",
      description:
        "Annual plan which includes all core site features (Band, Media Library, high definition file upload, music sales, etc.) along with 5 GB of project or media space and 4 concurrent collaboration projects. In addition, this plan can be customized with add-on features at 50% discount.",
      amount: 20.0,
    },
    {
      id: "120",
      name: "Gold Membership Upgrade",
      description:
        "Everything in the Silver membership plan plus a total of 15 simultaneous projects and 10 GB of project or media space. Additionally, this plan comes with project privacy and custom profile icon features included. This plan can be customized at anytime with add-on features.",
      amount: 50.0,
    },
    // Add more services here...
  ];

  return (
    <div className={styles.profile__feeds}>
      <h1 className="text-3xl font-bold mb-2">My Profile</h1>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full bg-gray-400"
      >
        <TabsList className="grid h-12 w-full gap-4 grid-cols-6 lg:grid-cols-6 max-md:gap-1">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="talents">Talents</TabsTrigger>
          <TabsTrigger value="genres">Genres</TabsTrigger>
          <TabsTrigger value="banner">Banner</TabsTrigger>
          <TabsTrigger value="picture">Picture</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="bg-gray-400">
          <div className="container mx-auto p-4 space-y-8 max-sm:ml-[-1.5rem] max-sm:max-w-[25rem] bg-gray-400">
            <h1 className="text-2xl font-bold mb-4">Member Profile</h1>

            <section className="space-y-4 max-sm:ml-[-1.5rem]  bg-gray-400">
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

            <Card className="mb-6 bg-gray-400">
              <CardHeader>
                <CardTitle>Purpose on ProCollabs</CardTitle>
              </CardHeader>
              <CardContent>
                <Slider
                  defaultValue={[50]}
                  max={100}
                  step={1}
                  className="mb-4"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>I&apos;m Here for Fun</div>
                  <div className="text-right">I&apos;m Here to Work</div>
                </div>
                <div className="mt-4">
                  <p className="mb-2">
                    Why are you on ProCollabs? Select all that apply. I am:
                  </p>
                  <div className="space-y-2">
                    {[
                      "A lyricist looking for composers to write with",
                      "A composer looking for lyricists to write with",
                      "A songwriter looking for artists/musicians to record and produce my music",
                      "An artist/musician looking for songs to record and produce",
                      "A client (songwriter, studio, producer, label, etc.) looking to hire artists on projects",
                      "A session artist/musician/engineer looking for work-for-hire opportunities",
                    ].map((option, index) => (
                      <div key={index} className="flex items-center">
                        <Checkbox id={`purpose-${index}`} />
                        <label
                          htmlFor={`purpose-${index}`}
                          className="ml-2 text-sm"
                        >
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

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
              <h2 className="text-xl font-semibold">
                Direct Contact Information
              </h2>
              <p className="text-sm text-gray-600">
                If you would like to include direct contact information on your
                profile, such as a telephone number or email for your business
                then you can include it here. NOTE that this information will be
                visible publicly and can be indexed by search engines. It is NOT
                RECOMMENDED to share any personal information.
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
                If you are affiliated with a PRO, enter your CAE/IPI number
                here. Your details will be automatically entered on songwriter
                split sheets and shared with co-writers. Optionally, you can
                also display this information on your personal profile.
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
                Rather than your username, your Artist Name will be used
                whenever you close a project and accept copyright ownership or
                credit in a completed song.
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
                Members can activate the Tip Jar feature on their profile page
                by adding a valid PayPal email or Merchant ID here.
              </p>
              <Input placeholder="PayPal email or Merchant ID" />
              <div className="flex items-center space-x-2">
                <Info className="text-blue-500" />
                <p className="text-sm text-gray-600">
                  Please be aware that if using your PayPal email, the email
                  address will be visible to others. PayPal Business accounts
                  can use their Merchant ID instead. However, make sure that
                  your PayPal account is configured to accept this method.
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
        </TabsContent>
        <TabsContent value="account" className="bg-gray-400">
          <Card className="bg-gray-400">
            <CardHeader>
              <CardTitle>My Membership Plan</CardTitle>
            </CardHeader>
            <CardContent className="bg-gray-400">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Membership Plan</h3>
                  <p>{membershipData.plan}</p>
                </div>
                <div>
                  <h3 className="font-semibold">
                    Space and Project Allocation
                  </h3>
                  <p>{membershipData.spaceAllocation}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Period From</h3>
                  <p>{membershipData.periodFrom}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Period To</h3>
                  <p>{membershipData.periodTo}</p>
                </div>
              </div>
              <div className="mt-4">
                <p>Total Open Projects: {membershipData.totalOpenProjects}</p>
                <p>Total Space Used: {membershipData.totalSpaceUsed}</p>
              </div>
              <Table className="mt-4">
                <TableHeader>
                  <TableRow>
                    <TableHead>Summary</TableHead>
                    <TableHead>Files</TableHead>
                    <TableHead>Used</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usageData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>{item.files}</TableCell>
                      <TableCell>{item.used}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="bg-gray-400">
            <CardHeader>
              <CardTitle>My Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <p>You have no outstanding invoice payments due.</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-400">
            <CardHeader>
              <CardTitle>Purchase Membership Services</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                An &apos;annual membership plan&apos; is required for
                participation on ProCollabs. You can customize your plan by
                adding additional service/product features at any time. Add-on
                features are included into your annual plan and pricing is
                calculated based on your remaining membership subscription
                period.
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item #</TableHead>
                    <TableHead>Product/Service</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Purchase Quantity</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {membershipServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>{service.id}</TableCell>
                      <TableCell>{service.name}</TableCell>
                      <TableCell>{service.description}</TableCell>
                      <TableCell>${service.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          defaultValue="1"
                          min="1"
                          className="w-16"
                        />
                      </TableCell>
                      <TableCell>
                        <Button variant="outline">Add to Invoice</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="bg-gray-400">
            <CardHeader>
              <CardTitle>My Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <p>You have no paid invoices on record.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="talents" className="bg-gray-400">
          <SkillsAndTalents />
        </TabsContent>
        <TabsContent value="genres" className="bg-gray-400">
          <FavoriteGenres />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
