"use client";

import { useSession } from "next-auth/react";

export default function AdminPage() {
  const { data: session } = useSession();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Админ-панель</h1>
      <p>Добро пожаловать, {session?.user?.name}</p>
      <p>Ваша роль: {session?.user?.role}</p>
    </div>
  );
}