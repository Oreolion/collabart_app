import DashboardLayout from "@/components/DashboardLayout";
import ProjectPlayer from "@/components/ProjectPlayer";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <main className="relative h-screen w-full">
     <DashboardLayout>
        {children}
     </DashboardLayout>
     <div className="sticky bottom-[-2rem] left-0 right-0">

     <ProjectPlayer />
     </div>
    </main>
  );
}
