CREATE TABLE [dbo].[Valuations] (
    [Id]                          INT           IDENTITY (1, 1) NOT NULL,
    [MunicipalValuationDate]      DATETIME      NULL,
    [NonMunicipalValuationDate]   DATETIME      NULL,
    [MunicipalValuation]          VARCHAR (500) NULL,
    [NonMunicipalValuation]       VARCHAR (500) NULL,
    [PropetyRatesAccount]         VARCHAR (500) NULL,
    [Value]                       VARCHAR (500) NULL,
    [AccountNoForService]         VARCHAR (500) NULL,
    [PersonInstitutionResposible] VARCHAR (500) NULL,
    [ClientCode]                  VARCHAR (50)  NULL,
    CONSTRAINT [PK_Valuation] PRIMARY KEY CLUSTERED ([Id] ASC)
);

