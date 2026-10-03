CREATE TABLE [dbo].[Finances] (
    [Id]                         INT          IDENTITY (1, 1) NOT NULL,
    [LandUseClass]               VARCHAR (50) NULL,
    [NatureofAsset]              VARCHAR (50) NULL,
    [AFS]                        VARCHAR (50) NULL,
    [SecondaryInformationNoteId] INT          NULL,
    [ValuationId]                INT          NULL,
    [ClientCode]                 VARCHAR (50) NULL,
    CONSTRAINT [PK_Finance] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Finance_SecondaryInformationNote] FOREIGN KEY ([SecondaryInformationNoteId]) REFERENCES [dbo].[SecondaryInformationNotes] ([Id]),
    CONSTRAINT [FK_Finance_Valuation] FOREIGN KEY ([ValuationId]) REFERENCES [dbo].[Valuations] ([Id])
);

