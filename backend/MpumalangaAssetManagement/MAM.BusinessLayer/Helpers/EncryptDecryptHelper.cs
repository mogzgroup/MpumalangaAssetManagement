using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace MAM.BusinessLayer.Helpers
{
    public class EncryptDecryptHelper
    {
        // This constant is used to determine the keysize of the encryption algorithm in bits.
        // We divide this by 4 within the code below to get the equivalent number of bytes.
        private const int Keysize = 128;
        private const string PassPhrase = "abcd1234";

        // This constant determines the number of iterations for the password bytes generation function.
        private const int DerivationIterations = 1000;

        public static string Encrypt(string plainText)
        {
            // Salt and IV is randomly generated each time, but is preprended to encrypted cipher text
            // so that the same Salt and IV values can be used when decrypting.  
            var saltStringBytes = Generate128BitsOfRandomEntropy();
            var ivStringBytes = Generate128BitsOfRandomEntropy();
            var plainTextBytes = Encoding.UTF8.GetBytes(plainText);
            using (var password = new Rfc2898DeriveBytes(PassPhrase, saltStringBytes, DerivationIterations))
            {
                var keyBytes = password.GetBytes(Keysize / 8);
                using (var symmetricKey = new RijndaelManaged())
                {
                    symmetricKey.BlockSize = 128;
                    symmetricKey.Mode = CipherMode.CBC;
                    symmetricKey.Padding = PaddingMode.PKCS7;
                    using (var encryptor = symmetricKey.CreateEncryptor(keyBytes, ivStringBytes))
                    {
                        using (var memoryStream = new MemoryStream())
                        {
                            using (var cryptoStream = new CryptoStream(memoryStream, encryptor, CryptoStreamMode.Write))
                            {
                                cryptoStream.Write(plainTextBytes, 0, plainTextBytes.Length);
                                cryptoStream.FlushFinalBlock();
                                // Create the final bytes as a concatenation of the random salt bytes, the random iv bytes and the cipher bytes.
                                var cipherTextBytes = saltStringBytes;
                                cipherTextBytes = cipherTextBytes.Concat(ivStringBytes).ToArray();
                                cipherTextBytes = cipherTextBytes.Concat(memoryStream.ToArray()).ToArray();
                                memoryStream.Close();
                                cryptoStream.Close();
                                return Convert.ToBase64String(cipherTextBytes);
                            }
                        }
                    }
                }
            }
        }

        public static string Decrypt(string cipherText)
        {
            if (string.IsNullOrWhiteSpace(cipherText))
                return null;

            try
            {
                // Expect: [16 bytes of Salt] + [16 bytes of IV] + [n bytes of CipherText]
                var cipherTextBytesWithSaltAndIv = Convert.FromBase64String(cipherText);

                var minExpected = (Keysize / 8) * 2; // salt + iv
                if (cipherTextBytesWithSaltAndIv == null || cipherTextBytesWithSaltAndIv.Length <= minExpected)
                {
                    // malformed / truncated ciphertext stored in DB
                    // record a lightweight metric/log (no secrets). Use Trace to keep it low-volume.
                    System.Diagnostics.Trace.TraceWarning("Decrypt: malformed ciphertext detected (too short or null)");
                    return null;
                }

                // Get the salt bytes (first 16 bytes)
                var saltStringBytes = cipherTextBytesWithSaltAndIv.Take(Keysize / 8).ToArray();
                // Get the IV bytes (next 16 bytes)
                var ivStringBytes = cipherTextBytesWithSaltAndIv.Skip(Keysize / 8).Take(Keysize / 8).ToArray();
                // Get the actual cipher text bytes after salt+iv
                var cipherTextBytes = cipherTextBytesWithSaltAndIv.Skip((Keysize / 8) * 2).Take(cipherTextBytesWithSaltAndIv.Length - ((Keysize / 8) * 2)).ToArray();

                using (var password = new Rfc2898DeriveBytes(PassPhrase, saltStringBytes, DerivationIterations))
                {
                    var keyBytes = password.GetBytes(Keysize / 8);
                    using (var symmetricKey = new RijndaelManaged())
                    {
                        symmetricKey.BlockSize = 128;
                        symmetricKey.Mode = CipherMode.CBC;
                        symmetricKey.Padding = PaddingMode.PKCS7;

                        // Defensive: ensure IV is correct length
                        if (ivStringBytes == null || ivStringBytes.Length != (Keysize / 8))
                        {
                            System.Diagnostics.Trace.TraceWarning("Decrypt: iv length mismatch detected");
                            return null;
                        }

                        try
                        {
                            using (var decryptor = symmetricKey.CreateDecryptor(keyBytes, ivStringBytes))
                            {
                                using (var memoryStream = new MemoryStream(cipherTextBytes))
                                {
                                    using (var cryptoStream = new CryptoStream(memoryStream, decryptor, CryptoStreamMode.Read))
                                    {
                                        var plainTextBytes = new byte[cipherTextBytes.Length];
                                        var decryptedByteCount = cryptoStream.Read(plainTextBytes, 0, plainTextBytes.Length);
                                        memoryStream.Close();
                                        cryptoStream.Close();
                                        return Encoding.UTF8.GetString(plainTextBytes, 0, decryptedByteCount);
                                    }
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            // Catch any exception during creation of decryptor or reading and treat as invalid ciphertext
                            System.Diagnostics.Trace.TraceWarning($"Decrypt: decryption failed - {ex.Message}");
                            return null;
                        }
                    }
                }
            }
            catch (FormatException)
            {
                // Not valid base64 - treat as invalid credentials instead of throwing
                return null;
            }
            catch (CryptographicException)
            {
                // Decryption failed (bad key/iv/ciphertext) - treat as invalid credentials
                return null;
            }
            catch (ArgumentException)
            {
                // Any other argument issues (e.g. CreateTransform) - treat as invalid
                return null;
            }
            catch (Exception ex)
            {
                // Defensive catch-all to ensure no exception escapes decryption - log minimal info
                System.Diagnostics.Trace.TraceWarning($"Decrypt: unexpected error - {ex.Message}");
                return null;
            }
        }

        private static byte[] Generate128BitsOfRandomEntropy()
        {
            var randomBytes = new byte[16]; // 16 Bytes will give us 128 bits.
            using (var rngCsp = new RNGCryptoServiceProvider())
            {
                // Fill the array with cryptographically secure random bytes.
                rngCsp.GetBytes(randomBytes);
            }
            return randomBytes;
        }
    }
}
