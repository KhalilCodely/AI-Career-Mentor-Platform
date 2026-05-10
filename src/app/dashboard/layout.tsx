import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import Sidebar from "./components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await requireUser();

  if (auth.error) redirect("/login");

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_30%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_100%)]">
      <Sidebar />

      <div className="min-w-0 flex-1">
        <main className="mx-auto w-full max-w-7xl p-4 pb-28 md:p-6 md:pb-8 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
