"use client";

import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Pencil,
  Trash2,
  Award,
  Music,
  Mic,
  Palette,
  Wrench,
  FileText,
  CheckCircle2,
} from "lucide-react";

const CONTRIBUTION_TYPES = [
  { value: "composition", label: "Composition", icon: Music },
  { value: "performance", label: "Performance", icon: Mic },
  { value: "production", label: "Production", icon: Wrench },
  { value: "visual", label: "Visual / Design", icon: Palette },
  { value: "engineering", label: "Engineering", icon: Wrench },
  { value: "lyrics", label: "Lyrics", icon: FileText },
] as const;

const CONTRIBUTION_COLORS: Record<string, string> = {
  composition: "hsl(262, 83%, 58%)",
  performance: "hsl(199, 89%, 48%)",
  production: "hsl(142, 71%, 45%)",
  visual: "hsl(330, 81%, 60%)",
  engineering: "hsl(38, 92%, 50%)",
  lyrics: "hsl(0, 72%, 51%)",
};

interface CreditsManagerProps {
  projectId: Id<"projects">;
}

export default function CreditsManager({ projectId }: CreditsManagerProps) {
  const credits = useQuery(api.credits.getProjectCredits, { projectId });
  const collaborators = useQuery(api.collaborations.getProjectCollaborators, { projectId });
  const addCredit = useMutation(api.credits.addCredit);
  const updateCredit = useMutation(api.credits.updateCredit);
  const removeCredit = useMutation(api.credits.removeCredit);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  // Add form state
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUserName, setSelectedUserName] = useState("");
  const [selectedUserImage, setSelectedUserImage] = useState<string | undefined>();
  const [role, setRole] = useState("");
  const [contributionType, setContributionType] = useState("");
  const [splitPercentage, setSplitPercentage] = useState(0);
  const [notes, setNotes] = useState("");

  // Edit form state
  const [editCreditId, setEditCreditId] = useState<Id<"credits"> | null>(null);
  const [editRole, setEditRole] = useState("");
  const [editContributionType, setEditContributionType] = useState("");
  const [editSplitPercentage, setEditSplitPercentage] = useState(0);
  const [editNotes, setEditNotes] = useState("");

  // Manual user entry state
  const [manualUserName, setManualUserName] = useState("");

  const resetAddForm = () => {
    setSelectedUserId("");
    setSelectedUserName("");
    setSelectedUserImage(undefined);
    setRole("");
    setContributionType("");
    setSplitPercentage(0);
    setNotes("");
    setManualUserName("");
  };

  const handleSelectCollaborator = (value: string) => {
    if (value === "__manual__") {
      setSelectedUserId("");
      setSelectedUserName("");
      setSelectedUserImage(undefined);
      return;
    }
    const collab = collaborators?.find((c) => c.userId === value);
    if (collab) {
      setSelectedUserId(collab.userId ?? "");
      setSelectedUserName(collab.userName);
      setSelectedUserImage(collab.userImage);
    }
  };

  const handleAddCredit = async () => {
    const finalUserName = selectedUserName || manualUserName;
    if (!finalUserName.trim()) {
      alert("Please select a collaborator or enter a name.");
      return;
    }
    if (!role.trim()) {
      alert("Please enter a role.");
      return;
    }
    if (!contributionType) {
      alert("Please select a contribution type.");
      return;
    }

    setBusy(true);
    try {
      await addCredit({
        projectId,
        userId: selectedUserId || `manual_${Date.now()}`,
        userName: finalUserName.trim(),
        userImage: selectedUserImage,
        role: role.trim(),
        contributionType,
        splitPercentage: splitPercentage > 0 ? splitPercentage : undefined,
        notes: notes.trim() || undefined,
      });
      resetAddForm();
      setAddDialogOpen(false);
    } catch (err: any) {
      console.error("Failed to add credit:", err);
      alert("Error: " + err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleOpenEdit = (credit: NonNullable<typeof credits>[number]) => {
    setEditCreditId(credit._id);
    setEditRole(credit.role);
    setEditContributionType(credit.contributionType);
    setEditSplitPercentage(credit.splitPercentage ?? 0);
    setEditNotes(credit.notes ?? "");
    setEditDialogOpen(true);
  };

  const handleUpdateCredit = async () => {
    if (!editCreditId) return;

    setBusy(true);
    try {
      await updateCredit({
        creditId: editCreditId,
        role: editRole.trim() || undefined,
        contributionType: editContributionType || undefined,
        splitPercentage: editSplitPercentage > 0 ? editSplitPercentage : undefined,
        notes: editNotes.trim() || undefined,
      });
      setEditDialogOpen(false);
      setEditCreditId(null);
    } catch (err: any) {
      console.error("Failed to update credit:", err);
      alert("Error: " + err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleRemoveCredit = async (creditId: Id<"credits">) => {
    if (!confirm("Remove this credit?")) return;

    try {
      await removeCredit({ creditId });
    } catch (err: any) {
      console.error("Failed to remove credit:", err);
      alert("Error: " + err.message);
    }
  };

  // Calculate total allocated split
  const totalSplit = credits?.reduce((sum, c) => sum + (c.splitPercentage ?? 0), 0) ?? 0;

  // Build pie chart segments
  const pieSegments = credits
    ?.filter((c) => c.splitPercentage && c.splitPercentage > 0)
    .map((c) => ({
      name: c.userName,
      percentage: c.splitPercentage!,
      color: CONTRIBUTION_COLORS[c.contributionType] ?? "hsl(0, 0%, 50%)",
    })) ?? [];

  // Add unallocated segment if total < 100
  if (totalSplit < 100 && pieSegments.length > 0) {
    pieSegments.push({
      name: "Unallocated",
      percentage: 100 - totalSplit,
      color: "hsl(0, 0%, 25%)",
    });
  }

  const buildConicGradient = () => {
    if (pieSegments.length === 0) return "conic-gradient(hsl(0, 0%, 20%) 0deg 360deg)";
    let currentAngle = 0;
    const stops: string[] = [];
    for (const seg of pieSegments) {
      const angle = (seg.percentage / 100) * 360;
      stops.push(`${seg.color} ${currentAngle}deg ${currentAngle + angle}deg`);
      currentAngle += angle;
    }
    return `conic-gradient(${stops.join(", ")})`;
  };

  return (
    <Card className="glassmorphism rounded-xl border-0">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Credits & Attribution
        </CardTitle>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-xs">
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Credit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md glassmorphism border-0">
            <DialogHeader>
              <DialogTitle>Add Credit</DialogTitle>
              <DialogDescription>
                Credit a collaborator for their contribution to this project.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              {/* User selection */}
              <div>
                <Label>Collaborator</Label>
                {collaborators && collaborators.length > 0 ? (
                  <Select onValueChange={handleSelectCollaborator}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select collaborator" />
                    </SelectTrigger>
                    <SelectContent>
                      {collaborators.map((collab) => (
                        <SelectItem
                          key={collab.userId ?? collab._id}
                          value={collab.userId ?? collab._id}
                        >
                          {collab.userName}
                        </SelectItem>
                      ))}
                      <SelectItem value="__manual__">Enter manually...</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">
                    No collaborators found. Enter a name manually below.
                  </p>
                )}
                {(!collaborators || collaborators.length === 0 || !selectedUserId) && (
                  <Input
                    placeholder="Enter contributor name"
                    className="mt-2"
                    value={manualUserName}
                    onChange={(e) => setManualUserName(e.target.value)}
                  />
                )}
              </div>

              {/* Role */}
              <div>
                <Label htmlFor="credit-role">Role</Label>
                <Input
                  id="credit-role"
                  placeholder="e.g., Lead Vocalist, Mix Engineer"
                  className="mt-2"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>

              {/* Contribution type */}
              <div>
                <Label>Contribution Type</Label>
                <Select value={contributionType} onValueChange={setContributionType}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTRIBUTION_TYPES.map((ct) => (
                      <SelectItem key={ct.value} value={ct.value}>
                        {ct.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Split percentage */}
              <div>
                <Label>Split Percentage: {splitPercentage}%</Label>
                <Slider
                  className="mt-3"
                  value={[splitPercentage]}
                  onValueChange={(val) => setSplitPercentage(val[0])}
                  max={100}
                  step={1}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {totalSplit}% currently allocated ({100 - totalSplit}% remaining)
                </p>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="credit-notes">Notes (optional)</Label>
                <Textarea
                  id="credit-notes"
                  placeholder="Additional details about this contribution..."
                  className="mt-2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                className="text-muted-foreground"
                onClick={() => {
                  resetAddForm();
                  setAddDialogOpen(false);
                }}
                disabled={busy}
              >
                Cancel
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={handleAddCredit}
                disabled={busy}
              >
                {busy ? "Adding..." : "Add Credit"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Pie chart visualization */}
        {credits && credits.length > 0 && (
          <div className="flex flex-col items-center gap-3 mb-4">
            <div
              className="w-28 h-28 rounded-full shadow-lg shadow-primary/10"
              style={{
                background: buildConicGradient(),
              }}
            />
            {/* Legend */}
            <div className="flex flex-wrap gap-2 justify-center">
              {pieSegments.map((seg, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: seg.color }}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {seg.name} ({seg.percentage}%)
                  </span>
                </div>
              ))}
            </div>
            {totalSplit > 100 && (
              <p className="text-xs text-red-400 font-medium">
                Warning: Total split exceeds 100% ({totalSplit}%)
              </p>
            )}
          </div>
        )}

        {/* Credits list */}
        {!credits ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-8 w-8 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-muted rounded w-3/4" />
                  <div className="h-2 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : credits.length === 0 ? (
          <div className="py-4 text-center">
            <Award className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">No credits assigned yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Add credits to acknowledge contributor roles and splits
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {credits.map((credit) => {
              const ctConfig = CONTRIBUTION_TYPES.find((ct) => ct.value === credit.contributionType);
              const Icon = ctConfig?.icon ?? Award;

              return (
                <div
                  key={credit._id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-card/30 border border-border/20 hover:border-border/40 transition-colors"
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={credit.userImage} alt={credit.userName} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {credit.userName[0]?.toUpperCase() ?? "?"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium truncate">{credit.userName}</span>
                      {credit.confirmedByUser && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(var(--success))] shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 gap-1">
                        <Icon className="h-2.5 w-2.5" />
                        {ctConfig?.label ?? credit.contributionType}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{credit.role}</span>
                      {credit.splitPercentage !== undefined && credit.splitPercentage > 0 && (
                        <span className="text-[10px] font-mono text-primary">
                          {credit.splitPercentage}%
                        </span>
                      )}
                    </div>
                    {credit.notes && (
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5 line-clamp-1">
                        {credit.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => handleOpenEdit(credit)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-400 hover:text-red-300"
                      onClick={() => handleRemoveCredit(credit._id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Edit dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md glassmorphism border-0">
          <DialogHeader>
            <DialogTitle>Edit Credit</DialogTitle>
            <DialogDescription>
              Update this credit entry.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="edit-role">Role</Label>
              <Input
                id="edit-role"
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Contribution Type</Label>
              <Select value={editContributionType} onValueChange={setEditContributionType}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {CONTRIBUTION_TYPES.map((ct) => (
                    <SelectItem key={ct.value} value={ct.value}>
                      {ct.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Split Percentage: {editSplitPercentage}%</Label>
              <Slider
                className="mt-3"
                value={[editSplitPercentage]}
                onValueChange={(val) => setEditSplitPercentage(val[0])}
                max={100}
                step={1}
              />
            </div>
            <div>
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="text-muted-foreground"
              onClick={() => setEditDialogOpen(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={handleUpdateCredit}
              disabled={busy}
            >
              {busy ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
