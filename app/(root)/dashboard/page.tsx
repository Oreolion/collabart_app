import Dashboard from "@/components/Dashboard";
import BioSection from "@/components/BioSection";
import Table from "@/components/Table";

export default function Home() {
  // Example data for the tables
  const projectsData = [
    {
      contractNo: "001",
      date: "2024-09-17",
      artist: "remyoreo",
      project: "Songwriting",
      scopeOfWork: "Write lyrics",
      status: "Open",
      amount: "$200",
    },
  ];

  return (
    <section className="min-h-screen ">
      <Dashboard />
      {/* 
        <section className="mt-6 sm:mt-8">
          <BioSection />
        </section> */}
    </section>
  );
}
