CREATE TABLE [dbo].[Users] (
    [Id]                INT            IDENTITY (1, 1) NOT NULL,
    [Name]              NVARCHAR (MAX) NOT NULL,
    [Surname]           NVARCHAR (MAX) NOT NULL,
    [Username]          NVARCHAR (MAX) NOT NULL,
    [Password]          NVARCHAR (MAX) NOT NULL,
    [IsActive]          BIT            NOT NULL,
    [RoleId]            INT            NOT NULL,
    [Department]        VARCHAR (500)  NULL,
    [Email]             NVARCHAR (MAX) NULL,
    [PasswordIsChanged] BIT            NOT NULL,
    [CreatedDate]       DATETIME       NOT NULL,
    [ModifiedDate]      DATETIME       NULL,
    [CreatedUserId]     INT            NOT NULL,
    [ModifiedUserId]    INT            NULL,
    CONSTRAINT [PK_dbo.Users] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Users_Roles] FOREIGN KEY ([RoleId]) REFERENCES [dbo].[Roles] ([Id])
);

