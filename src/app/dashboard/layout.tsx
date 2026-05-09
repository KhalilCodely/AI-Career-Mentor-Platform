import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await requireUser();

  if (auth.error) redirect("/login");

  return (
    <div className="min-h-screen bg-[#f8efcf] bg-[radial-gradient(circle_at_15%_10%,rgba(255,216,107,0.55),transparent_26%),radial-gradient(circle_at_85%_0%,rgba(155,215,255,0.58),transparent_25%),linear-gradient(180deg,#fff8df_0%,#eaf7d7_100%)] text-[#2d2a24]">
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="min-w-0 flex-1">
          <Header />

          <main className="mx-auto max-w-7xl p-4 pb-28 md:p-6 md:pb-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
