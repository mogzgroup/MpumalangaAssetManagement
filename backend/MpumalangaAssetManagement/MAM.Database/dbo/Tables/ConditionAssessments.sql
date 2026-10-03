CREATE TABLE [dbo].[ConditionAssessments] (
    [Id]                            INT      IDENTITY (1, 1) NOT NULL,
    [FacilityId]                    INT      NOT NULL,
    [RequiredPerformanceStandard]   INT      NOT NULL,
    [AccessibilityRating]           INT      NOT NULL,
    [ConditionRating]               INT      NOT NULL,
    [SuitabilityIndex]              INT      NOT NULL,
    [OperatingPerformanceIndex]     INT      NOT NULL,
    [FunctionalPerformanceStandard] INT      NOT NULL,
    [CreatedDate]                   DATETIME NOT NULL,
    [UserId]                        INT      NOT NULL,
    [ModifiedDate]                  DATETIME NULL,
    [ModifiedBy]                    INT      NULL,
    CONSTRAINT [PK_ConditionAssessment] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_ConditionAssessmentUser] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id]),
    CONSTRAINT [FK_UserConditionAssessment] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id])
);

