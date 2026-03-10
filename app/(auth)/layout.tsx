import Image from "next/image";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="relative h-screen w-full bg-background">
      <div className="absolute inset-0 opacity-20">
        <Image
          src="/images/austin-distel-wD1LRb9OeEo-unsplash.jpg"
          alt="background"
          fill
          className="object-cover"
        ></Image>
      </div>
      <div className="relative z-10 flex h-full items-center justify-center">
        {children}
      </div>
    </main>
  );
}
