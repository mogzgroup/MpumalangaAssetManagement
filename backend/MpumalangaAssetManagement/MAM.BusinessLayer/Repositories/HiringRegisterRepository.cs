using MAM.BusinessLayer.Interfaces;
using MAM.BusinessLayer.Model;
using MAM.BusinessLayer.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace MAM.BusinessLayer.Repositories
{
    public class HiringRegisterRepository: IHiringRegisterRepository
    {
        private AppSettings appSettings { get; set; }
        private readonly MAM.DataAccess.Interfaces.IHiredPropertyRepository _hiredPropertyDataAccess;

        public HiringRegisterRepository(AppSettings settings, MAM.DataAccess.Interfaces.IHiredPropertyRepository hiredPropertyDataAccess)
        {
            appSettings = settings;
            _hiredPropertyDataAccess = hiredPropertyDataAccess;
        }
        public List<HiredProperty> GetHiredProperties()
        {
            HiredProperty hiredProperty = new HiredProperty();
            List<HiredProperty> properties = hiredProperty.ConvertToHiredProperties(_hiredPropertyDataAccess.GetHiredProperties());
            return properties;
        }
        public bool UpdateHiredProperty(HiredProperty hiredProperty)
        {
            _hiredPropertyDataAccess.UpdateHiredProperty(hiredProperty.ConvertToHiredPropertyTable(hiredProperty));
            return true;
        }

        public bool DeleteHiredProperty(HiredProperty hiredProperty)
        {
            _hiredPropertyDataAccess.DeleteHiredProperty(hiredProperty.ConvertToHiredPropertyTable(hiredProperty));
            return true;
        }

        public int AddHiredProperty(HiredProperty hiredProperty)
        {
            return _hiredPropertyDataAccess.AddHiredProperty(hiredProperty.ConvertToHiredPropertyTable(hiredProperty));
        }

        // Business-layer repository does not own unmanaged resources; data-access layer handles disposal.
    }
}
