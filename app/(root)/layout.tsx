import DashboardLayout from "@/components/DashboardLayout";


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
    </main>
  );
}
