"use client";

import { useState } from "react";
import { Customer } from "@prisma/client";
import { deleteCustomer, updateCustomer } from "./actions";

type Props = {
  customers: Customer[];
};

export default function CustomersTable({ customers }: Props) {

  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  if (customers.length === 0) {
    return <p className="text-gray-500">Клиентов пока нет</p>;
  }

async function handleDelete(id: number) {
    if (!confirm("Удалить клиента?")) return;
    await deleteCustomer(id);
  }

  return (
    <div className="bg-black rounded-xl shadow">
      <table className="w-full text-left">
        <thead className="border-b">
          <tr>
            <th className="p-3">Имя</th>
            <th className="p-3">Email</th>
            <th className="p-3">Телефон</th>
            <th className="p-3">Статус</th>
            <th className="p-3 text-right">Действия</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id} className="border-b last:border-none">
              <td className="p-3 font-medium">{c.name}</td>
              <td className="p-3">{c.email || "—"}</td>
              <td className="p-3">{c.phone || "—"}</td>
              <td className="p-3">{c.status}</td>
              <td className="p-3 text-right">
                <button
                  onClick={() => handleDelete(c.id)}
                  className="text-red-500 hover:underline"
                >
                  Удалить
                </button>
              </td>
              <td className="p-3 text-right">
                <button
                  onClick={() => {
                    setEditingCustomer(c);
                    setForm({
                      name: c.name,
                      email: c.email || "",
                      phone: c.phone || "",
                    });
                  }}
                  className="text-blue-500 hover:underline mr-3"
                >
                  Редактировать
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

            {editingCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              Редактировать клиента
            </h2>

            <input
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mb-3"
            />

            <input
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mb-3"
            />

            <input
              defaultValue={editingCustomer.phone || ""}
              id="edit-phone"
              className="w-full border rounded px-3 py-2 mb-3"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingCustomer(null)}
                className="px-3 py-2 bg-gray-300 rounded"
              >
                Отмена
              </button>

              <button
                onClick={async () => {
                  await updateCustomer({
                    id: editingCustomer.id,
                    ...form,
                  });

                  setEditingCustomer(null);
                }}
                className="px-3 py-2 bg-blue-500 text-white rounded"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

