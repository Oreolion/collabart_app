import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface CollaborationAgreementProps {
  onContentChange: (subtitle: string) => void;
}

interface Agreement {
  value: string;
  title: string;
  subtitle: string;
  content: string;
}

const agreements: Agreement[] = [
  {
    value: "songwriters",
    title: "Joint Work Collaboration Agreement",
    subtitle:
      "Standard Songwriter Agreement (project manager version). Version 2. Last updated 24 January, 2016.",
    content:
      "I'm a songwriter (or I represent a songwriter) and have a song that I would like to produce in collaboration with others. I understand and accept that others may offer to collaborate with me on my song either by submitting an audition for my consideration, or otherwise by accepting an invitation directly from me. Acceptance of any contribution to my project will remain at my sole discretion as the project manager.",
  },
  {
    value: "fair-share",
    title: "Joint Work Collaboration Agreement",
    subtitle:
      "Standard: Fair Shares Agreement (project manager version). Version 2. Last updated 24 January, 2016",
    content:
      "I am starting a new collaboration and intend to share in the resulting 'songwriting' and 'sound recording' copyright ownership. The assignment of these shares will be at my discretion but will be based on fair and unbiased consideration of each collaborator's individual contribution, as well as the time and effort invested into the completed song. I understand and accept that others may offer to collaborate with me on the song either by submitting an audition for my consideration, or otherwise by accepting an invitation directly from me. Acceptance of any collaboration on the project will remain at my sole discretion as the project manager. As the project manager, I understand that collaborators whom I have accepted have the right to leave my project at any time prior to the song's completion. In this case, I agree not to use, and to remove from my project any sound recording and any written music or lyric that has been contributed by the collaborator unless otherwise agreed in writing. I understand, agree, and accept that after such time that the project is completed, all individual contributions used in the writing of the song will become joined as inseparable or interdependent parts of a unitary whole - which is legal jargon to say that songwriters will jointly own 'the song'; whilst those involved in the production of the song will jointly own the sound recording. Prior to the completion of the project, collaborators shall retain 100% of the authorship/ownership of their original work/contribution. A project is not considered to be 'complete' until a) the project manager closes the project so that no further changes can be made to the song, and b) the song's completion and shares in the song are agreed by its collaborators. As an outcome of this collaboration: Shares in the copyright of the composition (music and lyrics) will be agreed and divided fairly between songwriters; Shares in the copyright of the master sound recording will be agreed and divided fairly between those involved in the production of the recording (e.g. performers and mix engineers). Wherever practical, the exact assignment of shares will be agreed as early as possible within the project and prior to the project being closed. I understand that I am bound by the terms and conditions of my membership on ProCollabs which includes a commitment to respecting the legal, ethical, and moral rights of all members and copyright owners, and in particular, those of my collaborators.",
  },
  {
    value: "equal-shares",
    title: "Joint Work Collaboration Agreement",
    subtitle:
      "Standard: Equal Shares Agreement (project manager version). Version 2. Last updated 24 January, 2016",
    content:
      "I am starting a new collaboration and intend to share equally in the resulting 'songwriting' and 'master sound recording' copyright ownership. I understand and accept that others may offer to collaborate with me on the song either by submitting an audition for my consideration, or otherwise by accepting an invitation directly from me. Acceptance of any collaboration on the project will remain at my sole discretion as the project manager. As the project manager, I understand that collaborators whom I have accepted have the right to leave my project at any time prior to the song's completion. In this case, I agree not to use, and to remove from my project any sound recording and any written music or lyric that has been contributed by the collaborator unless otherwise agreed in writing. I understand, agree, and accept that after such time that the project is complete, all individual contributions used in the song will become joined as inseparable or interdependent parts of a unitary whole - which is legal jargon to say: all collaborators will jointly own 'the song'. Prior to the completion of the project, collaborators shall retain 100% of the authorship/ownership of their original work/contribution. A project is not considered to be 'complete' until a) the project manager closes the project so that no further changes can be made to the song, and b) the song's completion and shares in the song are agreed by its collaborators. As an outcome of this collaboration: Shares in the copyright of the composition (music and lyrics) will be divided equally between all songwriters. Shares in the copyright of the master sound recording will be divided equally between all recording artists (performers) and audio engineers. I understand that I am bound by the terms and conditions of my membership on ProCollabs which includes a commitment to respecting the legal, ethical, and moral rights of all members and copyright owners, and in particular, those of my collaborators.",
  },
  {
    value: "no-collab",
    title: "No Collaboration Agreement",
    subtitle: "",
    content:
      "You are choosing not to have a collaborator agreement in place for this project. A collaboration agreement can help to clarify the intentions of the project manager and to align expectations of all collaborators prior to commiting unwarrented time and effort. Having a collaboration agreement in place can also help to avoid confusion between collaborators and reduce the risk of disputes arising due to uncertainty. Please be aware that without a Collaborator Agreement in place, ProCollabs will not be able to investigate or provide assistance in the event of project related collaboration disputes, should they arise. 'Nuff said. You will manage this project soley in accordance with applicable copyright laws and in accordance with the terms and conditions of membership on CollabArt's, which includes a commitment to respecting the legal, ethical, and moral rights of all members and copyright owners.",
  },
  {
    value: "custom",
    title: "Customize Agreement",
    subtitle: "",
    content:
      "You have chosen to customize your collaboration agreement. Please provide your custom agreement details.",
  },
];

const CollaborationAgreement: React.FC<CollaborationAgreementProps> = ({
  onContentChange,
}) => {
  const [selectedAgreement, setSelectedAgreement] = useState<string | null>(
    null
  );
  const [customContent, setCustomContent] = useState<string>("");

  // Effect to update projectContent based on selected agreement
  useEffect(() => {
    if (selectedAgreement) {
      const agreement = agreements.find(
        (a) => a.value === selectedAgreement
      );
      if (agreement) {
        if (agreement.value === "custom") {
          // For custom, set projectContent to current customContent
          onContentChange(customContent);
        } else {
          // For predefined agreements, set projectContent to agreement content
          onContentChange(agreement.subtitle);
        }
      }
    } else {
      // If no agreement is selected, clear projectContent
      onContentChange("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAgreement, customContent, onContentChange]);

  const handleSelectChange = (value: string) => {
    setSelectedAgreement(value);
    // If not custom, reset customContent
    if (value !== "custom") {
      setCustomContent("");
    }
  };

  const handleCustomContentChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setCustomContent(e.target.value);
  };

  return (
    <div className="space-y-4">
      <Select
        value={selectedAgreement || undefined}
        onValueChange={handleSelectChange}
      >
        <SelectTrigger id="collaboration-agreement">
          <SelectValue placeholder="Select Collaboration Agreement" />
        </SelectTrigger>
        <SelectContent className="text-16 max-w-[50rem] border-none bg-slate-700 font-bold text-white-1 focus:ring-orange-1 max-h-[30vh] overflow-y-auto">
          <ScrollArea className="h-full overflow-y-auto">
            {agreements.map((agreement) => (
              <SelectItem key={agreement.value} value={agreement.value}>
                {agreement.title}
              </SelectItem>
            ))}
          </ScrollArea>
        </SelectContent>
      </Select>

      {selectedAgreement && (
        <Card className="bg-gray-50">
          <CardContent className="p-4 text-sm">
            <h3 className="text-lg font-semibold mb-2">
              {
                agreements.find((a) => a.value === selectedAgreement)
                  ?.title
              }
            </h3>
            {agreements.find((a) => a.value === selectedAgreement)
              ?.subtitle && (
              <p className="mb-2">
                {
                  agreements.find((a) => a.value === selectedAgreement)
                    ?.subtitle
                }
              </p>
            )}
            <p>
              {agreements.find((a) => a.value === selectedAgreement)
                ?.content}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Render custom content textarea if 'custom' is selected */}
      {selectedAgreement === "custom" && (
        <div className="flex flex-col gap-2.5">
          <Label
            htmlFor="custom-agreement"
            className="text-16 font-bold text-white-1"
          >
            Custom Collaboration Agreement:
          </Label>
          <Textarea
            id="custom-agreement"
            value={customContent}
            onChange={handleCustomContentChange}
            placeholder="Enter your custom collaboration agreement details here..."
            className="input-class focus-visible:ring-offset-orange-1"
            required
          />
        </div>
      )}
    </div>
  );
};

export default CollaborationAgreement;
