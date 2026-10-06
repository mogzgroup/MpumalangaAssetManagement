using MAM.DataAccess.Tables;
using System;
using System.Collections.Generic;

namespace MAM.DataAccess.Interfaces
{
    public interface IProjectSupplier
    {
        int AddProjectSupplier(ProjectSupplier projectSupplier);
        void UpdateProjectSupplier(ProjectSupplier projectSupplier);
        void DeleteProjectSupplierById(int projectId);
        List<ProjectSupplier> GetProjectSuppliers();
        ProjectSupplier GetProjectSupplierById(int id);
    }
}
