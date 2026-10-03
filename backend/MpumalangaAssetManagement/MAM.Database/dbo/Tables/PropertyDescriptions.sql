CREATE TABLE [dbo].[PropertyDescriptions] (
    [Id]                   INT           IDENTITY (1, 1) NOT NULL,
    [RegistrationDivision] VARCHAR (500) NULL,
    [TownshipName]         VARCHAR (500) NULL,
    [LandParcel]           VARCHAR (500) NULL,
    [LandPortion]          VARCHAR (500) NULL,
    [OldDescription]       VARCHAR (500) NULL,
    [LandRemainder]        BIT           NULL,
    [FarmName]             VARCHAR (500) NULL,
    [SGDiagramNumber]      VARCHAR (500) NULL,
    [Extent]               FLOAT (53)    NULL,
    [LPICode]              VARCHAR (500) NULL,
    [Acquired]             VARCHAR (500) NULL,
    [AcquiredOther]        VARCHAR (500) NULL,
    [ClientCode]           VARCHAR (50)  NULL,
    CONSTRAINT [PK_PropertyDescription] PRIMARY KEY CLUSTERED ([Id] ASC)
);

