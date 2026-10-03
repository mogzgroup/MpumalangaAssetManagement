CREATE TABLE [dbo].[UserImmovableAssetManagementPlans] (
    [Id]                               INT           IDENTITY (1, 1) NOT NULL,
    [Status]                           VARCHAR (50)  NOT NULL,
    [FileReference]                    VARCHAR (50)  NOT NULL,
    [OptimalSupportingAccommodationId] INT           NULL,
    [UserId]                           INT           NOT NULL,
    [CreatedDate]                      DATETIME      NOT NULL,
    [ModifiedBy]                       INT           NULL,
    [ModifiedDate]                     DATETIME      NULL,
    [Department]                       VARCHAR (100) NOT NULL,
    CONSTRAINT [PK_UserImmovableAssetManagementPlan] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_UserImmovableAssetManagementPlans_OptimalSupportingAccommodations1] FOREIGN KEY ([OptimalSupportingAccommodationId]) REFERENCES [dbo].[OptimalSupportingAccommodations] ([Id]),
    CONSTRAINT [FK_UserImmovableAssetManagementPlans_Users1] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id])
);

