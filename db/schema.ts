import {
  boolean,
  date,
  mysqlTable,
  varchar,
  int,
  decimal,
  text,
  AnyMySqlColumn,
} from "drizzle-orm/mysql-core";

export const projects = mysqlTable("projects", {
  id: int({ unsigned: true }).notNull().autoincrement().unique().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  isOngoing: boolean(),
  startDate: date(),
  duration: int(),
  budget: decimal({ mode: "number" }),
  createdBy: int({ unsigned: true }).references(() => users.id),
});

export const users = mysqlTable("users", {
  id: int({ unsigned: true }).notNull().autoincrement().unique().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  role: varchar({ length: 50 }), // e.g. admin, manager, worker
});

export const tasks = mysqlTable("tasks", {
  id: int({ unsigned: true }).notNull().autoincrement().unique().primaryKey(),
  projectId: int({ unsigned: true })
    .notNull()
    .references(() => projects.id),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  startDate: date(),
  duration: int().notNull().default(1),
  status: varchar({ length: 50 }), // e.g. pending, in-progress, done
  budget: decimal({ mode: "number" }),
  amountSpent: decimal({ mode: "number" }),
  parentTaskId: int({ unsigned: true }).references(
    (): AnyMySqlColumn => tasks.id
  ),
});

export const materials = mysqlTable("materials", {
  id: int({ unsigned: true }).notNull().autoincrement().unique().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  price: int().notNull(),
  quantity: int().notNull(),
  unit: varchar({ length: 50 }).notNull(),
  taskId: int({ unsigned: true })
    .notNull()
    .references(() => tasks.id),
  cost: int(),
});
