"use client";
import {
  ClerkProvider,
  useAuth,

} from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";
import { useRouter } from "next/navigation";

const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL as string
);

const ConvexClerkProvider = ({ children }: { children: ReactNode }) => (
  <ClerkProvider
    publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY as string}
    appearance={{
      layout: { socialButtonsVariant: "iconButton" },
      variables: {
        colorBackground: "#15171c",
        colorPrimary: "",
        colorText: "white",
        colorInputBackground: "#1b1f29",
        colorInputText: "white",
      },
    }}
  >
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <AuthRedirect>{children}</AuthRedirect>
    </ConvexProviderWithClerk>
  </ClerkProvider>
);

const AuthRedirect = ({ children }: { children: ReactNode }) => {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  if (isSignedIn) {
    router.push("/dashboard");
  }

  return <>{children}</>;
};

export default ConvexClerkProvider;
