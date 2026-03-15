import Image from "next/image";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="relative h-screen w-full bg-background ambient-bg">
      <div className="absolute inset-0 opacity-15">
        <Image
          src="/images/austin-distel-wD1LRb9OeEo-unsplash.jpg"
          alt="background"
          fill
          className="object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/80" />
      <div className="relative z-10 flex h-full items-center justify-center">
        {children}
      </div>
    </main>
  );
}
