import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import CustomersTable from "./CustomersTable";
import CreateCustomerForm from "./CreateCustomerForm";

export default async function CustomersPage() {
  const user = await getAuthUser();

  if (!user) {
    return null; // middleware не пустит
  }

  const customers = await prisma.customer.findMany({
    where: { userId: Number(user.id) },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Клиенты</h1>
      <CreateCustomerForm />
      <CustomersTable customers={customers} />
    </div>
  );
}