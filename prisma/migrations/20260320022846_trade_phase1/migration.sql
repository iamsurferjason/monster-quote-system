-- CreateEnum
CREATE TYPE "TradeMode" AS ENUM ('DOMESTIC', 'IMPORT', 'EXPORT', 'TRIANGULAR');

-- CreateEnum
CREATE TYPE "Incoterm" AS ENUM ('EXW', 'FOB', 'CFR', 'CIF', 'FCA', 'CPT', 'CIP', 'DAP', 'DDP');

-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('DOMESTIC', 'OVERSEAS', 'DISTRIBUTOR', 'END_CUSTOMER');

-- CreateEnum
CREATE TYPE "LanguageCode" AS ENUM ('ZH_TW', 'EN', 'JA', 'ZH_CN');

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "billingAddress" TEXT,
ADD COLUMN     "countryCode" VARCHAR(2),
ADD COLUMN     "customerType" "CustomerType" NOT NULL DEFAULT 'DOMESTIC',
ADD COLUMN     "incotermDefault" "Incoterm",
ADD COLUMN     "language" "LanguageCode" DEFAULT 'ZH_TW',
ADD COLUMN     "shippingAddress" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "currencyCode" "CurrencyCode" NOT NULL DEFAULT 'TWD',
ADD COLUMN     "dischargePort" TEXT,
ADD COLUMN     "exchangeRate" DECIMAL(12,4) NOT NULL DEFAULT 1,
ADD COLUMN     "incoterm" "Incoterm",
ADD COLUMN     "loadingPort" TEXT,
ADD COLUMN     "paymentTerm" TEXT,
ADD COLUMN     "shipFromCountry" VARCHAR(2),
ADD COLUMN     "shipToCountry" VARCHAR(2),
ADD COLUMN     "tradeMode" "TradeMode" NOT NULL DEFAULT 'DOMESTIC';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "exportDescription" TEXT,
ADD COLUMN     "hsCode" TEXT,
ADD COLUMN     "originCountry" VARCHAR(2);

-- AlterTable
ALTER TABLE "Quotation" ADD COLUMN     "currencyCode" "CurrencyCode" NOT NULL DEFAULT 'TWD',
ADD COLUMN     "dischargePort" TEXT,
ADD COLUMN     "exchangeRate" DECIMAL(12,4) NOT NULL DEFAULT 1,
ADD COLUMN     "incoterm" "Incoterm",
ADD COLUMN     "loadingPort" TEXT,
ADD COLUMN     "paymentTerm" TEXT,
ADD COLUMN     "shipFromCountry" VARCHAR(2),
ADD COLUMN     "shipToCountry" VARCHAR(2),
ADD COLUMN     "tradeMode" "TradeMode" NOT NULL DEFAULT 'DOMESTIC',
ADD COLUMN     "validityDate" TIMESTAMP(3);
