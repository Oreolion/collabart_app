"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"; 
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRight,
  AlertTriangle,
  Settings,
  FileText,
  Mic,
  Users,
  DollarSign,
  CheckCircle2,
} from "lucide-react";
import { ProjectProps } from "@/types";
import { useRouter } from "next/navigation";

/* Props expected in parent: project, projectId */
export default function ProjectActionsAndMeta({
  project,
}: {
  project: ProjectProps;
}) {
  const { user, isLoaded } = useUser();
  const [openModals, setOpenModals] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [listingModalOpen, setListingModalOpen] = useState(false);
  const [listingPrice, setListingPrice] = useState("");
  const listProjectForSale = useMutation(api.projects.listProjectForSale);
  const router = useRouter();

  const createPublicLink = useMutation(
    api.projects.createBlockradarPaymentLinkPublic
  );

  const isOwner =
    isLoaded && user?.id && String(user.id) === String(project?.authorId);

  const toggleModal = (name: string) => {
    setOpenModals((s) => ({ ...s, [name]: !s[name] }));
  };

  const handleListForSale = async () => {
    if (
      !listingPrice ||
      !/^\d+(\.\d+)?$/.test(listingPrice) ||
      Number(listingPrice) <= 0
    ) {
      alert("Enter a valid price (number > 0).");
      return;
    }

    try {
      setBusy(true);
      await listProjectForSale({
        projectId: project._id,
        price: String(listingPrice),
        currency: "USD",
      });

      // refresh data after listing
      router.refresh();
      setListingModalOpen(false);
      setListingPrice("");
    } catch (err) {
      console.error("list for sale error", err);
      alert("Failed to list project for sale.");
    } finally {
      setBusy(false);
    }
  };

  const handleBuyClick = async () => {
    try {
      const amount = project.price ? String(project.price) : undefined; // or ask buyer to enter amount
      const result = await createPublicLink({
        projectId: project._id,
        amount, // required by improved mutation if project.price missing
        redirectUrl: `${window.location.origin}/project/${project._id}?paid=1`,
      });
      // result.payload.data.url might be present (see mutation return shape)
      const url =
        result?.payload?.data?.url ?? result?.payload?.data?.data?.url ?? null;
      if (!url) throw new Error("No url returned");
      window.location.href = url;
    } catch (err) {
      console.error("create link error", err);
      alert("Failed to create payment link: " + (err.message || String(err)));
    }
  };

  return (
    <div>
      {/* Tabs for talent / genre / mood */}
      <Tabs defaultValue="talent" className="mt-4">
        <TabsList className="grid w-full gap-2 grid-cols-3">
          <TabsTrigger value="talent" className="text-xs">
            Talent
          </TabsTrigger>
          <TabsTrigger value="genre" className="text-xs">
            Genre
          </TabsTrigger>
          <TabsTrigger value="mood" className="text-xs">
            Mood
          </TabsTrigger>
        </TabsList>

        {/* Talent */}
        <TabsContent value="talent">
          {project?.talents && project.talents.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {project.talents.map((t: string) => (
                <Badge key={t} className="text-xs">
                  {t}
                </Badge>
              ))}
            </div>
          ) : // None set -> owner -> edit; non-owner -> suggest
          isOwner ? (
            <Link href={`/project/${project._id}/edit`}>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-slate-100 flex items-center gap-1 w-fit"
              >
                None set <ArrowRight className="w-3 h-3" />
              </Badge>
            </Link>
          ) : (
            <Link href={`/project/${project?._id}/suggest`}>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-slate-100 flex items-center gap-1 w-fit"
              >
                None set <ArrowRight className="w-3 h-3" />
              </Badge>
            </Link>
          )}
        </TabsContent>

        {/* Genre */}
        <TabsContent value="genre">
          {project?.genres && project.genres.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {project.genres.map((g: string) => (
                <Badge key={g} className="text-xs">
                  {g}
                </Badge>
              ))}
            </div>
          ) : isOwner ? (
            <Link href={`/project/${project._id}/edit`}>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-slate-100 flex items-center gap-1 w-fit"
              >
                None set <ArrowRight className="w-3 h-3" />
              </Badge>
            </Link>
          ) : (
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-slate-100 flex items-center gap-1 w-fit"
            >
              None set <ArrowRight className="w-3 h-3" />
            </Badge>
          )}
        </TabsContent>

        {/* Mood */}
        <TabsContent value="mood">
          {project?.mood && project.mood.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {project.mood.map((m: string) => (
                <Badge key={m} className="text-xs">
                  {m}
                </Badge>
              ))}
            </div>
          ) : isOwner ? (
            <Link href={`/project/${project._id}/edit`}>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-slate-100 flex items-center gap-1 w-fit"
              >
                None set <ArrowRight className="w-3 h-3" />
              </Badge>
            </Link>
          ) : (
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-slate-100 flex items-center gap-1 w-fit"
            >
              None set <ArrowRight className="w-3 h-3" />
            </Badge>
          )}
        </TabsContent>
      </Tabs>

      {/* Buy button (visible to everyone) */}
      <div className="mt-4">
        <Button onClick={handleBuyClick} className="w-full" disabled={busy}>
          {busy ? "Processing..." : "Buy / Support Project"}
        </Button>
      </div>

      {/* Owner-only controls: only render if isOwner === true */}
      {isOwner && (
        <div className="space-y-2 mt-4">
          {/* Close Project dialog */}
          <Dialog
            open={!!openModals.closeProject}
            onOpenChange={() => toggleModal("closeProject")}
          >
            <DialogTrigger asChild>
              <Button variant="destructive" className="w-full text-xs">
                <AlertTriangle className="w-4 h-4 mr-1" />
                Close Project
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-400">
              <DialogHeader>
                <DialogTitle>Close Project</DialogTitle>
                <DialogDescription>
                  Are you sure you want to close this project? This action
                  cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="close-reason">Reason for closing</Label>
                <Textarea
                  id="close-reason"
                  placeholder="Tell us why you're closing this project..."
                  className="mt-2"
                />
              </div>
              <DialogFooter>
                <Button
                  className="text-gray-500"
                  variant="outline"
                  onClick={() => toggleModal("closeProject")}
                >
                  Cancel
                </Button>
                <Button variant="destructive">Close Project</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Settings */}
          <Dialog
            open={!!openModals.projectSettings}
            onOpenChange={() => toggleModal("projectSettings")}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full bg-transparent text-xs"
              >
                <Settings className="w-4 h-4 mr-1" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-slate-400">
              <DialogHeader>
                <DialogTitle>Project Settings</DialogTitle>
                <DialogDescription>
                  Configure your project preferences.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div>
                  <Label htmlFor="visibility">Visibility</Label>
                  <Select>
                    <SelectTrigger id="visibility" className="mt-2">
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="unlisted">Unlisted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="comments">Comments</Label>
                  <Select>
                    <SelectTrigger id="comments" className="mt-2">
                      <SelectValue placeholder="Who can comment?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="everyone">Everyone</SelectItem>
                      <SelectItem value="collaborators">
                        Collaborators Only
                      </SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="invites">Invite Type</Label>
                  <Select>
                    <SelectTrigger id="invites" className="mt-2">
                      <SelectValue placeholder="Who can join?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open to All</SelectItem>
                      <SelectItem value="invite-only">Invite Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  className="text-gray-500"
                  variant="outline"
                  onClick={() => toggleModal("projectSettings")}
                >
                  Cancel
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Save Settings
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Project Files */}
          <Dialog
            open={!!openModals.fileManagement}
            onOpenChange={() => toggleModal("fileManagement")}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full bg-transparent text-xs"
              >
                <FileText className="w-4 h-4 mr-1" />
                Project Files
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-slate-400">
              <DialogHeader>
                <DialogTitle>File Management</DialogTitle>
                <DialogDescription>
                  Upload and manage project files.
                </DialogDescription>
              </DialogHeader>
              <div className="py-6 space-y-4">
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 flex flex-col items-center justify-center">
                  <p className="text-sm font-medium">
                    Drag and drop files here
                  </p>
                  <p className="text-xs text-muted-foreground">
                    or click to browse
                  </p>
                </div>
                <div>
                  <Label>File Type</Label>
                  <Input
                    placeholder="e.g., Audio Track, Document, etc."
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe this file..."
                    className="mt-2"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  className="text-gray-500"
                  variant="outline"
                  onClick={() => toggleModal("fileManagement")}
                >
                  Cancel
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Upload Files
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Audition */}
          <Dialog
            open={!!openModals.audition}
            onOpenChange={() => toggleModal("audition")}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full text-purple-600 bg-transparent text-xs"
              >
                <Mic className="w-4 h-4 mr-1" />
                List for Audition
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-slate-400">
              <DialogHeader>
                <DialogTitle>Open for Audition</DialogTitle>
                <DialogDescription>
                  Set specific talent requirements for auditions.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div>
                  <Label htmlFor="audition-talent">Required Talent</Label>
                  <Input
                    id="audition-talent"
                    placeholder="e.g., Lead Vocals, Guitar"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="audition-brief">Audition Brief</Label>
                  <Textarea
                    id="audition-brief"
                    placeholder="Describe what you're looking for..."
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="audition-deadline">Deadline</Label>
                  <Input id="audition-deadline" type="date" className="mt-2" />
                </div>
              </div>
              <DialogFooter>
                <Button
                  className="text-gray-500"
                  variant="outline"
                  onClick={() => toggleModal("audition")}
                >
                  Cancel
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Open
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Collaboration Invite */}
          <Dialog
            open={!!openModals.collaboration}
            onOpenChange={() => toggleModal("collaboration")}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full text-blue-600 bg-transparent text-xs"
              >
                <Users className="w-4 h-4 mr-1" />
                Send Invite
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-slate-400">
              <DialogHeader>
                <DialogTitle>Send Collaboration Invite</DialogTitle>
                <DialogDescription>
                  Invite collaborators to join your project.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div>
                  <Label htmlFor="collaborator-email">Email</Label>
                  <Input
                    id="collaborator-email"
                    type="email"
                    placeholder="collaborator@example.com"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select>
                    <SelectTrigger id="role" className="mt-2">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="producer">Producer</SelectItem>
                      <SelectItem value="vocalist">Vocalist</SelectItem>
                      <SelectItem value="guitarist">Guitarist</SelectItem>
                      <SelectItem value="bassist">Bassist</SelectItem>
                      <SelectItem value="drummer">Drummer</SelectItem>
                      <SelectItem value="engineer">Engineer</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="invite-message">Message</Label>
                  <Textarea
                    id="invite-message"
                    placeholder="Add a personal message (optional)..."
                    className="mt-2"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  className="text-gray-500"
                  variant="outline"
                  onClick={() => toggleModal("collaboration")}
                >
                  Cancel
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">Send</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* List for Sell */}
          <Dialog
            open={!!openModals.selling}
            onOpenChange={() => toggleModal("selling")}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full text-green-600 bg-transparent text-xs"
              >
                <DollarSign className="w-4 h-4 mr-1" />
                List for Sell
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-slate-400">
              <DialogHeader>
                <DialogTitle>List for Selling</DialogTitle>
                <DialogDescription>
                  Configure pricing and licensing options.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div>
                  <Label htmlFor="selling-price">Price ($)</Label>
                  <Input
                    id="selling-price"
                    type="number"
                    placeholder="0.00"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="license-type">License Type</Label>
                  <Select>
                    <SelectTrigger id="license-type" className="mt-2">
                      <SelectValue placeholder="Select license type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exclusive">Exclusive</SelectItem>
                      <SelectItem value="non-exclusive">
                        Non-Exclusive
                      </SelectItem>
                      <SelectItem value="lease">Lease</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="terms">Terms & Conditions</Label>
                  <Textarea
                    id="terms"
                    placeholder="Describe the licensing terms..."
                    className="mt-2"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  className="text-gray-500"
                  variant="outline"
                  onClick={() => toggleModal("selling")}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleListForSale}
                >
                  List
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Collaboration Agreement */}
          <Dialog
            open={!!openModals.collaborationAgreement}
            onOpenChange={() => toggleModal("collaborationAgreement")}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full bg-transparent text-xs"
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Collab Agreement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-slate-400">
              <DialogHeader>
                <DialogTitle>Collaboration Agreement</DialogTitle>
                <DialogDescription>
                  Define terms and agreements for collaborators on this project.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div>
                  <Label htmlFor="agreement-type">Agreement Type</Label>
                  <Select>
                    <SelectTrigger id="agreement-type" className="mt-2">
                      <SelectValue placeholder="Select agreement type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="royalty-split">
                        Royalty Split
                      </SelectItem>
                      <SelectItem value="work-for-hire">
                        Work for Hire
                      </SelectItem>
                      <SelectItem value="profit-share">Profit Share</SelectItem>
                      <SelectItem value="fixed-fee">Fixed Fee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="payment-terms">Payment Terms</Label>
                  <Input
                    id="payment-terms"
                    placeholder="e.g., 50/50 split, $500 upfront"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="agreement-terms">Agreement Details</Label>
                  <Textarea
                    id="agreement-terms"
                    placeholder="Describe the full terms and conditions..."
                    className="mt-2"
                    rows={5}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  className="text-gray-500"
                  variant="outline"
                  onClick={() => toggleModal("collaborationAgreement")}
                >
                  Cancel
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Save Agreement
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
