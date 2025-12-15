// app/auth/login/page.tsx
"use client";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (session) {
      router.push("/dashboard"); // уже авторизован → перекидываем
    }
  }, [session, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (res?.error) setError(res.error);
    else router.push("/dashboard");
  };

  return (
    <div>
      <h2>Вход</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Введите email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br />
        <input
          type="password"
          placeholder="Введите пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">Войти</button>
      </form>
    </div>
  );
}