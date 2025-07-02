const crypto = require('crypto');

// const key = crypto.scryptSync('secretPassword', 'salt', 32)
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
function hashing(email, phone_number) {
    

    const emailHash = crypto.createHash('sha256') 
        .update(email)
        .digest('hex')
    
    const phoneNumberHash = crypto.createHash('sha256')
        .update(phone_number)
        .digest('hex')

    return {emailHash, phoneNumberHash}
}


module.exports = {encrypt, decrypt, hashing}