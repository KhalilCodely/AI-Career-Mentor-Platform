import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="min-w-0 flex-1">
        <Header />

        <main className="p-4 pb-28 md:p-6 md:pb-6">{children}</main>
      </div>
    </div>
  );
}
