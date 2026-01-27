import { takeEvery, put, call, takeLatest } from "redux-saga/effects"

// Login Redux States
import { LOGIN_USER, LOGOUT_USER, SOCIAL_LOGIN } from "./actionTypes"
import { loginSuccess, logoutUserSuccess, apiError } from "./actions"

//Include Both Helper File with needed methods
import { getFirebaseBackend } from "../../../helpers/firebase_helper"
import { GetMenuDetails } from "common/data/mastersapi";

import {
  postFakeLogin,
  postJwtLogin,
  postSocialLogin,
} from "../../../helpers/fakebackend_helper"
import { encryptData } from "helpers/crypto_helper"
import { post } from "helpers/api_helper"
import axios from 'axios';
import { setToken } from "helpers/jwt-token-access/accessToken"
const fireBaseBackend = getFirebaseBackend()

function* loginUser({ payload: { user, history } }) {
  try {
    if (process.env.REACT_APP_DEFAULTAUTH === "firebase") {
      const response = yield call(
        fireBaseBackend.loginUser,
        user.email,
        user.password
      )
      yield put(loginSuccess(response))
    } else if (process.env.REACT_APP_DEFAULTAUTH === "jwt") {
      const response = yield call(postJwtLogin, {
        email: user.email,
        password: user.password,
      })
      localStorage.setItem("authUser", JSON.stringify(response))
      yield put(loginSuccess(response))
    } else if (process.env.REACT_APP_DEFAULTAUTH === "fake") {
      // const response = yield call(postFakeLogin, {
      //   email: user.email,
      //   password: user.password,
      // })
      // const userdetails = { username : 'admin', email: 'admin@btggas.com', uid: '1' }

      const response = yield call(post, process.env.REACT_APP_LOGIN_API, {
        username: user.email,
        password: user.password,
      });


      // ✅ Check if response exists and has a token
      if (response.status && response?.data.token) {
        // debugger; 
        console.log("LOGIN RESPONSE SUCCESS:", response); // DEBUG LOG
        const userdetails = {
          username: user.email,
          email: user.email,
          uid: response.data.userId,
          IsAdmin: response.data.isAdmin,
          u_id: response.data.u_Id,
          superAdmin: response.data.superIsAdmin,
          department: response.data.department, // Try to get from API
          departmentId: response.data.departmentId, // Added for Security Checks
          roleName: response.data.roleName // Added for Role Checks
        };

        // Encrypt and store "authUser"
        localStorage.setItem("authUser", JSON.stringify(userdetails));
        localStorage.setItem("authDetails", encryptData(JSON.stringify(response)));

        // Store tokens securely via accessToken.js
        setToken({
          token: response?.data.token,
          refreshToken: response?.data.refreshToken,
          expiration: response?.data.expiration,
        });

        const menuResponse = yield call(GetMenuDetails, response.data.u_Id, 1, 1);

        if (menuResponse.status) {
          localStorage.setItem("userMenu", JSON.stringify(menuResponse.data));
        } else {
          console.warn("Menu details fetch failed:", menuResponse.message);
        }

        yield put(loginSuccess(response));

        // Optional: navigate to dashboard
        if (history) {
          // history.push("/manage-quotation");
          if (menuResponse != undefined && menuResponse != null && menuResponse.data != null && menuResponse.data != undefined) {

            if (menuResponse.data.homePage != undefined && menuResponse.data.homePage != null && menuResponse.data.homePage != "") {
              history.push(menuResponse.data.homePage);
            } else {
              history.push("/manage-quotation");
            }

          }
          else {
            history.push("/manage-quotation");
          }

        }
      } else {
        // Handle failed login or invalid token
        yield put(apiError("Invalid login response"));
      }
    }
    // history.push("/manage-quotation")
  } catch (error) {
    if (error.response) {
      const status = error.response.status; let message = "Unexpected error occurred."
      if (status === 401) {
        message = "Unauthorized: Invalid email or password.";
      } else if (status === 403) {
        message = "Forbidden: You do not have access.";
      } else if (status === 500) {
        message = "Server error. Please try again later.";
      } else {
        message = `Error ${status}: ${error.response.data?.message || error.message}`;
      }
    }
    yield put(apiError(error.message || error.toString() || 'An error occurred'))
  }
}

function* logoutUser({ payload: { history } }) {
  try {
    localStorage.removeItem("authUser");
    localStorage.removeItem("userMenu");

    if (process.env.REACT_APP_DEFAULTAUTH === "firebase") {
      const response = yield call(fireBaseBackend.logout)
      yield put(logoutUserSuccess(response))
    }
    history.push("/login")
  } catch (error) {
    yield put(apiError(error.message || error.toString() || 'An error occurred'))
  }
}

function* socialLogin({ payload: { data, history, type } }) {
  try {
    if (process.env.REACT_APP_DEFAULTAUTH === "firebase") {
      const fireBaseBackend = getFirebaseBackend()
      const response = yield call(
        fireBaseBackend.socialLoginUser,
        data,
        type
      )
      localStorage.setItem("authUser", JSON.stringify(response))
      yield put(loginSuccess(response))
    } else {
      const response = yield call(postSocialLogin, data)
      localStorage.setItem("authUser", JSON.stringify(response))
      yield put(loginSuccess(response))
    }
    history.push("/dashboard")
  } catch (error) {
    yield put(apiError(error.message || error.toString() || 'An error occurred'))
  }
}

function* authSaga() {
  yield takeEvery(LOGIN_USER, loginUser)
  yield takeLatest(SOCIAL_LOGIN, socialLogin)
  yield takeEvery(LOGOUT_USER, logoutUser)
}

export default authSaga
