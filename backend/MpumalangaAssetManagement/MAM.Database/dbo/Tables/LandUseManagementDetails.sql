CREATE TABLE [dbo].[LandUseManagementDetails] (
    [Id]                   INT           IDENTITY (1, 1) NOT NULL,
    [TitleDeedNumber]      VARCHAR (500) NULL,
    [RegistrationDate]     VARCHAR (500) NULL,
    [RegisteredOwner]      VARCHAR (500) NULL,
    [VestingDate]          DATETIME      NULL,
    [ConditionsOfTitle]    VARCHAR (500) NULL,
    [OwnershipCategory]    VARCHAR (500) NULL,
    [StateOwnedPercentage] INT           NULL,
    [LandUse]              VARCHAR (500) NULL,
    [Zoning]               VARCHAR (500) NULL,
    [UserDepartment]       VARCHAR (500) NULL,
    [FacilityName]         VARCHAR (500) NULL,
    [IncomeLeaseStatus]    VARCHAR (500) NULL,
    [ClientCode]           VARCHAR (50)  NULL,
    CONSTRAINT [PK_LandUseManagementDetail] PRIMARY KEY CLUSTERED ([Id] ASC)
);

