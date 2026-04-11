import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TechTalks Career Mentor",
  description: "Career mentoring platform for TechTalks Group D",
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
