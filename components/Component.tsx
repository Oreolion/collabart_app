import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { InfoIcon } from "lucide-react";
import * as SelectPrimitive from "@radix-ui/react-select";
import React from "react";

// Create a new SelectContent component that uses a portal
const PortalSelectContent = React.forwardRef(
  ({ children, ...props }, forwardedRef) => {
    return (
      <SelectPrimitive.Portal>
        <SelectContent {...props} ref={forwardedRef}>
          {children}
        </SelectContent>
      </SelectPrimitive.Portal>
    );
  }
);
PortalSelectContent.displayName = "PortalSelectContent";



export default function Component() {
  return (
    <>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Song or working title" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select>
              <SelectTrigger id="type">
                <SelectValue placeholder="Public" />
              </SelectTrigger>
              <PortalSelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </PortalSelectContent>
            </Select>
          </div>
        </div>
        <div className="space-x-2">
          <Label>Is this a cover song?</Label>
          <RadioGroup defaultValue="no" className="inline-flex space-x-2">
            <div className="flex items-center space-x-1">
              <RadioGroupItem value="no" id="no" />
              <Label htmlFor="no">No</Label>
            </div>
            <div className="flex items-center space-x-1">
              <RadioGroupItem value="yes" id="yes" />
              <Label htmlFor="yes">Yes</Label>
            </div>
          </RadioGroup>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="invite-only" />
          <Label htmlFor="invite-only">By invite only</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="hide-project" />
          <Label htmlFor="hide-project">Hide this project (secret)</Label>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Project Description</Label>
        <Textarea
          id="description"
          placeholder="This is an Hip Hop beats, that needs lyrics and composition from music artists."
        />
        <p className="text-sm text-gray-500">Max. 400 characters</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="brief">Project Brief</Label>
        <Textarea
          id="brief"
          placeholder="Artist to compose lyrics, melody, hip hop style."
        />
        <p className="text-sm text-gray-500">Max. 10000 characters</p>
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Project Audio Preference</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bit-depth">Bit Depth</Label>
            <Select>
              <SelectTrigger id="bit-depth">
                <SelectValue placeholder="24 bit" />
              </SelectTrigger>
              <PortalSelectContent>
                <SelectItem value="16">16 bit</SelectItem>
                <SelectItem value="24">24 bit</SelectItem>
                <SelectItem value="32">32 bit</SelectItem>
              </PortalSelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sample-rate">Sample Rate</Label>
            <Select>
              <SelectTrigger id="sample-rate">
                <SelectValue placeholder="44.1 kHz" />
              </SelectTrigger>
              <PortalSelectContent>
                <SelectItem value="44.1">44.1 kHz</SelectItem>
                <SelectItem value="48">48 kHz</SelectItem>
                <SelectItem value="96">96 kHz</SelectItem>
              </PortalSelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="audition-privacy">Audition Privacy</Label>
        <Select>
          <SelectTrigger id="audition-privacy">
            <SelectValue placeholder="Keep auditions private (recommended)" />
          </SelectTrigger>
          <PortalSelectContent>
            <SelectItem value="private">
              Keep auditions private (recommended)
            </SelectItem>
            <SelectItem value="public">Make auditions public</SelectItem>
          </PortalSelectContent>
        </Select>
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Collaborator Uploads</h3>
        <p>
          How will members collaborate in this project? Select at least one:
        </p>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="joint-work" />
            <Label htmlFor="joint-work">Joint Work</Label>
          </div>
          <p className="text-sm text-gray-500 ml-6">
            Allow members to audition and contribute as joint-work
            collaborators.
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="work-for-hire" />
            <Label htmlFor="work-for-hire">Work for Hire</Label>
          </div>
          <p className="text-sm text-gray-500 ml-6">
            Allow members to contribute work under contract and in exchange for
            an agreed fee.
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="creative-commons" />
            <Label htmlFor="creative-commons">Creative Commons</Label>
          </div>
          <p className="text-sm text-gray-500 ml-6">
            Allow members to audition and contribute work under a predefined
            Creative Commons license.
          </p>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="collaboration-agreement">
          Select a joint-work collaboration agreement for this project:
        </Label>
        <Select>
          <SelectTrigger id="collaboration-agreement">
            <SelectValue placeholder="Songwriters Agreement" />
          </SelectTrigger>
          <PortalSelectContent>
            <SelectItem value="songwriters">
              <h3 className="text-lg font-semibold">
                Joint Work Collaboration Agreement
              </h3>
              <Card className="bg-gray-50">
                <CardContent className="p-4 text-sm">
                  <p>
                    Standard Songwriter Agreement (project manager version).
                    Version 2. Last updated 24 January, 2016.
                  </p>
                  <p className="mt-2">
                    I&apos;m a songwriter (or I represent a songwriter) and have
                    a song that I would like to produce in collaboration with
                    others. I understand and accept that others may offer to
                    collaborate with me on my song either by submitting an
                    audition for my consideration, or otherwise by accepting an
                    invitation directly from me. Acceptance of any contribution
                    to my project will remain at my sole discretion as the
                    project manager.
                  </p>
                </CardContent>
              </Card>
            </SelectItem>

            <SelectItem value="producers">
              <h3 className="text-lg font-semibold">
                Joint Work Collaboration Agreement
              </h3>

              <p>
                Standard: Fair Shares Agreement (project manager version).
                Version 2. Last updated 24 January, 2016
              </p>
              <p>
                I am starting a new collaboration and intend to share in the
                resulting &apos;songwriting&apos; and &apos;sound
                recording&apos; copyright ownership. The assignment of these
                shares will be at my discretion but will be based on fair and
                unbiased consideration of each collaborator&apos;s individual
                contribution, as well as the time and effort invested into the
                completed song. I understand and accept that others may offer to
                collaborate with me on the song either by submitting an audition
                for my consideration, or otherwise by accepting an invitation
                directly from me. Acceptance of any collaboration on the project
                will remain at my sole discretion as the project manager. As the
                project manager, I understand that collaborators whom I have
                accepted have the right to leave my project at any time prior to
                the song&apos;s completion. In this case, I agree not to use,
                and to remove from my project any sound recording and any
                written music or lyric that has been contributed by the
                collaborator unless otherwise agreed in writing. I understand,
                agree, and accept that after such time that the project is
                completed, all individual contributions used in the writing of
                the song will become joined as inseparable or interdependent
                parts of a unitary whole - which is legal jargon to say that
                songwriters will jointly own &apos;the song&apos;; whilst those
                involved in the production of the song will jointly own the
                sound recording. Prior to the completion of the project,
                collaborators shall retain 100% of the authorship/ownership of
                their original work/contribution. A project is not considered to
                be &apos;complete&apos; until a) the project manager closes the
                project so that no further changes can be made to the song, and
                b) the song&apos;s completion and shares in the song are agreed
                by its collaborators. As an outcome of this collaboration:
                Shares in the copyright of the composition (music and lyrics)
                will be agreed and divided fairly between songwriters; Shares in
                the copyright of the master sound recording will be agreed and
                divided fairly between those involved in the production of the
                recording (e.g. performers and mix engineers). Wherever
                practical, the exact assignment of shares will be agreed as
                early as possible within the project and prior to the project
                being closed. I understand that I am bound by the terms and
                conditions of my membership on ProCollabs which includes a
                commitment to respecting the legal, ethical, and moral rights of
                all members and copyright owners, and in particular, those of my
                collaborators.
              </p>
            </SelectItem>
            <SelectItem value="producers">
              <h3 className="text-lg font-semibold">
                Joint Work Collaboration Agreement
              </h3>

              <p>
                Standard: Equal Shares Agreement (project manager version).
                Version 2. Last updated 24 January, 2016
              </p>
              <p>
                I am starting a new collaboration and intend to share equally in
                the resulting &apos;songwriting&apos; and &apos;master sound
                recording&apos; copyright ownership. I understand and accept
                that others may offer to collaborate with me on the song either
                by submitting an audition for my consideration, or otherwise by
                accepting an invitation directly from me. Acceptance of any
                collaboration on the project will remain at my sole discretion
                as the project manager. As the project manager, I understand
                that collaborators whom I have accepted have the right to leave
                my project at any time prior to the song&apos;s completion. In
                this case, I agree not to use, and to remove from my project any
                sound recording and any written music or lyric that has been
                contributed by the collaborator unless otherwise agreed in
                writing. I understand, agree, and accept that after such time
                that the project is complete, all individual contributions used
                in the song will become joined as inseparable or interdependent
                parts of a unitary whole - which is legal jargon to say: all
                collaborators will jointly own &apos;the song&apos;. Prior to
                the completion of the project, collaborators shall retain 100%
                of the authorship/ownership of their original work/contribution.
                A project is not considered to be &apos;complete&apos; until a)
                the project manager closes the project so that no further
                changes can be made to the song, and b) the song&apos;s
                completion and shares in the song are agreed by its
                collaborators. As an outcome of this collaboration: Shares in
                the copyright of the composition (music and lyrics) will be
                divided equally between all songwriters. Shares in the copyright
                of the master sound recording will be divided equally between
                all recording artists (performers) and audio engineers. I
                understand that I am bound by the terms and conditions of my
                membership on ProCollabs which includes a commitment to
                respecting the legal, ethical, and moral rights of all members
                and copyright owners, and in particular, those of my
                collaborators.
              </p>
            </SelectItem>
            <SelectItem value="producers">
              <h3 className="text-lg font-semibold">
                No Collaboration Agreement
              </h3>{" "}
              {/* Add more agreement text here */}
              <p>
                You are choosing not to have a collaborator agreement in place
                for this project.
              </p>
              <p>
                A collaboration agreement can help to clarify the intentions of
                the project manager and to align expectations of all
                collaborators prior to commiting unwarrented time and effort.
                Having a collaboration agreement in place can also help to avoid
                confusion between collaborators and reduce the risk of disputes
                arising due to uncertainty. Please be aware that without a
                Collaborator Agreement in place, ProCollabs will not be able to
                investigate or provide assistance in the event of project
                related collaboration disputes, should they arise. &apos;Nuff
                said. You will manage this project soley in accordance with
                applicable copyright laws and in accordance with the terms and
                conditions of membership on CollabArt&apos;s, which includes a
                commitment to respecting the legal, ethical, and moral rights of
                all members and copyright owners.
              </p>
            </SelectItem>
            <SelectItem value="custom">
              Customize Agreement
              {/* Add more agreement text here */}
            </SelectItem>
          </PortalSelectContent>
        </Select>
      </div>
      <div className="space-y-2"></div>
      <div className="flex flex-col space-y-4">
        <Button className="w-full bg-green-500 hover:bg-green-600">
          Accept and Start Project
        </Button>
        <Button variant="outline" className="w-full">
          Save as Draft
        </Button>
      </div>
    </>
  );
}
