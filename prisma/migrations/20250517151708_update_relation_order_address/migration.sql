/*
  Warnings:

  - Added the required column `maDiaChi` to the `DonHang` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phuongThucThanhToan` to the `DonHang` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[DonHang] ADD [maDiaChi] NVARCHAR(1000) NOT NULL,
[phuongThucThanhToan] NVARCHAR(1000) NOT NULL;

-- AddForeignKey
ALTER TABLE [dbo].[DonHang] ADD CONSTRAINT [DonHang_maDiaChi_fkey] FOREIGN KEY ([maDiaChi]) REFERENCES [dbo].[DiaChiNhanHang]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
