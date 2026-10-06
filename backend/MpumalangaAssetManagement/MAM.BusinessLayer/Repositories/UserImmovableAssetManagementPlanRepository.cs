using MAM.BusinessLayer.Model;
using MAM.BusinessLayer.Models;
using MAM.BusinessLayer.Interfaces;
using MAM.BusinessLayer.Models.Templetes;
using Microsoft.Win32.SafeHandles;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;

namespace MAM.BusinessLayer.Repositories
{
    public class UserImmovableAssetManagementPlanRepository : IUserImmovableAssetManagementPlanRepository
    {
        private AppSettings appSettings { get; set; }
        private readonly MAM.DataAccess.Interfaces.IUampRepository _uampDataAccess;
        private readonly MAM.DataAccess.Interfaces.IStrategicAssessmentRepository _strategicAssessmentDataAccess;
        private readonly MAM.DataAccess.Interfaces.IAcquisitionPlanRepository _acquisitionPlanDataAccess;
        private readonly MAM.DataAccess.Interfaces.IOperationPlanRepository _operationPlanDataAccess;
        private readonly MAM.DataAccess.Interfaces.ISurrenderPlanRepository _surrenderPlanDataAccess;
        private readonly MAM.DataAccess.Interfaces.IMtefBudgetPeriodRepository _mtefBudgetPeriodDataAccess;
        private readonly MAM.DataAccess.Interfaces.IProgrammeRepository _programmeDataAccess;
        private readonly MAM.DataAccess.Interfaces.IPropertyRepository _propertyDataAccess;
        private readonly MAM.DataAccess.Interfaces.IFacility _facilityDataAccess;
        private readonly MAM.DataAccess.Interfaces.IUser _userDataAccess;
        private readonly MAM.DataAccess.Interfaces.IOptimalSupportingAccommodationRepository _optimalSupportingAccommodationDataAccess;

        public UserImmovableAssetManagementPlanRepository(
            AppSettings settings,
            MAM.DataAccess.Interfaces.IUampRepository uampDataAccess,
            MAM.DataAccess.Interfaces.IStrategicAssessmentRepository strategicAssessmentDataAccess,
            MAM.DataAccess.Interfaces.IAcquisitionPlanRepository acquisitionPlanDataAccess,
            MAM.DataAccess.Interfaces.IOperationPlanRepository operationPlanDataAccess,
            MAM.DataAccess.Interfaces.ISurrenderPlanRepository surrenderPlanDataAccess,
            MAM.DataAccess.Interfaces.IMtefBudgetPeriodRepository mtefBudgetPeriodDataAccess,
            MAM.DataAccess.Interfaces.IProgrammeRepository programmeDataAccess,
            MAM.DataAccess.Interfaces.IPropertyRepository propertyDataAccess,
            MAM.DataAccess.Interfaces.IFacility facilityDataAccess,
            MAM.DataAccess.Interfaces.IUser userDataAccess,
            MAM.DataAccess.Interfaces.IOptimalSupportingAccommodationRepository optimalSupportingAccommodationDataAccess)
        {
            appSettings = settings;
            _uampDataAccess = uampDataAccess;
            _strategicAssessmentDataAccess = strategicAssessmentDataAccess;
            _acquisitionPlanDataAccess = acquisitionPlanDataAccess;
            _operationPlanDataAccess = operationPlanDataAccess;
            _surrenderPlanDataAccess = surrenderPlanDataAccess;
            _mtefBudgetPeriodDataAccess = mtefBudgetPeriodDataAccess;
            _programmeDataAccess = programmeDataAccess;
            _propertyDataAccess = propertyDataAccess;
            _facilityDataAccess = facilityDataAccess;
            _userDataAccess = userDataAccess;
            _optimalSupportingAccommodationDataAccess = optimalSupportingAccommodationDataAccess;
        }

        public List<UserImmovableAssetManagementPlan> GetUserImmovableAssetManagementPlans(string department)
        {
            UserImmovableAssetManagementPlan uamp = new UserImmovableAssetManagementPlan();
            List<UserImmovableAssetManagementPlan> userImmovableAssetManagementPlans = new List<UserImmovableAssetManagementPlan>();
            var uamps = uamp.ConvertToUserImmovableAssetManagementPlans(_uampDataAccess.GetUamps(department));
            userImmovableAssetManagementPlans.AddRange(uamps);
            return userImmovableAssetManagementPlans;
        }

        public UserImmovableAssetManagementPlan GetUamp(int id) {
            UserImmovableAssetManagementPlan uamp = new UserImmovableAssetManagementPlan();
            return uamp.ConvertToUserImmovableAssetManagementPlan(_uampDataAccess.GetUamp(id));
        }

        public UserImmovableAssetManagementPlan GetUampWithTemplateOne(int id)
        {
            UserImmovableAssetManagementPlan uamp = new UserImmovableAssetManagementPlan();
            return uamp.ConvertToUserImmovableAssetManagementPlanWithTemplateOne(_uampDataAccess.GetUampWithTemplateOne(id));
        }        

        public UserImmovableAssetManagementPlan SaveUserImmovableAssetManagementPlan(UserImmovableAssetManagementPlan uamp)
        {
            if (uamp.TempleteOne != null)
            {
                if (uamp.TempleteOne.OptimalSupportingAccommodation != null)
                    uamp = SaveOptimalSupportingAccommodationRepository(uamp);
                if (uamp.TempleteOne.Programmes.Count > 0)
                    uamp.TempleteOne.Programmes = SaveProgramme(uamp.TempleteOne.Programmes);
                if (uamp.TempleteTwoPointOne?.Properties != null)
                    uamp = SaveTempleteTwo(uamp);
                if (uamp.TempleteThree?.StrategicAssessments != null)
                {
                    if (uamp.TempleteThree?.StrategicAssessments.Count > 0)
                        uamp = SaveTempleteThree(uamp);
                }
                if (uamp.TempleteFourPointOne?.AcquisitionPlans != null)
                {
                    if (uamp.TempleteFourPointOne?.AcquisitionPlans.Count > 0 || uamp.TempleteFourPointTwo?.AcquisitionPlans.Count > 0)
                        uamp = SaveTempleteFour(uamp);
                }                   
                if (uamp.TempleteFivePointOne?.OperationPlans != null)
                    uamp = SaveTempleteFive(uamp);
                if (uamp.TempleteSix?.SurrenderPlans != null)
                    uamp = SaveTempleteSix(uamp);
                if (uamp.TempleteSeven?.MtefBudgetPeriods != null)
                    uamp = SaveTempleteSeven(uamp);

                uamp.OptimalSupportingAccommodationId = uamp.TempleteOne.OptimalSupportingAccommodation.Id;

                uamp = SaveUamp(uamp);
            }
            return uamp;
        }

        public UserImmovableAssetManagementPlan SaveUamp(UserImmovableAssetManagementPlan uamp)
        {
            if (uamp.Id == 0)
            {
                uamp.Id = _uampDataAccess.CreateUamp(uamp.ConvertToDBUserImmovableAssetManagementPlans(uamp));
            }
            else
            {
                _uampDataAccess.UpdateUamp(uamp.ConvertToDBUserImmovableAssetManagementPlans(uamp));
            }
            return uamp;
        }

        public UserImmovableAssetManagementPlan SaveTempleteThree(UserImmovableAssetManagementPlan uamp)
        {
            var all = uamp.TempleteThree?.StrategicAssessments ?? new List<StrategicAssessment>();
            var newItems = all.Where(s => s.Id == 0).Select(s => s.ConvertToStrategicAssessmentTable(s)).ToList();
            var existing = all.Where(s => s.Id != 0).ToList();

            if (newItems.Any())
                _strategicAssessmentDataAccess.AddStrategicAssessments(newItems);

            foreach (var strategicAssessment in existing)
            {
                _strategicAssessmentDataAccess.UpdateStrategicAssessment(strategicAssessment.ConvertToStrategicAssessmentTable(strategicAssessment));
            }

            return uamp;
        }

        public UserImmovableAssetManagementPlan SaveTempleteFour(UserImmovableAssetManagementPlan uamp)
        {
            List<AcquisitionPlan> acquisitionPlans = new List<AcquisitionPlan>();
            acquisitionPlans.AddRange(uamp.TempleteFourPointOne?.AcquisitionPlans ?? new List<AcquisitionPlan>());
            acquisitionPlans.AddRange(uamp.TempleteFourPointTwo?.AcquisitionPlans ?? new List<AcquisitionPlan>());

            var newItems = acquisitionPlans.Where(a => a.Id == 0).Select(a => a.ConvertToAcquisitionPlanTable(a)).ToList();
            var existing = acquisitionPlans.Where(a => a.Id != 0).ToList();

            if (newItems.Any())
                _acquisitionPlanDataAccess.AddAcquisitionPlans(newItems);

            foreach (var acquisitionPlan in existing)
            {
                _acquisitionPlanDataAccess.UpdateAcquisitionPlan(acquisitionPlan.ConvertToAcquisitionPlanTable(acquisitionPlan));
            }

            return uamp;
        }

        public UserImmovableAssetManagementPlan SaveTempleteFive(UserImmovableAssetManagementPlan uamp)
        {
            List<OperationPlan> operationPlans = new List<OperationPlan>();
            if (uamp.TempleteFivePointOne?.OperationPlans != null && uamp.TempleteFivePointOne.OperationPlans.Count > 0)
                operationPlans.AddRange(uamp.TempleteFivePointOne.OperationPlans);
            if (uamp.TempleteFivePointTwo?.OperationPlans != null)
                operationPlans.AddRange(uamp.TempleteFivePointTwo.OperationPlans);
            if (uamp.TempleteFivePointThree?.OperationPlans != null)
                operationPlans.AddRange(uamp.TempleteFivePointThree.OperationPlans);

            var newItems = operationPlans.Where(op => op.Id == 0).Select(op => op.ConvertToOperationPlanTable(op)).ToList();
            var existing = operationPlans.Where(op => op.Id != 0).ToList();

            if (newItems.Any())
                _operationPlanDataAccess.AddOperationPlans(newItems);

            foreach (var operationPlan in existing)
            {
                _operationPlanDataAccess.UpdateOperationPlan(operationPlan.ConvertToOperationPlanTable(operationPlan));
            }

            return uamp;
        }

        public UserImmovableAssetManagementPlan SaveTempleteSix(UserImmovableAssetManagementPlan uamp)
        {
            List<SurrenderPlan> surrenderPlans = uamp.TempleteSix?.SurrenderPlans ?? new List<SurrenderPlan>();
            var newItems = surrenderPlans.Where(s => s.Id == 0).Select(s => s.ConvertToSurrenderPlanTable(s)).ToList();
            var existing = surrenderPlans.Where(s => s.Id != 0).ToList();

            // Add batch method does not exist for SurrenderPlanRepository yet; fall back to per-item add for now
            foreach (var s in newItems)
            {
                _surrenderPlanDataAccess.AddSurrenderPlan(s);
            }

            foreach (var surrenderPlan in existing)
            {
                _surrenderPlanDataAccess.UpdateSurrenderPlan(surrenderPlan.ConvertToSurrenderPlanTable(surrenderPlan));
            }

            return uamp;
        }

        public UserImmovableAssetManagementPlan SaveTempleteSeven(UserImmovableAssetManagementPlan uamp)
        {
            List<MtefBudgetPeriod> _mtefBudgetPeriods = new List<MtefBudgetPeriod>();
            List<MtefBudgetPeriod> mtefBudgetPeriods = uamp.TempleteSeven.MtefBudgetPeriods.ToList();
            var newItems = mtefBudgetPeriods.Where(m => m.Id == 0).Select(m => m.ConvertToMtefBudgetPeriodTable(m)).ToList();
            var existing = mtefBudgetPeriods.Where(m => m.Id != 0).ToList();

            // MtefBudgetPeriodRepository has no batch add; fall back to per-item add
            foreach (var m in newItems)
            {
                _mtefBudgetPeriodDataAccess.AddMtefBudgetPeriod(m);
            }

            foreach (var mtefBudgetPeriod in existing)
            {
                _mtefBudgetPeriodDataAccess.UpdateMtefBudgetPeriod(mtefBudgetPeriod.ConvertToMtefBudgetPeriodTable(mtefBudgetPeriod));
            }

            uamp.TempleteSeven.MtefBudgetPeriods = _mtefBudgetPeriods;
            return uamp;
        }

        public bool DeleteOperationPlan(OperationPlan operationPlan)
        {
            _operationPlanDataAccess.DeleteOperationPlan(operationPlan.ConvertToOperationPlanTable(operationPlan));
            return true;
        }

        public bool DeleteAcquisitionPlan(AcquisitionPlan acquisitionPlan)
        {
            _acquisitionPlanDataAccess.DeleteAcquisitionPlan(acquisitionPlan.ConvertToAcquisitionPlanTable(acquisitionPlan));
            return true;
        }

        public bool DeleteProgramme(Programme programme)
        {
            _programmeDataAccess.DeleteProgramme(programme.ConvertToProgrammeTable(programme));
            return true;
        }

        public bool DeleteProperty(Property property)
        {
            _propertyDataAccess.DeleteProperty(property.ConvertToPropertyTable(property));
            return true;
        }

        public bool DeleteStrategicAssessment(StrategicAssessment strategicAssessment)
        {
            _strategicAssessmentDataAccess.DeleteStrategicAssessment(strategicAssessment.ConvertToStrategicAssessmentTable(strategicAssessment));
            return true;
        }

        public bool DeleteSurrenderPlan(SurrenderPlan surrenderPlan)
        {
            _surrenderPlanDataAccess.DeleteSurrenderPlan(surrenderPlan.ConvertToSurrenderPlanTable(surrenderPlan));
            return true;
        }

        public UserImmovableAssetManagementPlan SaveTempleteTwo(UserImmovableAssetManagementPlan uamp)
        {
            List<Property> properties = new List<Property>();
            properties.AddRange(uamp.TempleteTwoPointOne?.Properties ?? new List<Property>());
            properties.AddRange(uamp.TempleteTwoPointTwo?.Properties ?? new List<Property>());

            var newItems = properties.Where(p => p.Id == 0).Select(p => p.ConvertToPropertyTable(p)).ToList();
            var existing = properties.Where(p => p.Id != 0).ToList();

            if (newItems.Any())
                _propertyDataAccess.AddProperties(newItems);

            foreach (var property in existing)
            {
                _propertyDataAccess.UpdateProperty(property.ConvertToPropertyTable(property));
            }

            return uamp;
        }

        public UserImmovableAssetManagementPlan StartUserImmovableAssetManagementPlan(UserImmovableAssetManagementPlan uamp)
        {
            var facilities = _facilityDataAccess.GetSignedOffFacilities();
            uamp = SaveUamp(uamp);
            MtefBudgetPeriod mtefBudgetPeriod = new MtefBudgetPeriod();

            uamp.TempleteOne = new TempleteOne()
            {
                Id = 0,
                Programmes = new List<Programme>(),
                OptimalSupportingAccommodation = new OptimalSupportingAccommodation()
            };
            uamp.TempleteTwoPointOne = new TempleteTwoPointOne
            {
                Id = 0,
                Properties = facilities.Select(f => new Property()
                {
                    Id = 0,
                    UserImmovableAssetManagementPlanId = uamp.Id,
                    TempleteNumber = 2.1,
                    FileReferenceNo = f.FileReference,
                    SerialNo = f.FileReference,
                    DistrictRegion = f.Land.GeographicalLocation != null ? f.Land.GeographicalLocation.Region : null,
                    Town = f.Land.GeographicalLocation != null ? f.Land.GeographicalLocation.Town : null,
                    LocalAuthority = f.Land.GeographicalLocation != null ? f.Land.GeographicalLocation.LocalAuthority : null,
                    AssetDescription = f.Land.GeographicalLocation != null ? f.Name : null,
                        CurrentStreetAddress = f.Land.GeographicalLocation != null ? string.Format("{0} {1} {2} {3}", f.Land.GeographicalLocation.StreetNumber, f.Land.GeographicalLocation.StreetName, f.Land.GeographicalLocation.Suburb, f.Land.GeographicalLocation.Province) : null,
                        PropertyDescription = f.Land.PropertyDescription != null ? f.Land.PropertyDescription.OldDescription : null,
                        AssetType = f.Land.Type,
                        ExtentofLand = f.Land.PropertyDescription != null ? f.Land.PropertyDescription.Extent : null,
                        PropertyRatesTaxes = null,
                        OperationalCosts = null,
                        NoofParkingBays = null,
                        RequiredPerformanceStandard = null,
                        Accessibility = null,
                        ConditionRating = null,
                        SuitabilityIndex = null,
                        OperatingPerformanceIndex = null,
                        FunctionalPerformanceIndex = null,
                        MunicipalUtilityServices = new List<MunicipalUtilityService>(),
                    }).ToList(),
                };

                uamp.TempleteTwoPointTwo = new TempleteTwoPointTwo
                {
                    Id = 0,
                    Properties = facilities.Where(f => f.Land.LandUseManagementDetail.IncomeLeaseStatus == "Yes").Select(f => new Property()
                    {
                        Id = 0,
                        UserImmovableAssetManagementPlanId = uamp.Id,
                        TempleteNumber = 2.2,
                        FileReferenceNo = f.FileReference,
                        SerialNo = f.FileReference,
                        AssetType = f.Land.Type,
                        DistrictRegion = f.Land.GeographicalLocation != null ? f.Land.GeographicalLocation.Region : null,
                        Town = f.Land.GeographicalLocation != null ? f.Land.GeographicalLocation.Town : null,
                        LocalAuthority = f.Land.GeographicalLocation != null ? f.Land.GeographicalLocation.LocalAuthority : null,
                        AssetDescription = f.Land.GeographicalLocation != null ? f.Name : null,
                        OldStreetAddress = f.Land.GeographicalLocation != null ? string.Format("{0} {1} {2} {3}", f.Land.GeographicalLocation.StreetNumber, f.Land.GeographicalLocation.StreetName, f.Land.GeographicalLocation.Suburb, f.Land.GeographicalLocation.Province) : null,
                        CurrentStreetAddress = f.Land.GeographicalLocation != null ? string.Format("{0} {1} {2} {3}", f.Land.GeographicalLocation.StreetNumber, f.Land.GeographicalLocation.StreetName, f.Land.GeographicalLocation.Suburb, f.Land.GeographicalLocation.Province) : null,
                        PropertyDescription = f.Land.PropertyDescription != null ? f.Land.PropertyDescription.OldDescription : null,
                        ExtentofLand = f.Land.PropertyDescription != null ? f.Land.PropertyDescription.Extent : null,         
                        NoofParkingBays = null,
                        LettableSpace = null,
                        LeaseEndDate = null,
                        LeaseStartDate = null,
                        RentalRate = null,
                        RequiredPerformanceStandard = null,
                        Accessibility = null,
                        ConditionRating = null,
                        SuitabilityIndex = null,
                        OperatingPerformanceIndex = null,
                        FunctionalPerformanceIndex = null,
                        Comment = null
                    }).ToList(),
                };

                uamp.TempleteThree = new TempleteThree()
                {
                    Id = 0,
                    StrategicAssessments = new List<StrategicAssessment>()
                };

                uamp.TempleteFourPointOne = new TempleteFourPointOne()
                {
                    Id = 0,
                    AcquisitionPlans = new List<AcquisitionPlan>()
                };

                uamp.TempleteFourPointTwo = new TempleteFourPointTwo()
                {
                    Id = 0,
                    AcquisitionPlans = facilities.Where(f => f.Land.LeaseStatus.TerminationDate <= DateTime.Today).Select(f => new AcquisitionPlan()
                    {
                        Id = 0,
                        UserImmovableAssetManagementPlanId = uamp.Id,
                        TempleteNumber = 4.2,
                        DistrictRegion = f.Land.GeographicalLocation != null ? f.Land.GeographicalLocation.Region : null,
                        Town = f.Land.GeographicalLocation != null ? f.Land.GeographicalLocation.Town : null,
                        BudgetType = null,
                        Extent = f.Land.PropertyDescription != null ? f.Land.PropertyDescription.Extent : null,
                        InitialNeedYear = null,
                        AcquisitionType = null,
                        Status = null,
                        TotalAmountRequired = null,
                        CashFlowYear1 = null,
                        CashFlowYear2 = null,
                        CashFlowYear3 = null,
                        CashFlowYear4 = null,
                        CashFlowYear5 = null,
                    }).ToList()
                };

                uamp.TempleteFivePointOne = new TempleteFivePointOne()
                {
                    Id = 0,
                    OperationPlans = facilities.Select(f => new OperationPlan()
                    {
                        Id = 0,
                        UserImmovableAssetManagementPlanId = uamp.Id,
                        TempleteNumber = 5.1,                        
                        DistrictRegion = f.Land.GeographicalLocation != null ? f.Land.GeographicalLocation.Region : null,
                        Town = f.Land.GeographicalLocation != null ? f.Land.GeographicalLocation.Town : null,
                        AssetDescription = f.Land.GeographicalLocation != null ? f.Name : null,
                        PropertyDescription = f.Land.PropertyDescription != null ? f.Land.PropertyDescription.OldDescription : null,
                        ExtentofLand = f.Land.PropertyDescription != null ? f.Land.PropertyDescription.Extent : null,
                        NoofParkingBays = null,
                        ServiceDescription = null,
                        RepairDescription = null,
                        PrioityServiceReanking = null,
                        StreetDescription = null,
                        LeaseType = null,
                        UsableSpace = null,
                        ConstructionArea = null,
                        LeaseStartDate = f.Land.LeaseStatus != null ? f.Land.LeaseStatus.StartingDate : null,
                        LeaseEndDate = f.Land.LeaseStatus != null ? f.Land.LeaseStatus.TerminationDate : null,
                        RentalPmPa = null,
                        InitialNeedYear = null,
                        Status = null,
                        TotalAmountRequired = null,
                        CashFlowYear1 = null,
                        CashFlowYear2 = null,
                        CashFlowYear3 = null,
                        CashFlowYear4 = null,
                        CashFlowYear5 = null,
                        Comment = null
                    }).ToList(),
                };
                uamp.TempleteFivePointTwo = new TempleteFivePointTwo()
                {
                    Id = 0,
                    OperationPlans = facilities.Where(f => f.Land.LeaseStatus.TerminationDate <= DateTime.Today).Select(f => new OperationPlan()
                    {
                        Id = 0,
                        UserImmovableAssetManagementPlanId = uamp.Id,
                        TempleteNumber = 5.2,
                        DistrictRegion = f.Land.GeographicalLocation != null ? f.Land.GeographicalLocation.Region : null,
                        Town = f.Land.GeographicalLocation != null ? f.Land.GeographicalLocation.Town : null,
                        LocalMunicipality = f.Land.GeographicalLocation != null ? f.Land.GeographicalLocation.LocalAuthority : null,
                        AssetDescription = f.Land.GeographicalLocation != null ? f.Name : null,
                        StreetDescription = f.Land.GeographicalLocation != null ? string.Format("{0} {1} {2} {3}", f.Land.GeographicalLocation.StreetNumber, f.Land.GeographicalLocation.StreetName, f.Land.GeographicalLocation.Suburb, f.Land.GeographicalLocation.Province) : null,
                        PropertyDescription = f.Land.PropertyDescription != null ? f.Land.PropertyDescription.OldDescription : null,
                        ExtentofLand = f.Land.PropertyDescription != null ? f.Land.PropertyDescription.Extent : null,
                    }).ToList(),
                };
                uamp.TempleteFivePointThree = new TempleteFivePointThree()
                {
                    Id = 0,
                    OperationPlans = facilities.Select(f => new OperationPlan()
                    {
                        Id = 0,
                        UserImmovableAssetManagementPlanId = uamp.Id,
                        TempleteNumber = 5.3,
                        DistrictRegion = f.Land.GeographicalLocation != null ? f.Land.GeographicalLocation.Region : null,
                        Town = f.Land.GeographicalLocation != null ? f.Land.GeographicalLocation.Town : null,
                        LocalMunicipality = f.Land.GeographicalLocation != null ? f.Land.GeographicalLocation.LocalAuthority : null,
                        AssetDescription = f.Land.GeographicalLocation != null ? f.Name : null,
                        StreetDescription = f.Land.GeographicalLocation != null ? string.Format("{0} {1} {2} {3}", f.Land.GeographicalLocation.StreetNumber, f.Land.GeographicalLocation.StreetName, f.Land.GeographicalLocation.Suburb, f.Land.GeographicalLocation.Province) : null,
                        PropertyDescription = f.Land.PropertyDescription != null ? f.Land.PropertyDescription.OldDescription : null,
                        ExtentofLand = f.Land.PropertyDescription != null ? f.Land.PropertyDescription.Extent : null,
                    }).ToList(),
                };
                uamp.TempleteSix = new TempleteSix()
                {
                    Id = 0,
                    SurrenderPlans = facilities.Where(f => f.Land.LeaseStatus.TerminationDate <= DateTime.Today).Select(f => new SurrenderPlan()
                    {
                        Id = 0,
                        UserImmovableAssetManagementPlanId = uamp.Id,
                        DistrictRegion = f.Land.GeographicalLocation != null ? f.Land.GeographicalLocation.Region : null,
                        Town = f.Land.GeographicalLocation != null ? f.Land.GeographicalLocation.Town : null,
                        LocalMunicipality = f.Land.GeographicalLocation != null ? f.Land.GeographicalLocation.LocalAuthority : null,
                        AssetType = f.Type,
                        CurrentStreetAddress = f.Land.GeographicalLocation != null ? string.Format("{0} {1} {2} {3}", f.Land.GeographicalLocation.StreetNumber, f.Land.GeographicalLocation.StreetName, f.Land.GeographicalLocation.Suburb, f.Land.GeographicalLocation.Province) : null,
                        PropertyDescription = f.Land.PropertyDescription != null ? f.Land.PropertyDescription.OldDescription : null,
                        ExtentofLand = f.Land.PropertyDescription != null ? f.Land.PropertyDescription.Extent : null,
                    }).ToList(),
                };
                uamp.TempleteSeven = new TempleteSeven()
                {
                    Id = 0,
                    MtefBudgetPeriods = mtefBudgetPeriod.BuildMtefBudgetPeriod(uamp.Id)
                };

            uamp = SaveTempleteTwo(uamp);
            uamp = SaveTempleteThree(uamp);
            uamp = SaveTempleteFour(uamp);
            uamp = SaveTempleteFive(uamp);
            uamp = SaveTempleteSix(uamp);
            uamp = SaveTempleteSeven(uamp);
            uamp.User = GetUserById(uamp.UserId);
            return uamp;
        }

        public User GetUserById(int userId)
        {
            var userdb = _userDataAccess.GetUser(userId);
            User user = new User()
            {
                Id = userdb.Id,
                Name = userdb.Name,
                Surname = userdb.Surname,
                Email = userdb.Email
            };
            return user;
        }

        public List<Programme> SaveProgramme(List<Programme> programmes)
        {
            var newItems = programmes.Where(p => p.Id == 0).Select(p => p.ConvertToProgrammeTable(p)).ToList();
            var existing = programmes.Where(p => p.Id != 0).ToList();

            if (newItems.Any())
                _programmeDataAccess.AddProgrammes(newItems);

            foreach (var programme in existing)
            {
                _programmeDataAccess.UpdateProgramme(programme.ConvertToProgrammeTable(programme));
            }

            // assign generated ids back where possible (best-effort: assumes AddProgrammes appended in same order)
            // If callers require exact Id mapping, repository should return ids; keep current behavior minimal-change.
            return programmes;
        }

        public UserImmovableAssetManagementPlan SaveOptimalSupportingAccommodationRepository(UserImmovableAssetManagementPlan uamp)
        {
            OptimalSupportingAccommodation optimalSupportingAccommodation = new OptimalSupportingAccommodation();
            if (uamp.TempleteOne.OptimalSupportingAccommodation.Id == 0)
                uamp.TempleteOne.OptimalSupportingAccommodation.Id = _optimalSupportingAccommodationDataAccess.AddOptimalSupportingAccommodation(optimalSupportingAccommodation.ConvertToOptimalSupportingAccommodationTable(uamp.TempleteOne.OptimalSupportingAccommodation));
            else
                _optimalSupportingAccommodationDataAccess.UpdateOptimalSupportingAccommodation(optimalSupportingAccommodation.ConvertToOptimalSupportingAccommodationTable(uamp.TempleteOne.OptimalSupportingAccommodation));
            return uamp;
        }

        public TempleteOne GetUAMPTempleteOne(int uampId)
        {
            TempleteOne templeteOne = new TempleteOne();
            DataAccess.Tables.OptimalSupportingAccommodation optimalSupportingAccommodation = new DataAccess.Tables.OptimalSupportingAccommodation();
            List<DataAccess.Tables.Programme> programmes = new List<DataAccess.Tables.Programme>();
            programmes = _programmeDataAccess.GetProgrammes(uampId);

            optimalSupportingAccommodation = _optimalSupportingAccommodationDataAccess.GetOptimalSupportingAccommodation(uampId);

            return templeteOne.ConvertToTempleteOne(programmes, optimalSupportingAccommodation);
        }

        public TempleteTwoPointOne GetUAMPTempleteTwoPointOne(int uampId)
        {
            TempleteTwoPointOne templeteTwoPointOne = new TempleteTwoPointOne();
            List<DataAccess.Tables.Property> properties = new List<DataAccess.Tables.Property>();
            double temNumber = 2.1;
            properties = _propertyDataAccess.GetProperties(uampId, temNumber);
            templeteTwoPointOne = templeteTwoPointOne.ConvertToTempleteTwoPointOne(properties);

            return templeteTwoPointOne;
        }

        public TempleteTwoPointTwo GetUAMPTempleteTwoPointTwo(int uampId)
        {
            TempleteTwoPointTwo templeteTwoPointTwo = new TempleteTwoPointTwo();
            List<DataAccess.Tables.Property> properties = new List<DataAccess.Tables.Property>();
            double temNumber = 2.2;
            properties = _propertyDataAccess.GetProperties(uampId, temNumber);
            templeteTwoPointTwo = templeteTwoPointTwo.ConvertToTempleteTwoPointTwo(properties);

            return templeteTwoPointTwo;
        }

        public TempleteThree GetUAMPTempleteThree(int uampId)
        {
            TempleteThree templeteThree = new TempleteThree();
            List<DataAccess.Tables.StrategicAssessment> strategicAssessments = new List<DataAccess.Tables.StrategicAssessment>();
            strategicAssessments = _strategicAssessmentDataAccess.GetStrategicAssessments(uampId);
            templeteThree = templeteThree.ConvertToTempleteThree(strategicAssessments);

            return templeteThree;
        }

        public TempleteFourPointOne GetUAMPTempleteFourPointOne(int uampId)
        {
            TempleteFourPointOne templeteFourPointOne = new TempleteFourPointOne();
            List<DataAccess.Tables.AcquisitionPlan> acquisitionPlans = new List<DataAccess.Tables.AcquisitionPlan>();
            double temNumber = 4.1;
            acquisitionPlans = _acquisitionPlanDataAccess.GetAcquisitionPlans(uampId, temNumber);
            templeteFourPointOne = templeteFourPointOne.ConvertToTempleteFourPointOne(acquisitionPlans);

            return templeteFourPointOne;            
        }

        public TempleteFourPointTwo GetUAMPTempleteFourPointTwo(int uampId)
        {
            TempleteFourPointTwo templeteFourPointTwo = new TempleteFourPointTwo();
            List<DataAccess.Tables.AcquisitionPlan> acquisitionPlans = new List<DataAccess.Tables.AcquisitionPlan>();
            double temNumber = 4.2;
            acquisitionPlans = _acquisitionPlanDataAccess.GetAcquisitionPlans(uampId, temNumber);
            templeteFourPointTwo = templeteFourPointTwo.ConvertToTempleteFourPointTwo(acquisitionPlans);

            return templeteFourPointTwo;
        }

        public TempleteFivePointOne GetUAMPTempleteFivePointOne(int uampId)
        {
            TempleteFivePointOne templeteFivePointOne = new TempleteFivePointOne();
            List<DataAccess.Tables.OperationPlan> operationPlan = new List<DataAccess.Tables.OperationPlan>();
            double temNumber = 5.1;
            operationPlan = _operationPlanDataAccess.GetOperationPlans(uampId, temNumber);
            templeteFivePointOne = templeteFivePointOne.ConvertToTempleteFivePointOne(operationPlan);

            return templeteFivePointOne;
        }

        public TempleteFivePointTwo GetUAMPTempleteFivePointTwo(int uampId)
        {
            TempleteFivePointTwo templeteFivePointTwo = new TempleteFivePointTwo();
            List<DataAccess.Tables.OperationPlan> operationPlan = new List<DataAccess.Tables.OperationPlan>();
            double temNumber = 5.2;
            operationPlan = _operationPlanDataAccess.GetOperationPlans(uampId, temNumber);
            templeteFivePointTwo = templeteFivePointTwo.ConvertToTempleteFivePointTwo(operationPlan);

            return templeteFivePointTwo;
        }

        public TempleteFivePointThree GetUAMPTempleteFivePointThree(int uampId)
        {
            TempleteFivePointThree templeteFivePointThree = new TempleteFivePointThree();
            List<DataAccess.Tables.OperationPlan> operationPlan = new List<DataAccess.Tables.OperationPlan>();
            double temNumber = 5.3;
            operationPlan = _operationPlanDataAccess.GetOperationPlans(uampId, temNumber);
            templeteFivePointThree = templeteFivePointThree.ConvertToTempleteFivePointThree(operationPlan);

            return templeteFivePointThree;
        }

        public TempleteSix GetUAMPTempleteSix(int uampId)
        {
            TempleteSix templeteSix = new TempleteSix();
            List<DataAccess.Tables.SurrenderPlan> surrenderPlans = new List<DataAccess.Tables.SurrenderPlan>();
            surrenderPlans = _surrenderPlanDataAccess.GetSurrenderPlans(uampId);
            templeteSix = templeteSix.ConvertToTempleteSix(surrenderPlans);

            return templeteSix;
        }

        public TempleteSeven GetUAMPTempleteSeven(int uampId)
        {
            TempleteSeven templeteSeven = new TempleteSeven();
            List<DataAccess.Tables.MtefBudgetPeriod> mtefBudgetPeriods = new List<DataAccess.Tables.MtefBudgetPeriod>();
            mtefBudgetPeriods = _mtefBudgetPeriodDataAccess.GetMtefBudgetPeriods(uampId);
            templeteSeven = templeteSeven.ConvertToTempleteSeven(mtefBudgetPeriods);

            return templeteSeven;
        }

        // Business-layer repository does not manage unmanaged resources; rely on data-access layer.
    }
}
