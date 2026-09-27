-- CreateTable
CREATE TABLE "sales_staff" (
    "staff_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "manager_id" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "sales_staff_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "sales_staff" ("staff_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "customer" (
    "customer_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customer_name" TEXT NOT NULL,
    "industry" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "primary_staff_id" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "customer_primary_staff_id_fkey" FOREIGN KEY ("primary_staff_id") REFERENCES "sales_staff" ("staff_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "daily_report" (
    "report_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "staff_id" INTEGER NOT NULL,
    "report_date" DATETIME NOT NULL,
    "problem" TEXT,
    "plan" TEXT,
    "status" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "daily_report_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "sales_staff" ("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "visit_record" (
    "visit_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "report_id" INTEGER NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "visit_time" TEXT,
    "visit_content" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "visit_record_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "daily_report" ("report_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "visit_record_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer" ("customer_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "comment" (
    "comment_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "report_id" INTEGER NOT NULL,
    "staff_id" INTEGER NOT NULL,
    "comment_content" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "comment_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "daily_report" ("report_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "comment_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "sales_staff" ("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "sales_staff_email_key" ON "sales_staff"("email");

-- CreateIndex
CREATE UNIQUE INDEX "daily_report_staff_id_report_date_key" ON "daily_report"("staff_id", "report_date");
