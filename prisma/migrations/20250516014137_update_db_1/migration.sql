BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[ChiTietHuyDonHang] (
    [id] NVARCHAR(1000) NOT NULL,
    [isAccept] INT NOT NULL CONSTRAINT [ChiTietHuyDonHang_isAccept_df] DEFAULT 0,
    [reasonBack] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ChiTietHuyDonHang_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [replyContent] NVARCHAR(1000),
    [replyAt] DATETIME2,
    [maDonHang] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [ChiTietHuyDonHang_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[ChiTietHuyDonHang] ADD CONSTRAINT [ChiTietHuyDonHang_maDonHang_fkey] FOREIGN KEY ([maDonHang]) REFERENCES [dbo].[DonHang]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ChiTietHuyDonHang] ADD CONSTRAINT [ChiTietHuyDonHang_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[NguoiDung]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
