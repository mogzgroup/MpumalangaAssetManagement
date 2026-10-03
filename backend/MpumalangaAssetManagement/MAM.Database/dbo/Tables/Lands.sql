CREATE TABLE [dbo].[Lands] (
    [Id]                        INT          IDENTITY (1, 1) NOT NULL,
    [DeedsOffice]               VARCHAR (50) NULL,
    [Class]                     VARCHAR (50) NULL,
    [Type]                      VARCHAR (50) NULL,
    [GeographicalLocationId]    INT          NULL,
    [PropertyDescriptionId]     INT          NULL,
    [LandUseManagementDetailId] INT          NULL,
    [LeaseStatusId]             INT          NULL,
    [ClientCode]                VARCHAR (50) NULL,
    CONSTRAINT [PK_Land] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Land_GeographicalLocation] FOREIGN KEY ([GeographicalLocationId]) REFERENCES [dbo].[GeographicalLocations] ([Id]),
    CONSTRAINT [FK_Land_LandUseManagementDetail] FOREIGN KEY ([LandUseManagementDetailId]) REFERENCES [dbo].[LandUseManagementDetails] ([Id]),
    CONSTRAINT [FK_Land_LeaseStatus] FOREIGN KEY ([LeaseStatusId]) REFERENCES [dbo].[LeaseStatuses] ([Id]),
    CONSTRAINT [FK_Land_PropertyDescription] FOREIGN KEY ([PropertyDescriptionId]) REFERENCES [dbo].[PropertyDescriptions] ([Id])
);

