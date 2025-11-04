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
import styles from "@/styles/dashboard.module.css";
import BioSection from "./BioSection";
import UserProfileCard from "./UserProfileCard";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";

export default function Dashboard() {
  const { user } = useUser();

  const projects = useQuery(api.projects.getAllProjects);

  console.log(projects);
  //   console.log(user);

  return (
    <>
      <section className={styles.dashboard__feeds}>
        <main className={styles.dashboard__content}>
          <div className="mb-5 text-center bg-slate-900 py-4 rounded-tl-3xl rounded-tr-3xl max-[320px]:max-w-[25rem]">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              <AvatarImage src={user?.imageUrl} alt="remyoreo" />
              <AvatarFallback>{user?.username}</AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold">{user?.username}</h2>
            <p className="text-gray-100">
              I am an Afrobeats and HipHop Artist & Songwriter
            </p>
          </div>

          <Tabs defaultValue="dashboard" className="mb-8 max-[320px]:max-w-[25rem]">
            <TabsList className="h-10 grid gap-4 grid-cols-3 md:grid-cols-6 max-md:flex max-md:justify-between max-[480px]:gap-8">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="portfolio" className="hidden md:block">
                Portfolio
              </TabsTrigger>
              <TabsTrigger value="media" className="hidden md:block">
                Media
              </TabsTrigger>
              <TabsTrigger value="tip-jar" className="hidden md:block">
                <Link href={`/my-profile/${user?.id}`}>My Account</Link>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="dashboard">
              <Card className="bg-gray-300">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold bg-slate-800 p-2 max-md:ml-[-1rem] text-gray-100">
                    Member Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible>
                    <AccordionItem className="mb-4" value="getting-started">
                      <AccordionTrigger className="mb-2">
                        Getting Started
                      </AccordionTrigger>
                      <AccordionContent>
                        <CardContent>
                          <h2 className="text-xl font-semibold mb-2">
                            Free Membership Plan
                          </h2>
                          <p className="mb-4">
                            Welcome, remyoreo! Your free membership plan has
                            been activated allowing you access to many of the
                            community and collaboration features of the site for
                            free.
                          </p>
                          <p className="mb-4">
                            With the free membership plan you will be able to
                            start and manage a project, collaborate with others,
                            and publish and sell your music in our Music
                            Library, and you can also get involved with our
                            community in the forums, discussions and by
                            supporting others with their projects.
                          </p>
                          <p className="mb-4">
                            If at any time you need more space, or want to run
                            more concurrent projects, then you can easily
                            upgrade your account at any time to one of our
                            premium membership plans or purchase addons (such as
                            more space) to best suit your needs.
                          </p>
                          <p className="mb-4">
                            To upgrade or purchase addons for your current
                            membership plan, go to your{" "}
                            <Link
                              href="/membership-account"
                              className="text-blue-600 hover:underline"
                            >
                              membership account
                            </Link>{" "}
                            page. If you have any questions or need help, please
                            don&apos;t hesitate to{" "}
                            <Link
                              href="/contact"
                              className="text-blue-600 hover:underline"
                            >
                              contact us
                            </Link>{" "}
                            at anytime.
                          </p>
                          <Button variant="default" className="mt-2">
                            Upgrade now
                          </Button>
                        </CardContent>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="profile-setup">
                      <AccordionTrigger className="mb-2">
                        Setting Up Your Profile
                      </AccordionTrigger>
                      <AccordionContent>
                        <Card className="">
                          <CardContent className="p-4 bg-gray-400">
                            <p className="mb-4">
                              Just a couple of things to get done on your
                              profile so that you can make the most of your time
                              here and interact more effectively with other
                              members in the community and on projects.
                            </p>
                            <p className="mb-4">
                              You can adjust these and other settings for your
                              account and profile at any time by clicking the{" "}
                              <Link
                                href="/edit-profile"
                                className="text-blue-600 hover:underline"
                              >
                                Edit Profile
                              </Link>{" "}
                              button. Once your account has been setup, this
                              entire section will disappear.
                            </p>

                            <h3 className="text-lg font-semibold mt-6 mb-2">
                              <span className="mr-2">❤️</span>
                              What styles of music do you love the most?
                            </h3>
                            <p className="mb-4">
                              Obviously, most of us will have preferences about
                              the style and genre of music that we enjoy the
                              most, so why not identify with a couple of your
                              preferences so that others can associate with you
                              when looking for project partners.
                            </p>
                            <Button variant="default">Set this up</Button>

                            <h3 className="text-lg font-semibold mt-6 mb-2">
                              <span className="mr-2">🎸</span>
                              What gear do you have and use?
                            </h3>
                            <p className="mb-4">
                              We all gotta have or use something to make those
                              beautiful recordings and sometimes your
                              collaborators will be looking for a particular
                              sound, so the microphone that you use or the
                              guitar and amp combo that you play can be useful
                              information for potential collaborators. If
                              you&apos;re a writer, what pen are you using?
                            </p>
                            <Button variant="default">Set this up</Button>
                          </CardContent>
                        </Card>

                        <Card className="mb-6 bg-gray-300">
                          <CardHeader>
                            <CardTitle>What next..?</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="mb-4">
                              Check out the{" "}
                              <Link
                                href="/active-projects"
                                className="text-blue-600 hover:underline"
                              >
                                active projects
                              </Link>{" "}
                              section for members looking for your unique
                              musical talents and upload an{" "}
                              <Link
                                href="/audition"
                                className="text-blue-600 hover:underline"
                              >
                                audition
                              </Link>{" "}
                              to their project.
                            </p>
                            <p className="mb-4">
                              You&lsquo;ll also want to get involved in the
                              community by posting to the member&lsquo;s{" "}
                              <Link
                                href="/forum"
                                className="text-blue-600 hover:underline"
                              >
                                forum
                              </Link>{" "}
                              and giving kudos and feedback to support your
                              fellow collaborators in their projects.
                            </p>
                            <p className="mb-4">
                              Interacting and getting to know other members is
                              gonna be key to your success as a project manager,
                              collaborator, engineer, or session artist. You can
                              get started by letting everyone know that
                              you&lsquo;ve arrived by posting to the{" "}
                              <Link
                                href="/introductions"
                                className="text-blue-600 hover:underline"
                              >
                                introductions
                              </Link>{" "}
                              forum.
                            </p>
                            <p className="mb-4">
                              Remember also to check out the{" "}
                              <Link
                                href="/tutorials"
                                className="text-blue-600 hover:underline"
                              >
                                tutorials
                              </Link>{" "}
                              for an introduction to the main features of the
                              site.
                            </p>
                            <p className="mb-4">
                              Thanks for being here. If you need anything, just{" "}
                              <Link
                                href="/sing"
                                className="text-blue-600 hover:underline"
                              >
                                sing
                              </Link>
                              ! CollabArts Team 😊
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="mb-6 bg-gray-300">
                          <CardHeader>
                            <CardTitle>
                              <span className="mr-2">⚡</span>
                              Activity Status
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p>Nothing to report.</p>
                          </CardContent>
                        </Card>

                        <Card className="bg-gray-300">
                          <CardHeader>
                            <CardTitle>
                              <span className="mr-2">🔔</span>
                              All Recent Notifications
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p>
                              You are viewing all recent notifications. You can{" "}
                              <Link
                                href="/hide-notifications"
                                className="text-blue-600 hover:underline"
                              >
                                hide notifications
                              </Link>{" "}
                              that you have already acknowledged.
                            </p>
                          </CardContent>
                        </Card>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="profile">
              <UserProfileCard />
            </TabsContent>
            <TabsContent value="projects">
              <div className="container mx-auto p-4 space-y-6 flex flex-col gap-4 bg-blue-400">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FolderOpen className="w-6 h-6" />
                      Projects I&apos;m managing
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {projects?.map((project) => {
                      return (
                        <>
                          <p className="mb-4">
                            {user?.username} has started and is currently
                            managing 1 active project.
                          </p>
                          <div className="bg-gray-100 rounded-lg overflow-hidden">
                            <div className="flex items-center justify-between p-4">
                              <div className="flex items-center gap-4">
                                <Disc3 className="w-10 h-10" />
                                <span className="font-bold">
                                  {project?.projectTitle}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <Button className="p-2 bg-gray-200 rounded-full">
                                  <Share2 className="w-5 h-5" />
                                </Button>
                                <Button className="p-2 bg-gray-200 rounded-full">
                                  <DollarSign className="w-5 h-5" />
                                </Button>
                                <Button className="p-2 bg-green-500 rounded-full">
                                  <Mic className="w-5 h-5 text-white" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </>
                      );
                    })}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FolderOpen className="w-6 h-6" />
                      Projects I&apos;m collaborating on
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      You are not currently participating in any project.{" "}
                      <Link href="#" className="text-blue-500 hover:underline">
                        Search
                      </Link>{" "}
                      for active projects and find members looking for your
                      skills and talents.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FolderOpen className="w-6 h-6" />
                      Projects I&apos;m auditioning for
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      You have no pending auditions.{" "}
                      <Link href="#" className="text-blue-500 hover:underline">
                        Search
                      </Link>{" "}
                      for active projects and find members looking for your
                      skills and talents.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="portfolio">
              <Card className="bg-slate-600">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold bg-slate-800 p-2 text-gray-100">
                    Portfolio of Published Works
                  </CardTitle>
                </CardHeader>
                <CardContent className="max-md:ml-[-1rem]">
                  Nothing published yet
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex flex-col gap-8 mb-4">
            <Card className="bg-slate-600">
              <CardHeader>
                <CardTitle className="text-lg text-gray-100 font-semibold bg-slate-800 p-2 max-md:ml-[-1rem]">
                  Work for Hire
                </CardTitle>
              </CardHeader>
              <CardContent className="max-md:ml-[-1.8rem]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contract No.</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Artist</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead className="px-2 py-2">Scope of Work</TableHead>
                      <TableHead className="px-2 py-2">Status</TableHead>
                      <TableHead className="px-2 py-2">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="max-md:ml-[-1.8rem]">
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center max-sm:ml-[-1.8rem]"
                      >
                        Start a project and hire artists to perform your songs
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="bg-slate-600">
              <CardHeader>
                <CardTitle className="text-lg text-gray-100 font-semibold bg-slate-800 p-2 max-md:ml-[-1rem]">
                  Royalty Statement
                </CardTitle>
              </CardHeader>
              <CardContent className="max-md:ml-[-1.8rem]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Ref.</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="px-2 py-2">Scope of Work</TableHead>
                      <TableHead className="px-2 py-2">Status</TableHead>
                      <TableHead className="px-2 py-2">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="max-sm:ml-[-1.8rem]">
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center max-sm:ml-[-1.8rem]"
                      >
                        You have no royalty payments.
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          <BioSection></BioSection>
        </main>
      </section>
      <footer className=" p-4 mt-8 max-sm:ml-[-8rem]">
        <div className="container  mx-auto text-center text-gray-600">
          © 2025 Collabart. Some Rights Reserved.
        </div>
      </footer>
    </>
  );
}
