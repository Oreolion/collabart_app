import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export default function Dashboard() {
  return (
    <>
      <section className={styles.dashboard__feeds}>
        <main className=''>
          <div className="mb-5 text-center bg-slate-900 py-2">
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
              <Card>
                <CardHeader>
                  <CardTitle>Member Dashboard</CardTitle>
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
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex flex-col gap-8 mb-4">
            <Card>
              <CardHeader>
                <CardTitle>Work for Hire</CardTitle>
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

            <Card>
              <CardHeader>
                <CardTitle>Royalty Statement</CardTitle>
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
