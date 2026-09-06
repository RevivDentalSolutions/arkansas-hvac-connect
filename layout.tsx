import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arkansas HVAC Connect | Local HVAC Help",
  description: "Request HVAC repair or replacement help from participating Central Arkansas professionals.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
