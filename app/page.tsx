import type { Metadata } from "next";
import { MarketplacePage } from "@/components/marketplace-page";

export const metadata: Metadata = {
  title: { absolute: "Central Arkansas HVAC Help | Arkansas HVAC Connect" },
  description: "Request a referral for AC repair, heating, heat-pump, or HVAC replacement help in Central Arkansas. Independent homeowner platform—not a contractor.",
  alternates: { canonical: "/" },
};
export default function Home() { return <MarketplacePage path="/" />; }
