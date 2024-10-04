import { Card, CardContent, CardHeader } from "@/components/ui/card";

const BioSection = () => {
  return (
    <div className="mt-8 grid grid-cols-1 gap-4 ">
      <Card className="bg-slate-500 ">
        <CardHeader>
          <h3 className="text-lg font-semibold bg-slate-800 p-2 max-md:ml-[-1rem]">Biography</h3>
        </CardHeader>
        <CardContent className="max-md:ml-[-1rem]">
          <p>Musician, Songwriter, Composer, Lyricist, Artist</p>
        </CardContent>
      </Card>
      <Card className="bg-slate-500 ">
        <CardHeader className="max-md:ml-[-1rem]">
          <h3 className="text-lg font-semibold bg-slate-800 p-2">Contact Information</h3>
        </CardHeader>
        <CardContent className="max-md:ml-[-1rem]">
          <p>remyoreo11@gmail.com</p>
        </CardContent>
      </Card>
      <Card className="bg-slate-500 ">
        <CardHeader className="max-md:ml-[-1rem]">
          <h3 className="text-lg font-semibold bg-slate-800 p-2">Recent Activity</h3>
        </CardHeader>
        <CardContent className="max-md:ml-[-1rem]">
          <p>remyoreo just joined ProCollabs - WELCOME!</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BioSection;
