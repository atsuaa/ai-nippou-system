import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

// docs/test.md 2章「テスト用マスタデータ」(STAFF-1〜5, CUST-1〜2, REPORT-1)を投入する。
async function main() {
  const suzuki = await prisma.salesStaff.create({
    data: {
      name: "鈴木一郎",
      email: "suzuki@example.com",
      role: "上長",
    },
  });

  const sato = await prisma.salesStaff.create({
    data: {
      name: "佐藤太郎",
      email: "sato@example.com",
      role: "営業担当者",
      managerId: suzuki.staffId,
    },
  });

  const tanaka = await prisma.salesStaff.create({
    data: {
      name: "田中花子",
      email: "tanaka@example.com",
      role: "営業担当者",
      managerId: suzuki.staffId,
    },
  });

  await prisma.salesStaff.create({
    data: {
      name: "山本二郎",
      email: "yamamoto@example.com",
      role: "上長",
    },
  });

  await prisma.salesStaff.create({
    data: {
      name: "高橋三郎",
      email: "takahashi@example.com",
      role: "管理者",
    },
  });

  const sampleCorp = await prisma.customer.create({
    data: {
      customerName: "株式会社サンプル",
      primaryStaffId: sato.staffId,
    },
  });

  const testCorp = await prisma.customer.create({
    data: {
      customerName: "テスト商事株式会社",
      primaryStaffId: tanaka.staffId,
    },
  });

  await prisma.dailyReport.create({
    data: {
      staffId: sato.staffId,
      reportDate: new Date("2026-08-14"),
      problem: "株式会社サンプルの見積もりが競合と価格差で止まっている。値引き判断の相談をしたい。",
      plan: "明日はテスト商事株式会社に見積書を送付する。",
      visitRecords: {
        create: [
          {
            customerId: sampleCorp.customerId,
            visitTime: "10:00",
            visitContent: "新製品の提案。見積もり依頼を受領。",
          },
          {
            customerId: testCorp.customerId,
            visitTime: "14:00",
            visitContent: "定期フォロー。次回訪問は来月。",
          },
        ],
      },
    },
  });

  console.log("シードデータの投入が完了しました。");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
