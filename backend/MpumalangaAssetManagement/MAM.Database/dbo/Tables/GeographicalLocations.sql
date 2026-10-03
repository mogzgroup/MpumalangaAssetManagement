CREATE TABLE [dbo].[GeographicalLocations] (
    [Id]                   INT           IDENTITY (1, 1) NOT NULL,
    [Province]             VARCHAR (20)  NULL,
    [Town]                 VARCHAR (500) NULL,
    [Suburb]               VARCHAR (500) NULL,
    [StreetName]           VARCHAR (500) NULL,
    [StreetNumber]         INT           NULL,
    [DistrictMunicipality] VARCHAR (500) NULL,
    [Region]               VARCHAR (500) NULL,
    [LocalAuthority]       VARCHAR (500) NULL,
    [Latitude]             VARCHAR (500) NULL,
    [Longitude]            VARCHAR (500) NULL,
    [MagisterialDistrict]  VARCHAR (500) NULL,
    [ClientCode]           VARCHAR (50)  NULL,
    CONSTRAINT [PK_GeographicalLocation] PRIMARY KEY CLUSTERED ([Id] ASC)
);

