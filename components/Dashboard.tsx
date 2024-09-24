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

export default function Dashboard() {
  return (
    <>
      <section className={styles.dashboard__feeds}>
        <main className={styles.dashboard__content}>
          <div className="mb-5 text-center bg-slate-900 py-4 rounded-tl-3xl rounded-tr-3xl">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              <AvatarImage src="/assets/icons/avatar.svg" alt="remyoreo" />
              <AvatarFallback>RO</AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold">remyoreo</h2>
            <p className="text-gray-600">
              I am an Afrobeats and HipHop Artist & Songwriter
            </p>
          </div>

          <Tabs defaultValue="dashboard" className="mb-8">
            <TabsList className="h-10 grid gap-4 grid-cols-3 md:grid-cols-6">
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
                Tip Jar
              </TabsTrigger>
            </TabsList>
            <TabsContent value="dashboard">
              <Card className="bg-slate-600">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold bg-slate-800 p-2">
                    Member Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible>
                    <AccordionItem className="mb-4" value="getting-started">
                      <AccordionTrigger>Getting Started</AccordionTrigger>
                      <AccordionContent>
                        <h3 className="font-bold mb-2">Free Membership Plan</h3>
                        <p>
                          Welcome, remyoreo! Your free membership plan has been
                          activated allowing you access to many of the community
                          and collaboration features of the site for free.
                        </p>
                        <p>
                          With the free membership plan you will be able to
                          start and manage a project, collaborate with others,
                          and publish and sell your music in our Music Library,
                          and you can also get involved with our community in
                          the forums, discussions and by supporting others with
                          their projects. If at any time you need more space, or
                          want to run more concurrent projects, then you can
                          easily upgrade your account at any time to one of our
                          premium membership plans or purchase addons (such as
                          more space) to best suit your needs. To upgrade or
                          purchase addons for your current membership plan, go
                          to your membership account page. If you have any
                          questions or need help, please don&apos;t hesitate to
                          contact us at anytime. Upgrade now
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="profile-setup">
                      <AccordionTrigger>
                        Setting Up Your Profile
                      </AccordionTrigger>
                      <AccordionContent>
                        <p>
                          Just a couple of things to get done on your profile so
                          that you can make the most of your time here and
                          interact more effectively with other members in the
                          community and on projects.
                        </p>
                        <p>
                          You can adjust these and other settings for your
                          account and profile at any time by clicking the Edit
                          Profile button. Once your account has been setup, this
                          entire section will disapear.
                        </p>
                        <h4> What styles of music do you love the most?</h4>
                        <p>
                          Obviously, most of us will have preferences about the
                          style and genre of music that we enjoy the most, so
                          why not identify with a couple of your preferences so
                          that others can associate with you when looking for
                          project partners. <strong>Set this up</strong>
                        </p>
                        <p>
                          <h5>What next..?</h5>
                          Check out the active projects section for members
                          looking for your unique musical talents and upload an
                          audition to their project. You&apos;ll also want to
                          get involved in the community by posting to the
                          member&apos;s forum and giving kudos and feedback to
                          support your fellow collaborators in their projects.
                          Interacting and getting to know other members is gonna
                          be key to your success as a project manager,
                          collaborator, engineer, or session artist. You can get
                          started by letting everyone know that you&apos;ve
                          arrived by posting to the introductions forum.
                          Remember also to check out the tutorials for an
                          introduction to the main features of the site. Thanks
                          for being here. If you need anything, just sing! The
                          ProCollabs Team
                        </p>
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
                    <p className="mb-4">
                      remyoreo has started and is currently managing 1 active
                      project.
                    </p>
                    <div className="bg-gray-100 rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                          <Disc3 className="w-10 h-10" />
                          <span className="font-bold">LESSONS</span>
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
                  <CardTitle className="text-lg font-semibold bg-slate-800 p-2">
                    Portfolio of Published Works
                  </CardTitle>
                </CardHeader>
                <CardContent>Nothing published yet</CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex flex-col gap-8 mb-4">
            <Card className="bg-slate-600">
              <CardHeader>
                <CardTitle className="text-lg font-semibold bg-slate-800 p-2">
                  Work for Hire
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contract No.</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Artist</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead className="px-4 py-2">Scope of Work</TableHead>
                      <TableHead className="px-4 py-2">Status</TableHead>
                      <TableHead className="px-4 py-2">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        Start a project and hire artists to perform your songs
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="bg-slate-600">
              <CardHeader>
                <CardTitle className="text-lg font-semibold bg-slate-800 p-2">
                  Royalty Statement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Ref.</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="px-4 py-2">Scope of Work</TableHead>
                      <TableHead className="px-4 py-2">Status</TableHead>
                      <TableHead className="px-4 py-2">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
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
      <footer className=" p-4 mt-8">
        <div className="container mx-auto text-center text-gray-600">
          © 2024 Collabart. Some Rights Reserved.
        </div>
      </footer>
    </>
  );
}
