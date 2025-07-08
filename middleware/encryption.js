const crypto = require('crypto');

const key = crypto.scryptSync(process.env.ENCRYPT_PASSWORD, process.env.ENCRYPT_SALT, 32)

function encrypt(text) {
  // Generate a random initialization vector
  const iv = crypto.randomBytes(16);

  // Create cipher with AES-256-CBC
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

  // Encrypt the data
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  

  // Return both the encrypted data and the IV
  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted
  };
}
function decrypt(encryptedData, iv) {

  // Create decipher
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    key,
    Buffer.from(iv, 'hex')
  );

  // Decrypt the data
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
function hashing(email, phone_number, passwordResetToken) {
    if(email){
    const emailHash = crypto.createHash('sha256') 
        .update(email)
        .digest('hex')
      return emailHash
    } else if(phone_number){
    const phoneNumberHash = crypto.createHash('sha256')
        .update(phone_number)
        .digest('hex')
    return phoneNumberHash
      } else if(passwordResetToken){
      const tokenHash = crypto.createHash('sha256')
        .update(passwordResetToken)
        .digest('hex')
      return tokenHash
    }
    
}
function createResetPasswordToken() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  return resetToken
}



module.exports = {encrypt, decrypt, hashing, createResetPasswordToken}