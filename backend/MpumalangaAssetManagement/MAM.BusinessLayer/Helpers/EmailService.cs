using MAM.BusinessLayer.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Mail;
using System.Text;

namespace MAM.BusinessLayer.Helpers
{
    public class EmailService
    {
        private AppSettings appSettings { get; set; }

        public EmailService(AppSettings settings)
        {
            appSettings = settings;
        }
        private bool IsEmailConfigured()
        {
            return !string.IsNullOrWhiteSpace(appSettings?.EmailUserName)
                   && !string.IsNullOrWhiteSpace(appSettings?.EmailPassword)
                   && !string.IsNullOrWhiteSpace(appSettings?.EmailHost)
                   && !string.IsNullOrWhiteSpace(appSettings?.FromEmailAddress)
                   && appSettings.EmailPot > 0;
        }
        public void SendResertPasswordEmail(DataAccess.Tables.User user, string decriptedPassword)
        {
            if (!IsEmailConfigured())
            {
                // Email not configured for this deployment; skip sending.
                return;
            }

            SmtpClient client = new SmtpClient
            {
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false,
                Host = appSettings.EmailHost,
                Timeout = 100000,
                Port = appSettings.EmailPot,
                Credentials = new NetworkCredential(appSettings.EmailUserName, appSettings.EmailPassword),
                EnableSsl = true
            };

            MailMessage mail = new MailMessage(appSettings.FromEmailAddress, user.Email);
            mail.Subject = "Password Reset : Asset Management.";
            string Body = string.Format("Hi {0} {1}, <br><br> Please note that your password has been reset by adminstrator. <br> Password: {2} <br> ", user.Name, user.Surname ,  decriptedPassword);
            mail.Body = Body;
            mail.IsBodyHtml = true;

            try
            {
                client.Send(mail);
            }
            catch (Exception ex)
            {
                // Log exception to database for diagnostics, but do not fail caller when email delivery is unavailable.
                LogExceptionToDb(ex, nameof(EmailService), "SendResertPasswordEmail");
            }
        }

        public void ForgotPasswordEmail(DataAccess.Tables.User user, string decriptedPassword)
        {
            if (!IsEmailConfigured())
            {
                return;
            }

            SmtpClient client = new SmtpClient
            {
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false,
                Host = appSettings.EmailHost,
                Timeout = 100000,
                Port = appSettings.EmailPot,
                Credentials = new NetworkCredential(appSettings.EmailUserName, appSettings.EmailPassword),
                EnableSsl = true
            };

            MailMessage mail = new MailMessage(appSettings.FromEmailAddress, user.Email);
            mail.Subject = "Forgot Password : Asset Management.";
            string Body = string.Format("Hi {0} {1}, <br><br> Here is the temporary password. <br> Password: {2} <br> <br> Please change this password once logged in.", user.Name, user.Surname, decriptedPassword);
            mail.Body = Body;
            mail.IsBodyHtml = true;

            try
            {
                client.Send(mail);
            }
            catch (Exception ex)
            {
                LogExceptionToDb(ex, nameof(EmailService), "ForgotPasswordEmail");
            }
        }

        public void NewUserEmail(DataAccess.Tables.User user, string realPassword)
        {
            if (!IsEmailConfigured())
            {
                return;
            }

            SmtpClient client = new SmtpClient
            {
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false,
                Host = appSettings.EmailHost,
                Timeout = 100000,
                Port = appSettings.EmailPot,
                Credentials = new NetworkCredential(appSettings.EmailUserName, appSettings.EmailPassword),
                EnableSsl = true
            };

            MailMessage mail = new MailMessage(appSettings.FromEmailAddress, user.Email);
            mail.Subject = "New User : Asset Management.";
            string Body = string.Format("Hi {0} {1}, <br><br> Please note that you have been added to Assert Management System by adminstrator. <br> Username: {2}<br> Password: {3} <br>  Login URL: {4}", user.Name, user.Surname, user.Username, realPassword, appSettings.WebAppURL);
            mail.Body = Body;
            mail.IsBodyHtml = true;

            try
            {
                client.Send(mail);
            }
            catch (Exception ex)
            {
                LogExceptionToDb(ex, nameof(EmailService), "NewUserEmail");
            }
        }

        private void LogExceptionToDb(Exception ex, string logger, string message)
        {
            try
            {
                // AppSettings contains ConnectionString; if not configured, skip DB logging.
                if (string.IsNullOrWhiteSpace(appSettings?.ConnectionString))
                    return;

                using (var ctx = new MAM.DataAccess.DataContext(appSettings.ConnectionString))
                {
                    var entry = new MAM.DataAccess.Tables.AuditLog
                    {
                        Id = Guid.NewGuid().ToString("N").Substring(0, 10),
                        Date = DateTime.UtcNow,
                        Thread = System.Threading.Thread.CurrentThread.ManagedThreadId.ToString(),
                        Level = "ERROR",
                        Logger = logger,
                        Message = message,
                        Exception = ex.ToString()
                    };

                    ctx.AuditLogs.Add(entry);
                    ctx.SaveChanges();
                }
            }
            catch
            {
                // Swallow any errors while logging to DB to avoid affecting primary flow (email sending).
            }
        }
    }
}
