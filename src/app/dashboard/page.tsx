"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <p className="text-center mt-10">Загрузка...</p>;
  }

  if (!session) {
    router.push("/auth/login");
    return null;
  }

  const user = session.user;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-300 text-gray-800 p-6">
      <div className="bg-white shadow-md rounded-2xl p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">
          Добро пожаловать, {user?.name || "Пользователь"}!
        </h1>
        <p className="mb-4 text-gray-600">
          Ваша почта: <span className="font-medium">{user?.email}</span>
        </p>

        {user?.role && (
          <p className="mb-6">
            Роль:{" "}
            <span
              className={`font-semibold ${
                user.role === "ADMIN" ? "text-red-500" : "text-green-600"
              }`}
            >
              {user.role}
            </span>
          </p>
        )}

        <div className="flex justify-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            На главную
          </button>

          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
          >
            Выйти
          </button>
        </div>
      </div>
    </div>
  );
}