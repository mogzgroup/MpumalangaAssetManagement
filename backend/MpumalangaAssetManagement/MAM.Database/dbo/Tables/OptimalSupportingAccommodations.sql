CREATE TABLE [dbo].[OptimalSupportingAccommodations] (
    [Id]                      INT           IDENTITY (1, 1) NOT NULL,
    [Mission]                 VARCHAR (500) NOT NULL,
    [SupportingAccommodation] VARCHAR (500) NOT NULL,
    CONSTRAINT [PK_OptimalSupportingAccommodation] PRIMARY KEY CLUSTERED ([Id] ASC)
);

