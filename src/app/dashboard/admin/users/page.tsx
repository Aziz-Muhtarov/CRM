// src/app/dashboard/admin/users/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      loadUsers();
    }
  }, [status]);

  async function loadUsers() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка загрузки");
      } else {
        setUsers(data.users);
      }
    } catch (e) {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  }

  async function changeRole(userId: number, newRole: string) {
    setSavingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Ошибка при обновлении роли");
      } else {
        setUsers((prev) => prev.map(u => u.id === userId ? data.user : u));
      }
    } catch (e) {
      alert("Ошибка сети");
    } finally {
      setSavingId(null);
    }
  }

  async function deleteUser(userId: number) {
    if (!confirm("Вы действительно хотите удалить этого пользователя?")) return;
    setDeletingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Ошибка при удалении");
      } else {
        setUsers((prev) => prev.filter(u => u.id !== userId));
      }
    } catch (e) {
      alert("Ошибка сети");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) return <p className="p-4">Загрузка...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;
  if (!session) return <p className="p-4">Не авторизованы</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4 text-black">Пользователи</h2>

      <div className="overflow-x-auto bg-white shadow rounded text-black">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Имя</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Роль</th>
              <th className="p-2 border">Создан</th>
              <th className="p-2 border">Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="p-2 border">{u.id}</td>
                <td className="p-2 border">{u.name}</td>
                {/* <td className="p-2 border">{u.email}</td> */}
                <td className="p-2 border">
                    <a className="text-blue-600 hover:underline" href={`/dashboard/admin/users/${u.id}`}>
                        {u.name}
                    </a>
                </td>
                <td className="p-2 border">
                  <select
                    value={u.role}
                    onChange={(e) => changeRole(u.id, e.target.value)}
                    disabled={savingId === u.id || session.user?.id === String(u.id)}
                    className="p-1 border rounded"
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td className="p-2 border">{new Date(u.createdAt).toLocaleString()}</td>
                <td className="p-2 border">
                  <button
                    onClick={() => deleteUser(u.id)}
                    disabled={deletingId === u.id || session.user?.id === String(u.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded disabled:opacity-50"
                    title={session.user?.id === String(u.id) ? "Нельзя удалить себя" : "Удалить"}
                  >
                    {deletingId === u.id ? "Удаление..." : "Удалить"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}