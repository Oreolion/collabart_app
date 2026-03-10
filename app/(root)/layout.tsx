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
     <div className="sticky bottom-0 left-0 right-0 z-50">
       <ProjectPlayer />
     </div>
    </main>
  );
}
