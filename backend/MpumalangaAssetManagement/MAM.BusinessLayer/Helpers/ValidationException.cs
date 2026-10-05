using System;

namespace MAM.BusinessLayer.Helpers
{
    /// <summary>
    /// Exception thrown for business-level validation errors. Handled specially by middleware
    /// to return a 400 response with a safe message.
    /// </summary>
    public class ValidationException : Exception
    {
        public ValidationException(string message) : base(message)
        {
        }
    }
}
