"use client";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import SkillsAndTalents from "./Talents";
import FavoriteGenres from "./Genres";

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState("account");
  const [socialMediaLinks, setSocialMediaLinks] = useState<string[]>([]);

  const addSocialMediaLink = () => {
    setSocialMediaLinks([...socialMediaLinks, ""]);
  };

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
    <div className="container mx-auto p-4 space-y-8 max-[480px]:max-w-[25rem] max-md:ml-[-1.9rem] max-[320px]:ml-[-.5rem]">
      <h1 className="text-3xl font-bold">Account</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full bg-gray-400">
        <TabsList className="grid h-12 w-full gap-4 grid-cols-6 lg:grid-cols-6 max-md:gap-1">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="talents">Talents</TabsTrigger>
          <TabsTrigger value="genres">Genres</TabsTrigger>
          <TabsTrigger value="banner">Banner</TabsTrigger>
          <TabsTrigger value="picture">Picture</TabsTrigger>
        </TabsList>
        <TabsContent value="account" className="bg-gray-400">
          <Card className="bg-gray-400">
            <CardHeader>
              <CardTitle>My Membership Plan</CardTitle>
            </CardHeader>
            <CardContent>
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
        <TabsContent value="profile" className="bg-gray-400">
          <h1 className="text-2xl font-bold mb-6">Member Profile</h1>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>About Me</CardTitle>
            </CardHeader>
            <CardContent className="bg-gray-400">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="industry"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Industry
                  </label>
                  <Input
                    id="industry"
                    placeholder="e.g. Hip-Hop Producer and Songwriter"
                  />
                </div>
                <div>
                  <label
                    htmlFor="website"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Website
                  </label>
                  <Input id="website" placeholder="https://yourwebsite.com" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6 bg-gray-400">
            <CardHeader>
              <CardTitle>Purpose on ProCollabs</CardTitle>
            </CardHeader>
            <CardContent>
              <Slider defaultValue={[50]} max={100} step={1} className="mb-4" />
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

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Biography</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter your biography here"
                className="min-h-[150px]"
              />
              <p className="text-sm text-gray-500 mt-2">
                Max. 10,000 characters
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>My Gear, Equipment, Setup...</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Describe your gear and setup"
                className="min-h-[150px]"
              />
              <p className="text-sm text-gray-500 mt-2">
                Max. 5,000 characters
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>My Social Media</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2">Add your social media links:</p>
              {socialMediaLinks.map((link, index) => (
                <div key={index} className="flex mb-2">
                  <Input
                    value={link}
                    onChange={(e) => {
                      const newLinks = [...socialMediaLinks];
                      newLinks[index] = e.target.value;
                      setSocialMediaLinks(newLinks);
                    }}
                    placeholder="https://example.com"
                    className="mr-2"
                  />
                  <Button
                    onClick={() => {
                      const newLinks = socialMediaLinks.filter(
                        (_, i) => i !== index
                      );
                      setSocialMediaLinks(newLinks);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button onClick={addSocialMediaLink}>
                Add Social Media Link
              </Button>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-500 mb-4">
                DO NOT put your house or apartment address. Others can see this
                information.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    First Name
                  </label>
                  <Input id="firstName" />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Last Name
                  </label>
                  <Input id="lastName" />
                </div>
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700"
                  >
                    City
                  </label>
                  <Input id="city" />
                </div>
                <div>
                  <label
                    htmlFor="state"
                    className="block text-sm font-medium text-gray-700"
                  >
                    State
                  </label>
                  <Input id="state" />
                </div>
                <div className="md:col-span-2">
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Country
                  </label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      {/* Add more countries as needed */}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                Performance Rights Organization (PRO) Affiliation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select your PRO" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ascap">ASCAP</SelectItem>
                  <SelectItem value="bmi">BMI</SelectItem>
                  <SelectItem value="sesac">SESAC</SelectItem>
                  {/* Add more PROs as needed */}
                </SelectContent>
              </Select>
              <div className="mt-4">
                <Checkbox id="displayOnProfile" />
                <label htmlFor="displayOnProfile" className="ml-2">
                  Display on my profile
                </label>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Privacy and Security Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Checkbox id="fullPublicity" />
                  <label htmlFor="fullPublicity" className="ml-2">
                    Full Publicity: Google can see my profile information,
                    including my main profile picture
                  </label>
                </div>
                <div className="flex items-center">
                  <Checkbox id="limitedPublicity" />
                  <label htmlFor="limitedPublicity" className="ml-2">
                    Limited Publicity: Google can see some of my profile
                    information and an alternate `public` profile picture
                  </label>
                </div>
                <div className="flex items-center">
                  <Checkbox id="revealStatus" />
                  <label htmlFor="revealStatus" className="ml-2">
                    Don`t reveal my online status to others
                  </label>
                </div>
                <div className="flex items-center">
                  <Checkbox id="ipAddress" />
                  <label htmlFor="ipAddress" className="ml-2">
                    Use my IP address for additional log-in security (default)
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button>Save Changes</Button>
          </div>
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
}
