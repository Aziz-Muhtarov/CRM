// src/app/dashboard/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type UserData = {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  avatarUrl?: string | null;
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [user, setUser] = useState<UserData | null>(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Добавь функцию
async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0];
  if (!file) return;

  // Ограничение размера, например 3MB
  const maxSize = 3 * 1024 * 1024;
  if (file.size > maxSize) {
    setError("Файл слишком большой (макс 3MB)");
    return;
  }

  setUploading(true);
  setError(null);
  setMsg(null);

  try {
    const formData = new FormData();
    formData.append("avatar", file);

    const res = await fetch("/api/profile/avatar", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Ошибка загрузки");
    } else {
      setUser(data.user);
      setMsg("Аватар обновлён");
    }
  } catch (err) {
    setError("Ошибка сети");
  } finally {
    setUploading(false);
    // очищаем input (опционально)
    e.currentTarget.value = "";
  }
}

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) {
      setAvatar(e.target.files[0]);
    }
  }


  useEffect(() => {
    if (status === "authenticated") {
      loadProfile();
    } else if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  async function loadProfile() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Не удалось загрузить профиль");
      } else {
        setUser(data.user);
        setName(data.user.name || "");
      }
    } catch (e) {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMsg(null);

    if (!name.trim()) {
      setError("Имя не может быть пустым");
      return;
    }

    if (password && password.length < 6) {
      setError("Пароль должен быть минимум 6 символов");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), password: password || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка при сохранении");
      } else {
        setUser(data.user);
        setPassword("");
        setMsg("Профиль успешно обновлён");
      }
    } catch (e) {
      setError("Ошибка сети");
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading" || loading) return <p className="p-4">Загрузка...</p>;
  if (!session) return <p className="p-4">Вы не авторизованы</p>;

  return (
    <div className="max-w-2xl mx-auto bg-white shadow rounded p-6">
      <h2 className="text-2xl font-semibold mb-4">Мой профиль</h2>

      {error && <div className="mb-4 text-red-600">{error}</div>}
      {msg && <div className="mb-4 text-green-600">{msg}</div>}

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <div className="mt-1 text-gray-600">{user?.email}</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Аватар</label>
          <div className="flex items-center gap-4 mt-2">
            <img
              src={user?.avatarUrl || "/default-avatar.png"}
              alt="avatar"
              className="w-20 h-20 rounded-full object-cover border"
            />
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="mt-1"
              />
              {uploading && <p className="text-sm text-gray-500">Загрузка...</p>}
            </div>
          </div>
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
          <label className="block text-sm font-medium text-gray-700">Новый пароль (опционально)</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Оставьте пустым, если не менять"
            className="mt-1 block w-full border rounded p-2"
          />
          <p className="text-xs text-gray-500 mt-1">Пароль минимум 6 символов</p>
        </div>

         <div>
          <label className="block mb-1">Аватар</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
          >
            {saving ? "Сохранение..." : "Сохранить"}
          </button>

          <button
            type="button"
            onClick={() => {
              setName(user?.name || "");
              setPassword("");
              setMsg(null);
              setError(null);
            }}
            className="px-3 py-2 border rounded"
          >
            Сброс
          </button>
        </div>
      </form>
    </div>
  );
}