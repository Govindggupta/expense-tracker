/*
  Warnings:

  - The `type` column on the `Expense` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `currency` on the `Wallet` table. All the data in the column will be lost.
  - Made the column `userId` on table `Category` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "TYPE" AS ENUM ('EXPENSE', 'INCOME');

-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_userId_fkey";

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "type" "TYPE" NOT NULL DEFAULT 'EXPENSE',
ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "type",
ADD COLUMN     "type" "TYPE" NOT NULL DEFAULT 'EXPENSE';

-- AlterTable
ALTER TABLE "Wallet" DROP COLUMN "currency";

-- DropEnum
DROP TYPE "ExpenseType";

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("clerk_id") ON DELETE RESTRICT ON UPDATE CASCADE;
