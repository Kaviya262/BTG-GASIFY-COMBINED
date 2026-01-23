import { AES, enc } from 'crypto-js';
// var CryptoJS = require("crypto-js");
// import CryptoJS from 'crypto-js';

// Encryption function
const secretKey = 'MZ8kHpFqVu2tXrG7A9nKc4LsQeBwZ1YoTmD5vRgE3XaJjU6LzByPfNvUdKhCxWmQ';
const encryptData = (text) => {
    
  const encryptedText = AES.encrypt(text, secretKey).toString();
  return encodeURIComponent(encryptedText);
}

// Decryption function
const decryptData = (encryptedText) => {
  const decodedEncryptedText = decodeURIComponent(encryptedText);  // Decode URI component
  const bytes = AES.decrypt(decodedEncryptedText, secretKey);
  const decryptedText = bytes.toString(enc.Utf8);
  return decryptedText;
};

const urlEncryptData = (text) => {
    
  const encryptedText = AES.encrypt(text, secretKey).toString();
  const encodedText = btoa(encryptedText);
  return encodedText;
}

// Decryption function
const urlDecryptData = (encryptedText) => {
  // Decode the Base64-encoded encrypted text
  const decodedText = atob(encryptedText);

  // Decrypt the text using the secret key
  const bytes = AES.decrypt(decodedText, secretKey);

  // Convert the decrypted bytes to a UTF-8 string
  const decryptedText = bytes.toString(enc.Utf8);

  return decryptedText;
};

export {encryptData, decryptData, urlEncryptData, urlDecryptData }
