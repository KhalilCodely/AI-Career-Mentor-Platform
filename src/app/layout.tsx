import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://careers.techtalks.ai"),
  title: {
    default: "CareerMentorAI | AI Career Roadmaps for Tech Learners",
    template: "%s | CareerMentorAI",
  },
  description:
    "Turn your skills, resume, and goals into a personalized AI career roadmap with progress tracking and interview-ready next steps.",
  openGraph: {
    title: "CareerMentorAI | AI Career Roadmaps for Tech Learners",
    description:
      "A product-ready AI mentor for career roadmaps, resume feedback, skill tracking, and interview preparation.",
    url: "/",
    siteName: "CareerMentorAI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CareerMentorAI | AI Career Roadmaps for Tech Learners",
    description:
      "Personalized AI career planning, resume feedback, and skill progress tracking for tech job seekers.",
  },
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
