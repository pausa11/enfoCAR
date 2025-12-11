-- AlterEnum: Update AssetType enum from English to Colombian Spanish terms
-- This migration handles the transition from CAR/BUS/TRUCK to CARRO/JEEP/BUSETA/TURBO

-- Step 1: Create new enum type with Colombian terms
CREATE TYPE "AssetType_new" AS ENUM ('CARRO', 'JEEP', 'BUSETA', 'TURBO');

-- Step 2: Alter the Asset table to use the new enum type
-- Note: This will fail if there are existing records with the old enum values
-- If you have existing data, you'll need to migrate it first
ALTER TABLE "Asset" ALTER COLUMN "type" TYPE "AssetType_new" USING (
  CASE 
    WHEN "type"::text = 'CAR' THEN 'CARRO'::text
    WHEN "type"::text = 'BUS' THEN 'BUSETA'::text
    WHEN "type"::text = 'TRUCK' THEN 'TURBO'::text
    ELSE "type"::text
  END
)::"AssetType_new";

-- Step 3: Drop the old enum type
DROP TYPE "AssetType";

-- Step 4: Rename the new enum type to the original name
ALTER TYPE "AssetType_new" RENAME TO "AssetType";
