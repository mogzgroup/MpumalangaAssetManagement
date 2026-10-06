using MAM.BusinessLayer.Interfaces;
using MAM.BusinessLayer.Model;
using MAM.BusinessLayer.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace MAM.BusinessLayer.Repositories
{
    public class FaultRepository: IFaultRepository
    {
        private AppSettings appSettings { get; set; }
        private readonly MAM.DataAccess.Interfaces.IFault _faultDataAccess;
        private readonly MAM.DataAccess.Interfaces.IFaultNote _faultNoteDataAccess;

        public FaultRepository(AppSettings settings, MAM.DataAccess.Interfaces.IFault faultDataAccess, MAM.DataAccess.Interfaces.IFaultNote faultNoteDataAccess)
        {
            appSettings = settings;
            _faultDataAccess = faultDataAccess;
            _faultNoteDataAccess = faultNoteDataAccess;
        }
        public List<Fault> GetFaults()
        {
            Fault Fault = new Fault();
            List<Fault> properties = Fault.ConvertToFaults(_faultDataAccess.GetFaults());
            return properties;
        }

        public Fault GetFaultByReferenceNo(string referenceNo)
        {
            Fault Fault = new Fault();
            Fault fault = Fault.ConvertToFault(_faultDataAccess.GetFaultByReferenceNo(referenceNo));
            return fault;
        }

        public bool UpdateFault(Fault fault)
        {
            _faultDataAccess.UpdateFault(fault.ConvertToFaultTable(fault));
            DeleteFaultNotesByFaultId(fault.Id);
            AddFaultNote(fault.FaultNotes);
            return true;
        }

        public bool DeleteFault(Fault fault)
        {
            _faultDataAccess.UpdateFault(fault.ConvertToFaultTable(fault));
            return true;
        }

        public int AddFault(Fault fault)
        {
            return _faultDataAccess.AddFault(fault.ConvertToFaultTable(fault));
        }

        public List<FaultNote> AddFaultNote(List<FaultNote> faultNotes)
        {
            // Handle null or empty lists gracefully to avoid NullReferenceException when callers pass null
            if (faultNotes == null || faultNotes.Count == 0)
                return new List<FaultNote>();

            FaultNote faultNote = new FaultNote();
            foreach (var item in faultNotes)
            {
                item.Id = 0;
                _faultNoteDataAccess.AddFaultNote(faultNote.ConvertToFaultNoteTable(item));
            }
            return faultNotes;
        }

        public void DeleteFaultNotesByFaultId(int faultId)
        {
            _faultNoteDataAccess.DeleteFaultNotesByFaultId(faultId);
        }

        // Business-layer repository does not hold unmanaged resources; rely on data-access layer for disposals.
    }
}
