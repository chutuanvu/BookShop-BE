BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[NguoiDung] (
    [id] NVARCHAR(1000) NOT NULL,
    [tenDangNhap] NVARCHAR(1000) NOT NULL,
    [matKhau] NVARCHAR(1000) NOT NULL,
    [vaiTro] NVARCHAR(1000) NOT NULL CONSTRAINT [NguoiDung_vaiTro_df] DEFAULT 'USER',
    [nickname] NVARCHAR(1000),
    [fullName] NVARCHAR(1000),
    [ngayTao] DATETIME2 NOT NULL CONSTRAINT [NguoiDung_ngayTao_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [NguoiDung_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [NguoiDung_tenDangNhap_key] UNIQUE NONCLUSTERED ([tenDangNhap])
);

-- CreateTable
CREATE TABLE [dbo].[DanhMuc] (
    [id] NVARCHAR(1000) NOT NULL,
    [tenDanhMuc] NVARCHAR(1000) NOT NULL,
    [moTa] TEXT,
    [ngayTao] DATETIME2 NOT NULL CONSTRAINT [DanhMuc_ngayTao_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [DanhMuc_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [DanhMuc_tenDanhMuc_key] UNIQUE NONCLUSTERED ([tenDanhMuc])
);

-- CreateTable
CREATE TABLE [dbo].[Truyen] (
    [id] NVARCHAR(1000) NOT NULL,
    [tenTruyen] NVARCHAR(1000) NOT NULL,
    [hinhAnh] NVARCHAR(1000) NOT NULL,
    [moTa] TEXT,
    [theLoai] NVARCHAR(1000) NOT NULL,
    [soTapHienTai] INT NOT NULL CONSTRAINT [Truyen_soTapHienTai_df] DEFAULT 0,
    [tacGia] NVARCHAR(1000) NOT NULL,
    [ngayTao] DATETIME2 NOT NULL CONSTRAINT [Truyen_ngayTao_df] DEFAULT CURRENT_TIMESTAMP,
    [maDanhMuc] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Truyen_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ChiTietTruyen] (
    [id] NVARCHAR(1000) NOT NULL,
    [tenTapTruyen] NVARCHAR(1000) NOT NULL,
    [hinhAnh] NVARCHAR(1000) NOT NULL,
    [giaBan] FLOAT(53) NOT NULL,
    [soTrang] INT NOT NULL,
    [soLuongTon] INT NOT NULL CONSTRAINT [ChiTietTruyen_soLuongTon_df] DEFAULT 0,
    [soLuongDaBan] INT NOT NULL CONSTRAINT [ChiTietTruyen_soLuongDaBan_df] DEFAULT 0,
    [maTruyen] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [ChiTietTruyen_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[GioHang] (
    [id] NVARCHAR(1000) NOT NULL,
    [soLuong] INT NOT NULL CONSTRAINT [GioHang_soLuong_df] DEFAULT 1,
    [userId] NVARCHAR(1000) NOT NULL,
    [maChiTietTruyen] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [GioHang_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[MaGiamGia] (
    [id] NVARCHAR(1000) NOT NULL,
    [moTa] TEXT,
    [loaiGiamGia] NVARCHAR(1000) NOT NULL,
    [soTienGiam] FLOAT(53) NOT NULL,
    [soLuongDung] INT NOT NULL CONSTRAINT [MaGiamGia_soLuongDung_df] DEFAULT 0,
    [soLuotDung] INT NOT NULL CONSTRAINT [MaGiamGia_soLuotDung_df] DEFAULT 0,
    [ngayTao] DATETIME2 NOT NULL CONSTRAINT [MaGiamGia_ngayTao_df] DEFAULT CURRENT_TIMESTAMP,
    [ngayKetThuc] DATETIME2 NOT NULL,
    CONSTRAINT [MaGiamGia_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[DonHang] (
    [id] NVARCHAR(1000) NOT NULL,
    [soLuong] INT NOT NULL,
    [tongTien] FLOAT(53) NOT NULL,
    [trangThai] NVARCHAR(1000) NOT NULL CONSTRAINT [DonHang_trangThai_df] DEFAULT 'PENDING',
    [ngayTao] DATETIME2 NOT NULL CONSTRAINT [DonHang_ngayTao_df] DEFAULT CURRENT_TIMESTAMP,
    [userId] NVARCHAR(1000) NOT NULL,
    [maChiTietTruyen] NVARCHAR(1000) NOT NULL,
    [maGiamGiaId] NVARCHAR(1000),
    CONSTRAINT [DonHang_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[DiaChiNhanHang] (
    [id] NVARCHAR(1000) NOT NULL,
    [diaChi] NVARCHAR(1000) NOT NULL,
    [tenNguoiNhan] NVARCHAR(1000) NOT NULL,
    [soDienThoai] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [DiaChiNhanHang_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[Truyen] ADD CONSTRAINT [Truyen_maDanhMuc_fkey] FOREIGN KEY ([maDanhMuc]) REFERENCES [dbo].[DanhMuc]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ChiTietTruyen] ADD CONSTRAINT [ChiTietTruyen_maTruyen_fkey] FOREIGN KEY ([maTruyen]) REFERENCES [dbo].[Truyen]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[GioHang] ADD CONSTRAINT [GioHang_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[NguoiDung]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[GioHang] ADD CONSTRAINT [GioHang_maChiTietTruyen_fkey] FOREIGN KEY ([maChiTietTruyen]) REFERENCES [dbo].[ChiTietTruyen]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[DonHang] ADD CONSTRAINT [DonHang_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[NguoiDung]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[DonHang] ADD CONSTRAINT [DonHang_maChiTietTruyen_fkey] FOREIGN KEY ([maChiTietTruyen]) REFERENCES [dbo].[ChiTietTruyen]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[DonHang] ADD CONSTRAINT [DonHang_maGiamGiaId_fkey] FOREIGN KEY ([maGiamGiaId]) REFERENCES [dbo].[MaGiamGia]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[DiaChiNhanHang] ADD CONSTRAINT [DiaChiNhanHang_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[NguoiDung]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
