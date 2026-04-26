import { getPrismaClient } from "../src/db/prisma.js";
import { hashPassword } from "../src/auth/password.js";

const roles = [
  { name: "Admin", description: "Full system access" },
  { name: "Manager", description: "Management and reporting access" },
  { name: "Service Advisor", description: "Customer workflow and RO access" },
  { name: "Inventory Control", description: "Parts, inventory, suppliers, and PO access" },
];

const permissions = [
  { key: "settings.view", label: "View settings" },
  { key: "roles.manage", label: "Manage roles" },
  { key: "finance.summary", label: "View finance summaries" },
  { key: "inventory.manage", label: "Manage inventory" },
  { key: "supplier.manage", label: "Manage suppliers" },
  { key: "audit.view", label: "View audit logs" },
];

async function seedRolesAndPermissions(client: Record<string, any>) {
  for (const role of roles) {
    await client.role?.upsert?.({
      where: { name: role.name },
      update: role,
      create: role,
    });
  }

  for (const permission of permissions) {
    await client.permission?.upsert?.({
      where: { key: permission.key },
      update: permission,
      create: permission,
    });
  }
}

async function seedDemoCustomer(client: Record<string, any>) {
  const customer = await client.customer?.upsert?.({
    where: { localId: "seed_customer_demo" },
    update: { customerName: "Demo Customer", phone: "000-000-0000" },
    create: { localId: "seed_customer_demo", customerName: "Demo Customer", phone: "000-000-0000" },
  });

  if (customer?.id) {
    await client.vehicle?.upsert?.({
      where: { localId: "seed_vehicle_demo" },
      update: { customerId: customer.id, plateNumber: "DEMO-001", make: "Toyota", model: "Vios", year: "2024" },
      create: { localId: "seed_vehicle_demo", customerId: customer.id, plateNumber: "DEMO-001", make: "Toyota", model: "Vios", year: "2024" },
    });
  }
}

async function seedDemoAdmin(client: Record<string, any>) {
  const adminRole = await client.role?.findUnique?.({ where: { name: "Admin" } });
  await client.user?.upsert?.({
    where: { username: "admin" },
    update: {
      fullName: "Demo Admin",
      email: "admin@example.local",
      roleName: "Admin",
      roleId: adminRole?.id,
      status: "Active",
      active: true,
      failedLoginCount: 0,
    },
    create: {
      localId: "seed_user_admin",
      username: "admin",
      email: "admin@example.local",
      fullName: "Demo Admin",
      passwordHash: await hashPassword("admin123"),
      roleName: "Admin",
      roleId: adminRole?.id,
      status: "Active",
      active: true,
      failedLoginCount: 0,
    },
  });
}

async function main() {
  const client = await getPrismaClient();
  if (!client) {
    console.log("DVI seed skipped: Prisma client is unavailable.");
    return;
  }

  await seedRolesAndPermissions(client as Record<string, any>);
  await seedDemoAdmin(client as Record<string, any>);
  await seedDemoCustomer(client as Record<string, any>);
  console.log("DVI seed draft completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    const client = await getPrismaClient();
    await client?.$disconnect();
  });
