using MAM.DataAccess.Tables;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;

using System.Text;

namespace MAM.DataAccess
{
    public class DataContext : DbContext
    {
        private string _connectionString { get; set; }

        public DataContext(string connectionString)
        {
            _connectionString = connectionString;
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Facility> Facilities { get; set; }
        public DbSet<LandFacility> LandFacilities { get; set; }
        public DbSet<NonResidentialFacility> NonResidentialFacilities { get; set; }
        public DbSet<DwellingFacility> DwellingFacilities { get; set; }
        public DbSet<FacilityStatement> FacilityStatements { get; set; }
        public DbSet<Land> Lands { get; set; }
        public DbSet<GeographicalLocation> GeographicalLocations { get; set; }
        public DbSet<PropertyDescription> PropertyDescriptions { get; set; }
        public DbSet<LandUseManagementDetail> LandUseManagementDetails { get; set; }
        public DbSet<LeaseStatus> LeaseStatuses { get; set; }
        public DbSet<Improvement> Improvements { get; set; }
        public DbSet<Finance> Finances { get; set; }
        public DbSet<SecondaryInformationNote> SecondaryInformationNotes { get; set; }
        public DbSet<Valuation> Valuations { get; set; }
        public DbSet<Programme> Programmes { get; set; }
        public DbSet<FunctionalPerformance> FunctionalPerformance { get; set; }
        public DbSet<Utilisation> Utilisation { get; set; }
        public DbSet<AcquisitionPlan> AcquisitionPlans { get; set; }
        public DbSet<MtefBudgetPeriod> MtefBudgetPeriods { get; set; }
        public DbSet<MunicipalUtilityService> MunicipalUtilityServices { get; set; }    
        public DbSet<OperationPlan> OperationPlans { get; set; }
        public DbSet<Property> Properties { get; set; }
        public DbSet<StrategicAssessment> StrategicAssessments { get; set; }
        public DbSet<SurrenderPlan> SurrenderPlans { get; set; }
        public DbSet<UserImmovableAssetManagementPlan> UserImmovableAssetManagementPlans { get; set; }
        public DbSet<OptimalSupportingAccommodation> OptimalSupportingAccommodations { get; set; }
        public DbSet<ConditionAssessment> ConditionAssessments { get; set; }
        public DbSet<HiredProperty> HiredProperties { get; set; }
        public DbSet<Camp> Camps { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<ProjectSupplier> ProjectSuppliers { get; set; }
        public DbSet<Supplier> Suppliers { get; set; }
        public DbSet<Fault> Faults { get; set; }

        public DbSet<FaultNote> FaultNotes { get; set; }
        
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer(_connectionString, o => o.CommandTimeout(280));
        }
    }
}
