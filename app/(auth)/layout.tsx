import Image from "next/image";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="relative h-screen w-full">
      <div className="absolute size-full">
        <Image
          src="/images/austin-distel-wD1LRb9OeEo-unsplash.jpg"
          alt="background"
          fill
          className="size-full"
        ></Image>
      </div>
      {children}
    </main>
  );
}
