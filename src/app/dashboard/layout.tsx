"use client";

import { useSession, signOut } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useState } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(true);


  if (status === "loading") {
    return <p className="p-4">Загрузка...</p>;
  }

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="flex min-h-screen">

      {/* SIDEBAR */}
      <aside
        className={`bg-gray-900 text-white transition-all duration-300 ${
          open ? "w-64" : "w-20"
        }`}
      >
         {/* AVATAR + name/email */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-700">
          <img
            src={session?.user?.avatarUrl || "/default-avatar.png"}
            className="w-12 h-12 rounded-full object-cover border border-gray-600"
            alt="avatar"
          />

          {open && (
            <div className="text-white">
              <p className="font-semibold">{session?.user?.name}</p>
              <p className="text-sm text-gray-400">{session?.user?.email}</p>
            </div>
          )}
        </div>
        {/* Верхняя часть */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <span className={`font-bold text-lg ${!open && "hidden"}`}>
            Dashboard
          </span>
          <button
            onClick={() => setOpen(!open)}
            className="text-gray-300 hover:text-white"
          >
            {open ? "←" : "→"}
          </button>
        </div>

        {/* Навигация */}
        <nav className="flex flex-col gap-2 p-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="px-3 py-2 rounded hover:bg-gray-700 text-left"
          >
            📊 {open && "Главная"}
          </button>

          <button
            onClick={() => router.push("/dashboard/profile")}
            className="px-3 py-2 rounded hover:bg-gray-700 text-left"
          >
            👤 {open && "Профиль"}
          </button>

          <button
            onClick={() => router.push("/dashboard/settings")}
            className="px-3 py-2 rounded hover:bg-gray-700 text-left"
          >
            ⚙️ {open && "Настройки"}
          </button>

          {session?.user?.role === "ADMIN" && (
            <button
              onClick={() => router.push("/dashboard/admin/users")}
              className="px-3 py-2 rounded hover:bg-gray-700 text-left text-red-400"
            >
              🛠️ {open && "Админ-панель"}
            </button>
          )}
        </nav>

        {/* Кнопка выхода */}
        <div className="absolute bottom-4 w-full px-4">
          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className=" px-3 py-2 bg-red-600 hover:bg-red-700 rounded"
          >
            {open ? "Выйти" : "🚪"}
          </button>
        </div>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 bg-gray-100 p-6">{children}</main>
    </div>
  );
}