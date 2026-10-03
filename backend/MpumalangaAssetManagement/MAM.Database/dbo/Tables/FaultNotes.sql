CREATE TABLE [dbo].[FaultNotes] (
    [Id]           INT           IDENTITY (1, 1) NOT NULL,
    [Comment]      VARCHAR (500) NOT NULL,
    [FaultId]      INT           NOT NULL,
    [CreatedById]  INT           NOT NULL,
    [CreatedDate]  DATETIME      NOT NULL,
    [ModifiedById] INT           NULL,
    [ModifiedDate] DATETIME      NULL,
    CONSTRAINT [PK_FaultNotes] PRIMARY KEY CLUSTERED ([Id] ASC)
);

