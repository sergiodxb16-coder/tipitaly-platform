import { Metadata } from "next";
import { PartnerDiscovery } from "./partner-discovery";

export const metadata: Metadata = { title: "Partner — TipItaly Card" };

export default function PartnerPage() {
  return <PartnerDiscovery />;
}
