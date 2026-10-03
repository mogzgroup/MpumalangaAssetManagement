CREATE TABLE [dbo].[SecondaryInformationNotes] (
    [Id]              INT          IDENTITY (1, 1) NOT NULL,
    [OpeningBalance]  MONEY        NULL,
    [AdditionCash]    MONEY        NULL,
    [AdditionNonCash] MONEY        NULL,
    [Addition]        MONEY        NULL,
    [Disposal]        MONEY        NULL,
    [ClosingBalance]  MONEY        NULL,
    [ClientCode]      VARCHAR (50) NULL,
    CONSTRAINT [PK_SecondaryInformationNote] PRIMARY KEY CLUSTERED ([Id] ASC)
);

