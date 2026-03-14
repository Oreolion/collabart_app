import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";
import LoaderSpinner from "./LoaderSpinner";

const BioSection = () => {
    const { user, isLoaded: isUserLoaded } = useUser();

    if (!isUserLoaded) return <LoaderSpinner></LoaderSpinner>
  return (
    <div className="mt-8 grid grid-cols-1 gap-4">
      <Card className="bg-card border-border">
        <CardHeader>
          <h3 className="text-lg font-semibold text-foreground bg-muted/50 p-2 rounded-md">Biography</h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Musician, Songwriter, Composer, Lyricist, Artist</p>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardHeader>
          <h3 className="text-lg font-semibold text-foreground bg-muted/50 p-2 rounded-md">Contact Information</h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{user?.emailAddresses[0].emailAddress}</p>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardHeader>
          <h3 className="text-lg font-semibold text-foreground bg-muted/50 p-2 rounded-md">Recent Activity</h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{user?.username} just joined eCollabs - WELCOME!</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BioSection;
