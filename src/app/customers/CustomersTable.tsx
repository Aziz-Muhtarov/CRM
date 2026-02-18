"use client";

import { Customer } from "@prisma/client";
import { deleteCustomer, updateCustomer } from "./actions";

type Props = {
  customers: Customer[];
};

export default function CustomersTable({ customers }: Props) {
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
                    const name = prompt("Имя", c.name);
                    if (!name) return;

                    updateCustomer({
                      id: c.id,
                      name,
                      email: c.email || undefined,
                      phone: c.phone || undefined,
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
    </div>
  );
}