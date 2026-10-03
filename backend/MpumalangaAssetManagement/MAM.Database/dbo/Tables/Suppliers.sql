CREATE TABLE [dbo].[Suppliers] (
    [Id]            INT           IDENTITY (1, 1) NOT NULL,
    [CompanyName]   VARCHAR (500) NULL,
    [CompanyNumber] VARCHAR (100) NULL,
    [ContactName]   VARCHAR (500) NULL,
    [ContactNumber] VARCHAR (10)  NULL,
    [CreatedDate]   DATETIME      NULL,
    [ModifiedDate]  DATETIME      NULL,
    [ProjectId]     VARCHAR (50)  NULL,
    CONSTRAINT [PK_Suppliers] PRIMARY KEY CLUSTERED ([Id] ASC)
);

