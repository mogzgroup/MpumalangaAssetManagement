CREATE TABLE [dbo].[SurrenderPlans] (
    [Id]                                 INT           IDENTITY (1, 1) NOT NULL,
    [UserImmovableAssetManagementPlanId] INT           NOT NULL,
    [DistrictRegion]                     VARCHAR (500) NULL,
    [Town]                               VARCHAR (500) NULL,
    [LocalMunicipality]                  VARCHAR (500) NULL,
    [CurrentStreetAddress]               VARCHAR (500) NULL,
    [AssetType]                          VARCHAR (500) NULL,
    [PropertyDescription]                VARCHAR (500) NULL,
    [AllocatedLettableSpace]             FLOAT (53)    NULL,
    [ExtentofLand]                       FLOAT (53)    NULL,
    [SurrenderRationale]                 VARCHAR (500) NULL,
    [ProposedHandOverDate]               DATETIME      NULL,
    [ContractualObligations]             VARCHAR (500) NULL,
    [Relinquish]                         BIT           NULL,
    CONSTRAINT [PK_SurrenderPlan] PRIMARY KEY CLUSTERED ([Id] ASC)
);

