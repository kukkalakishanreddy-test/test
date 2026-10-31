import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kerala car rentals, vacation and holidays | Taxi & Kerala Tours",
  description:
    "Kerala car rentals, private taxi services, airport transfers and customizable holiday tour packages. Contact us on WhatsApp to plan your trip.",
  keywords: [
    "Kerala tour packages",
    "Kochi airport taxi",
    "Kerala taxi service",
    "Munnar tour",
    "Alleppey houseboat trip"
  ]
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}