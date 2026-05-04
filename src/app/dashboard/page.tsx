export default function Dashboard() {
  return (
    <div>

      <h1 className="text-2xl font-bold mb-4">
        Welcome to your Dashboard 🚀
      </h1>

      <div className="grid grid-cols-3 gap-4">

        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold">Courses</h2>
          <p className="text-sm text-gray-500">
            Track your learning progress
          </p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold">Skills</h2>
          <p className="text-sm text-gray-500">
            Manage your skills
          </p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold">Profile</h2>
          <p className="text-sm text-gray-500">
            Update your info
          </p>
        </div>

      </div>

    </div>
  );
}