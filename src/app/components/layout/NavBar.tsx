// src/components/layout/Navbar.tsx
export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full backdrop-blur-md bg-black/30 text-white flex justify-between px-8 py-4 z-50">
      <h1 className="font-bold text-lg">Career Mentor</h1>
      <div className="space-x-4">
        <button>Login</button>
        <button className="bg-blue-600 px-4 py-1 rounded">Sign Up</button>
      </div>
    </nav>
  );
}