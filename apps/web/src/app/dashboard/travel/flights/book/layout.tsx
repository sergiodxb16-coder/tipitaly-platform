import { Suspense } from "react";

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return <Suspense>{children}</Suspense>;
}
