// src/app/dashboard/admin/users/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

export default function UserEditPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  // useParams доступен в next/navigation только в компонентах клиентской стороны
  // но в app router we can use useParams() from next/navigation
  // however in some Next.js versions you import useParams from next/navigation
  // here we use window.location fallback if undefined
  const params: any = (typeof window !== "undefined" && (router as any).query) || {};
  // Instead use new hook:
  // but safest: parse id from pathname:
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    // Extract id from URL path: /dashboard/admin/users/[id]
    const parts = window.location.pathname.split("/");
    const idStr = parts[parts.length - 1];
    const n = Number(idStr);
    if (!Number.isNaN(n)) setUserId(n);
  }, []);

  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("USER");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && userId !== null) {
      loadUser();
    }
  }, [status, userId]);

  async function loadUser() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error || "Ошибка загрузки");
      } else {
        setUser(data.user);
        setName(data.user.name || "");
        setRole(data.user.role || "USER");
      }
    } catch (e) {
      setErr("Ошибка сети");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);
    setMsg(null);
    setErr(null);

    try {
      const body: any = { name, role };
      if (password) body.password = password;

      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error || "Ошибка при сохранении");
      } else {
        setUser(data.user);
        setMsg("Сохранено");
        setPassword("");
      }
    } catch (e) {
      setErr("Ошибка сети");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!userId) return;
    if (!confirm("Удалить пользователя? Это действие необратимо.")) return;
    setDeleting(true);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error || "Ошибка при удалении");
      } else {
        // После удаления — вернёмся в список
        router.push("/dashboard/admin/users");
      }
    } catch (e) {
      setErr("Ошибка сети");
    } finally {
      setDeleting(false);
    }
  }

  if (status === "loading" || loading) return <p className="p-4">Загрузка...</p>;
  if (!session) return <p className="p-4">Вы не авторизованы</p>;
  if (err) return <p className="p-4 text-red-600">{err}</p>;
  if (!user) return <p className="p-4">Пользователь не найден</p>;

  const cannotEditSelf = session.user?.id === String(user.id);

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Профиль пользователя #{user.id}</h2>

      {msg && <div className="mb-3 text-green-600">{msg}</div>}
      {err && <div className="mb-3 text-red-600">{err}</div>}

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <div className="mt-1 text-gray-600">{user.email}</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Имя</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Роль</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
            disabled={cannotEditSelf} // нельзя менять роль самому себе
          >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          {cannotEditSelf && <p className="text-xs text-gray-500">Нельзя менять свою роль</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Новый пароль (опционально)</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Оставьте пустым, если не менять"
            className="mt-1 block w-full border rounded p-2"
            minLength={6}
          />
          <p className="text-xs text-gray-500 mt-1">Пароль минимум 6 символов</p>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
          >
            {saving ? "Сохранение..." : "Сохранить"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/dashboard/admin/users")}
            className="px-4 py-2 border rounded"
          >
            Назад
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={cannotEditSelf || deleting}
            className="ml-auto px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
          >
            {deleting ? "Удаление..." : "Удалить"}
          </button>
        </div>
      </form>
    </div>
  );
}