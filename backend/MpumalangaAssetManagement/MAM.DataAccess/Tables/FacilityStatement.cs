using System;

namespace MAM.DataAccess.Tables
{
    public class FacilityStatement
    {
        public int Id { get; set; }
        public string OpeningBalance { get; set; }
        public string ValueAdjustment { get; set; }
        public string PpeaIN { get; set; }
        public string PpeaOut { get; set; }
        public string Disposal { get; set; }
        public string Additions { get; set; }
        public int Year { get; set; }
        public string ClosingBalance { get; set; }
        public string ClientCode { get; set; }
        public int FacilityType { get; set; }
    }
}
