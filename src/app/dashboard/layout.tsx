import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">

      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 bg-gray-100 min-h-screen">

        <Header />

        <div className="p-6">
          {children}
        </div>

      </div>
    </div>
  );
}