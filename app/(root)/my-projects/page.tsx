import dynamic from "next/dynamic";
import React from "react";

const MyProjectsClient = dynamic(
  () => import("@/components/MyProjectsClient"),
  { ssr: false }
);

export default function MyProjectsPage() {
return <MyProjectsClient />;
}
