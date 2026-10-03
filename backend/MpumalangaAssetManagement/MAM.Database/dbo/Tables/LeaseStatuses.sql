CREATE TABLE [dbo].[LeaseStatuses] (
    [Id]                                INT          IDENTITY (1, 1) NOT NULL,
    [NatureOfLease]                     VARCHAR (50) NULL,
    [IDNumberCompanyRegistrationNumber] VARCHAR (50) NULL,
    [POBox]                             VARCHAR (50) NULL,
    [ContactNumber]                     VARCHAR (50) NULL,
    [CapacityofContactPerson]           VARCHAR (50) NULL,
    [ContactPerson]                     VARCHAR (50) NULL,
    [PostalCode]                        INT          NULL,
    [LeaseStatusTown]                   VARCHAR (50) NULL,
    [RentalAmount]                      FLOAT (53)   NULL,
    [TerminationDate]                   DATETIME     NULL,
    [StartingDate]                      DATETIME     NULL,
    [OccupationDate]                    DATETIME     NULL,
    [Escalation]                        VARCHAR (50) NULL,
    [Vat]                               VARCHAR (50) NULL,
    [LeaseNumber]                       INT          NULL,
    [OtherCharges]                      INT          NULL,
    [ClientCode]                        VARCHAR (50) NULL,
    CONSTRAINT [PK_LeaseStatus] PRIMARY KEY CLUSTERED ([Id] ASC)
);

