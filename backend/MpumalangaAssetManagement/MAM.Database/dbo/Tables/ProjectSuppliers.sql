CREATE TABLE [dbo].[ProjectSuppliers] (
    [Id]         INT IDENTITY (1, 1) NOT NULL,
    [ProjectId]  INT NULL,
    [SupplierId] INT NULL,
    CONSTRAINT [PK_ProjectSuppliers] PRIMARY KEY CLUSTERED ([Id] ASC)
);

