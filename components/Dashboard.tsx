"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Disc3, FolderOpen, Share2, DollarSign, Mic } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import BioSection from "./BioSection";
import UserProfileCard from "./UserProfileCard";
import OnboardingChecklist from "./OnboardingChecklist";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { DashboardSkeleton } from "@/components/Skeleton";

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const projects = useQuery(api.projects.getAllProjects);

  if (!isLoaded) return <DashboardSkeleton />;

  return (
    <>
      <section className="p-4 md:p-6 max-w-5xl mx-auto relative z-10">
        {/* Profile header */}
        <div className="mb-6 text-center glassmorphism rounded-xl py-6 px-4">
          <Avatar className="w-20 h-20 mx-auto mb-3 ring-2 ring-primary/30 shadow-lg shadow-primary/10">
            <AvatarImage src={user?.imageUrl} alt={user?.username || "User"} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              {user?.username?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-2xl font-bold text-foreground">{user?.username}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            I am an Afrobeats and HipHop Artist &amp; Songwriter
          </p>
        </div>

        <OnboardingChecklist />

        <Tabs defaultValue="dashboard" className="mb-8">
          <TabsList className="h-10 glassmorphism-subtle grid grid-cols-3 md:grid-cols-6 gap-1">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="portfolio" className="hidden md:block">Portfolio</TabsTrigger>
            <TabsTrigger value="media" className="hidden md:block">Media</TabsTrigger>
            <TabsTrigger value="tip-jar" className="hidden md:block">
              <Link href={`/my-profile/${user?.id}`}>My Account</Link>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <Card className="glassmorphism rounded-xl border-0">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">
                  Member Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  <AccordionItem className="mb-4" value="getting-started">
                    <AccordionTrigger className="text-foreground">Getting Started</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 text-sm text-muted-foreground">
                        <h2 className="text-lg font-semibold text-foreground">Free Membership Plan</h2>
                        <p>
                          Welcome, {user?.username}! Your free membership plan has been activated allowing you access to many of the community and collaboration features of the site for free.
                        </p>
                        <p>
                          With the free membership plan you will be able to start and manage a project, collaborate with others, and publish and sell your music in our Music Library.
                        </p>
                        <p>
                          If at any time you need more space, or want to run more concurrent projects, then you can easily upgrade your account at any time to one of our premium membership plans.
                        </p>
                        <p>
                          To upgrade or purchase addons for your current membership plan, go to your{" "}
                          <Link href="/membership-account" className="text-primary hover:underline">membership account</Link>{" "}
                          page. If you have any questions,{" "}
                          <Link href="/contact" className="text-primary hover:underline">contact us</Link> at anytime.
                        </p>
                        <Button variant="default" size="sm" className="mt-2">Upgrade now</Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="profile-setup">
                    <AccordionTrigger className="text-foreground">Setting Up Your Profile</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <Card className="surface-elevated border-0">
                          <CardContent className="p-4 space-y-3 text-sm text-muted-foreground">
                            <p>Just a couple of things to get done on your profile so that you can make the most of your time here.</p>
                            <p>
                              You can adjust these settings at any time by clicking the{" "}
                              <Link href="/edit-profile" className="text-primary hover:underline">Edit Profile</Link> button.
                            </p>
                            <h3 className="text-base font-semibold text-foreground mt-4">What styles of music do you love the most?</h3>
                            <p>Identify with a couple of your preferences so that others can associate with you when looking for project partners.</p>
                            <Button variant="default" size="sm">Set this up</Button>
                            <h3 className="text-base font-semibold text-foreground mt-4">What gear do you have and use?</h3>
                            <p>The microphone that you use or the guitar and amp combo that you play can be useful information for potential collaborators.</p>
                            <Button variant="default" size="sm">Set this up</Button>
                          </CardContent>
                        </Card>

                        <Card className="glassmorphism-subtle rounded-xl border-0">
                          <CardHeader><CardTitle className="text-foreground">What next..?</CardTitle></CardHeader>
                          <CardContent className="space-y-3 text-sm text-muted-foreground">
                            <p>Check out the <Link href="/projects" className="text-primary hover:underline">active projects</Link> section for members looking for your unique musical talents.</p>
                            <p>Get involved in the community by posting to the member&lsquo;s forum and giving kudos and feedback.</p>
                            <p>Get started by letting everyone know that you&lsquo;ve arrived by posting to the introductions forum.</p>
                            <p>Thanks for being here. eCollabs Team</p>
                          </CardContent>
                        </Card>

                        <Card className="glassmorphism-subtle rounded-xl border-0">
                          <CardHeader><CardTitle className="text-foreground">Activity Status</CardTitle></CardHeader>
                          <CardContent><p className="text-sm text-muted-foreground">Nothing to report.</p></CardContent>
                        </Card>

                        <Card className="glassmorphism-subtle rounded-xl border-0">
                          <CardHeader><CardTitle className="text-foreground">All Recent Notifications</CardTitle></CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground">
                              You are viewing all recent notifications. You can{" "}
                              <Link href="#" className="text-primary hover:underline">hide notifications</Link>{" "}
                              that you have already acknowledged.
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <UserProfileCard />
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects">
            <div className="space-y-4">
              <Card className="glassmorphism-subtle rounded-xl border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <FolderOpen className="w-5 h-5 text-primary" />
                    Projects I&apos;m managing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {projects?.filter(p => p.authorId === user?.id).map((project) => (
                    <div key={project._id} className="mb-3">
                      <p className="text-sm text-muted-foreground mb-2">
                        {user?.username} is currently managing active projects.
                      </p>
                      <div className="surface-elevated flex items-center justify-between p-3">
                        <div className="flex items-center gap-3">
                          <Disc3 className="w-8 h-8 text-primary" />
                          <span className="font-medium text-sm text-foreground">{project?.projectTitle}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground"><Share2 className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground"><DollarSign className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:text-primary/80"><Mic className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!projects || projects.filter(p => p.authorId === user?.id).length === 0) && (
                    <p className="text-sm text-muted-foreground">No projects yet. <Link href="/create-project" className="text-primary hover:underline">Create one</Link>.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="glassmorphism-subtle rounded-xl border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <FolderOpen className="w-5 h-5 text-accent" />
                    Projects I&apos;m collaborating on
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    You are not currently participating in any project.{" "}
                    <Link href="/projects" className="text-primary hover:underline">Search</Link> for active projects.
                  </p>
                </CardContent>
              </Card>

              <Card className="glassmorphism-subtle rounded-xl border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <FolderOpen className="w-5 h-5 text-[hsl(var(--warning))]" />
                    Projects I&apos;m auditioning for
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    You have no pending auditions.{" "}
                    <Link href="/projects" className="text-primary hover:underline">Search</Link> for active projects.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio">
            <Card className="glassmorphism-subtle rounded-xl border-0">
              <CardHeader>
                <CardTitle className="text-foreground">Portfolio of Published Works</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Nothing published yet</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Tables */}
        <div className="flex flex-col gap-6 mb-6">
          <Card className="glassmorphism-subtle rounded-xl border-0">
            <CardHeader>
              <CardTitle className="text-foreground">Work for Hire</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Contract No.</TableHead>
                    <TableHead className="text-muted-foreground">Date</TableHead>
                    <TableHead className="text-muted-foreground">Artist</TableHead>
                    <TableHead className="text-muted-foreground">Project</TableHead>
                    <TableHead className="text-muted-foreground">Scope</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="border-border">
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-6">
                      Start a project and hire artists to perform your songs
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="glassmorphism-subtle rounded-xl border-0">
            <CardHeader>
              <CardTitle className="text-foreground">Royalty Statement</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Product Ref.</TableHead>
                    <TableHead className="text-muted-foreground">Date</TableHead>
                    <TableHead className="text-muted-foreground">Description</TableHead>
                    <TableHead className="text-muted-foreground">Amount</TableHead>
                    <TableHead className="text-muted-foreground">Scope</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="border-border">
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-6">
                      You have no royalty payments.
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <BioSection />
      </section>

      <footer className="border-t border-border/10 p-4 mt-4">
        <div className="text-center text-xs text-muted-foreground">
          &copy; 2025 eCollabs. Some Rights Reserved.
        </div>
      </footer>
    </>
  );
}
