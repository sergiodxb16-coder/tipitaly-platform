import { Suspense } from "react";

export default function HotelDetailLayout({ children }: { children: React.ReactNode }) {
  return <Suspense>{children}</Suspense>;
}
