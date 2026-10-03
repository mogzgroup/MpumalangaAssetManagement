CREATE TABLE [dbo].[Faults] (
    [Id]                       INT           IDENTITY (1, 1) NOT NULL,
    [Town]                     VARCHAR (500) NULL,
    [FacilityId]               INT           NOT NULL,
    [PropertyDescription]      VARCHAR (500) NOT NULL,
    [IncidentDescription]      VARCHAR (500) NOT NULL,
    [ContactName]              VARCHAR (500) NOT NULL,
    [ContactNumber]            VARCHAR (20)  NOT NULL,
    [CreatedDate]              DATETIME      NOT NULL,
    [ModifiedDate]             DATETIME      NULL,
    [ReferenceNo]              VARCHAR (50)  NOT NULL,
    [HasCompletionCertificate] BIT           NULL,
    [HasContractInvoice]       BIT           NULL,
    [SupplierId]               INT           NULL,
    [ProjectId]                INT           NULL,
    [Status]                   VARCHAR (50)  NOT NULL,
    [IsDeleted]                BIT           NULL,
    CONSTRAINT [PK_Faults] PRIMARY KEY CLUSTERED ([Id] ASC)
);

