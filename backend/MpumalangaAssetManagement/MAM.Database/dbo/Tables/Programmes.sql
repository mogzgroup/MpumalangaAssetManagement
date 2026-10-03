CREATE TABLE [dbo].[Programmes] (
    [Id]                                     INT           IDENTITY (1, 1) NOT NULL,
    [UserImmovableAssetManagementPlanId]     INT           NOT NULL,
    [CorporateObjective]                     VARCHAR (500) NULL,
    [Outcomes]                               VARCHAR (500) NULL,
    [OptimalSupportingAccommodationSolution] VARCHAR (500) NULL,
    [RationaleChosenSolution]                VARCHAR (500) NULL,
    CONSTRAINT [PK_Programme] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Programmes_UserImmovableAssetManagementPlans] FOREIGN KEY ([UserImmovableAssetManagementPlanId]) REFERENCES [dbo].[UserImmovableAssetManagementPlans] ([Id])
);

