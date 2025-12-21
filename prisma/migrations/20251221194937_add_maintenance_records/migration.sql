-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('PARTICULAR', 'PUBLICO');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('SOAT', 'TECNOMECANICA', 'POLIZA_TODO_RIESGO', 'IMPUESTO_VEHICULAR', 'TARJETA_PROPIEDAD', 'OTRO');

-- CreateEnum
CREATE TYPE "MaintenanceType" AS ENUM ('CAMBIO_ACEITE_MOTOR', 'CAMBIO_ACEITE_TRANSMISION', 'CAMBIO_LLANTAS', 'CAMBIO_FILTROS', 'REVISION_FRENOS', 'ALINEACION_BALANCEO', 'BATERIA', 'REPUESTOS', 'OTRO');

-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "serviceType" "ServiceType" NOT NULL DEFAULT 'PARTICULAR';

-- CreateTable
CREATE TABLE "AssetDocument" (
    "id" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "identifier" TEXT,
    "expirationDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "assetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceRecord" (
    "id" TEXT NOT NULL,
    "type" "MaintenanceType" NOT NULL,
    "description" TEXT,
    "cost" DECIMAL(10,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "mileage" INTEGER,
    "nextServiceDate" TIMESTAMP(3),
    "nextServiceMileage" INTEGER,
    "notes" TEXT,
    "assetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceRecord_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AssetDocument" ADD CONSTRAINT "AssetDocument_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRecord" ADD CONSTRAINT "MaintenanceRecord_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
