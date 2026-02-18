"use client";

import { useState } from "react";
import { createCustomer } from "./actions";

export default function CreateCustomerForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function action(formData: FormData) {
    setError(null);
    setLoading(true);

    try {
      await createCustomer(formData);
      (document.getElementById("customer-form") as HTMLFormElement).reset();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      id="customer-form"
      action={action}
      className="bg-black p-6 rounded-xl shadow mb-6 space-y-4 max-w-md"
    >
      <h2 className="text-lg font-semibold">Новый клиент</h2>

      <input
        name="name"
        placeholder="Имя"
        required
        className="w-full border rounded px-3 py-2"
      />

      <input
        name="email"
        placeholder="Email"
        type="email"
        className="w-full border rounded px-3 py-2"
      />

      <input
        name="phone"
        placeholder="Телефон"
        className="w-full border rounded px-3 py-2"
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? "Сохранение..." : "Добавить"}
      </button>
    </form>
  );
}