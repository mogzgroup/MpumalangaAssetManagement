CREATE TABLE [dbo].[StrategicAssessments] (
    [Id]                                 INT           IDENTITY (1, 1) NOT NULL,
    [UserImmovableAssetManagementPlanId] INT           NOT NULL,
    [District]                           VARCHAR (500) NULL,
    [PostDescriptionTitle]               VARCHAR (500) NULL,
    [AllocatedSpace]                     FLOAT (53)    NULL,
    [SurplusShortageAccommodation]       FLOAT (53)    NULL,
    [PercentageUtilised]                 FLOAT (53)    NULL,
    [FbpQuantity]                        INT           NULL,
    [FbpLevel]                           FLOAT (53)    NULL,
    [FbpNorm]                            FLOAT (53)    NULL,
    [FbpRequirement]                     FLOAT (53)    NULL,
    [AoLevel]                            FLOAT (53)    NULL,
    [AoQuantity]                         INT           NULL,
    [AoNorm]                             FLOAT (53)    NULL,
    [AoRequirement]                      FLOAT (53)    NULL,
    CONSTRAINT [PK_StrategicAssessment] PRIMARY KEY CLUSTERED ([Id] ASC)
);

