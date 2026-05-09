import { Suspense } from "react";

export default function AcquistaLayout({ children }: { children: React.ReactNode }) {
  return <Suspense>{children}</Suspense>;
}
