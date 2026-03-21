-- Phase 4: 出貨/物流追蹤模組
-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('PREPARING', 'SHIPPED', 'IN_TRANSIT', 'CUSTOMS_CLEARANCE', 'DELIVERED', 'RETURNED');

-- CreateTable
CREATE TABLE "Shipment" (
    "id"               TEXT NOT NULL,
    "shipmentNo"       TEXT NOT NULL,
    "orderId"          TEXT NOT NULL,
    "carrier"          TEXT,
    "trackingNo"       TEXT,
    "shippingDate"     TIMESTAMP(3),
    "estimatedArrival" TIMESTAMP(3),
    "actualArrival"    TIMESTAMP(3),
    "originCountry"    VARCHAR(2),
    "destCountry"      VARCHAR(2),
    "weight"           DECIMAL(10,2),
    "packageCount"     INTEGER,
    "status"           "ShipmentStatus" NOT NULL DEFAULT 'PREPARING',
    "notes"            TEXT,
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"        TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_shipmentNo_key" ON "Shipment"("shipmentNo");

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
