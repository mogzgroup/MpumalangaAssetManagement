using MAM.DataAccess.Tables;
using System;
using System.Collections.Generic;

namespace MAM.DataAccess.Interfaces
{
    public interface IFinance
    {
        #region Finance
        int AddFinance(Finance finance);
        void UpdateFinance(Finance finance);
        List<Finance> GetFinances();
        Finance GetFinanceById(int id);
        #endregion

        #region  Secondary information note
        int AddSecondaryInformationNote(SecondaryInformationNote secondaryInformationNote);
        void UpdateSecondaryInformationNote(SecondaryInformationNote secondaryInformationNote);
        List<SecondaryInformationNote> GetSecondaryInformationNotes();
        SecondaryInformationNote GetSecondaryInformationNoteById(int id);
        #endregion

        #region Valuation
        int AddValuation(Valuation valuation);
        void UpdateValuation(Valuation valuation);
        List<Valuation> GetValuations();
        Valuation GetValuationById(int id);
        #endregion
    }
}
