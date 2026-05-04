import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TechTalks Career Mentor",
  description: "AI-powered guidance to help you grow your tech career.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
