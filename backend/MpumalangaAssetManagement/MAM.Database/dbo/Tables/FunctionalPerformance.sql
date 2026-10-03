CREATE TABLE [dbo].[FunctionalPerformance] (
    [Id]                          INT           IDENTITY (1, 1) NOT NULL,
    [UserId]                      INT           NULL,
    [Province]                    VARCHAR (50)  NULL,
    [Town]                        VARCHAR (500) NULL,
    [UniqueIdentifyingCode]       VARCHAR (500) NULL,
    [PossibleNonAssetSolution]    VARCHAR (500) NULL,
    [CommonAssetDescription]      VARCHAR (500) NULL,
    [CurrentUser]                 VARCHAR (500) NULL,
    [RequiredPerformanceStandard] VARCHAR (500) NULL,
    [AccessibilityRating]         VARCHAR (500) NULL,
    [SuitabilityIndex]            VARCHAR (500) NULL,
    [ConditionalRating]           VARCHAR (500) NULL,
    [OperatingperformanceIndex]   VARCHAR (500) NULL,
    [FunctionalPerformanceRating] VARCHAR (500) NULL,
    CONSTRAINT [PK_FunctionalPerformance] PRIMARY KEY CLUSTERED ([Id] ASC)
);

