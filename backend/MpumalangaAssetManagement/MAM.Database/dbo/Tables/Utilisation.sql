CREATE TABLE [dbo].[Utilisation] (
    [Id]                 INT           IDENTITY (1, 1) NOT NULL,
    [UserId]             INT           NULL,
    [Post]               VARCHAR (500) NULL,
    [RequiredSpace]      VARCHAR (500) NULL,
    [PercentageUtilised] VARCHAR (500) NULL,
    CONSTRAINT [PK_Utilisations] PRIMARY KEY CLUSTERED ([Id] ASC)
);

