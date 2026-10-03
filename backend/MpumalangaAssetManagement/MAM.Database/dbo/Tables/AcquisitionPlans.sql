CREATE TABLE [dbo].[AcquisitionPlans] (
    [Id]                                 INT           IDENTITY (1, 1) NOT NULL,
    [UserImmovableAssetManagementPlanId] INT           NOT NULL,
    [DistrictRegion]                     VARCHAR (500) NULL,
    [Town]                               VARCHAR (500) NULL,
    [ServiceDescription]                 VARCHAR (500) NULL,
    [BudgetType]                         VARCHAR (500) NULL,
    [Extent]                             FLOAT (53)    NULL,
    [InitialNeedYear]                    INT           NULL,
    [AcquisitionType]                    VARCHAR (500) NULL,
    [Status]                             VARCHAR (500) NULL,
    [TotalAmountRequired]                MONEY         NULL,
    [CashFlowYear1]                      MONEY         NULL,
    [CashFlowYear2]                      MONEY         NULL,
    [CashFlowYear3]                      MONEY         NULL,
    [CashFlowYear4]                      MONEY         NULL,
    [CashFlowYear5]                      MONEY         NULL,
    [TempleteNumber]                     FLOAT (53)    NULL,
    [IsRequired]                         BIT           NULL,
    CONSTRAINT [PK_AcquisitionPlan] PRIMARY KEY CLUSTERED ([Id] ASC)
);

