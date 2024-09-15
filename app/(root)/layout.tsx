import DashboardNav from "@/components/DashboardNav";
import MobileDashBoardNav from "@/components/MobileDashBoardNav";
import { Toaster } from "@/components/ui/toaster";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="relative h-screen w-full">
      <DashboardNav></DashboardNav>
      <MobileDashBoardNav></MobileDashBoardNav>

      {children}
      <Toaster />
    </main>
  );
}
