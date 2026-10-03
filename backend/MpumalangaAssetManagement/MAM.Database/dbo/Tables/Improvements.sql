CREATE TABLE [dbo].[Improvements] (
    [Id]                          INT           IDENTITY (1, 1) NOT NULL,
    [FacilityId]                  INT           NOT NULL,
    [BuildingName]                VARCHAR (50)  NULL,
    [Type]                        VARCHAR (50)  NULL,
    [Size]                        INT           NULL,
    [PotentialUse]                VARCHAR (50)  NULL,
    [SiteCoverag]                 VARCHAR (50)  NULL,
    [LevelofUtilization]          VARCHAR (50)  NULL,
    [ExtentOfBuilding]            VARCHAR (50)  NULL,
    [ConditionRating]             VARCHAR (50)  NULL,
    [UsableArea]                  VARCHAR (50)  NULL,
    [FunctionalPerformanceRating] VARCHAR (100) NULL,
    [Comment]                     VARCHAR (500) NULL,
    [ClientCode]                  VARCHAR (50)  NULL,
    CONSTRAINT [PK_Improvement] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Improvement_Facility] FOREIGN KEY ([FacilityId]) REFERENCES [dbo].[Facilities] ([Id])
);

