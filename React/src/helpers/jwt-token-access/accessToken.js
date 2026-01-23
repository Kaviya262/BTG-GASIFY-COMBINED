// const accessToken =
//   "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6ImFkbWluIiwiYWRtaW4iOnRydWUsImp0aSI6ImQ2MTEwYzAxLWMwYjUtNDUzNy1iNDZhLTI0NTk5Mjc2YjY1NiIsImlhdCI6MTU5MjU2MDk2MCwiZXhwIjoxNTkyNTY0NjE5fQ.QgFSQtFaK_Ktauadttq1Is7f9w0SUtKcL8xCmkAvGLw"
// export default accessToken

import { decryptData, encryptData } from "helpers/crypto_helper";


let accessToken = "";
let refreshToken = "";
let expirationTime = new Date(0);

// Load and decrypt from localStorage if available
try {
  const encryptedUser = localStorage.getItem("authDetails");
  if (encryptedUser) {
    const decrypted = decryptData(encryptedUser);
    const authUser = JSON.parse(decrypted);

    accessToken = authUser.token;
    refreshToken = authUser.refreshToken;
    expirationTime = new Date(authUser.expiration);
  }
} catch (err) {
  console.error("Failed to load or decrypt authUser:", err);
  // Clear if invalid
  localStorage.removeItem("authDetails");
}

// ✅ Exported token methods

export const getToken = () => accessToken;

export const getRefreshToken = () => refreshToken;

export const isTokenExpired = () => {
  return new Date() >= expirationTime;
};

export const setToken = ({ token, refreshToken, expiration }) => {
  accessToken = token;
  expirationTime = new Date(expiration);
  refreshToken = refreshToken;

  const authUser = {
    token,
    refreshToken,
    expiration,
  };

  try {
    localStorage.setItem("authDetails", encryptData(JSON.stringify(authUser)));
  } catch (e) {
    console.error("Error encrypting/storing token", e);
  }
};

export const clearToken = () => {
  accessToken = "";
  refreshToken = "";
  expirationTime = new Date(0);
  localStorage.removeItem("authDetails");
};

export default accessToken;
