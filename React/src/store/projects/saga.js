import { call, put, takeEvery } from "redux-saga/effects"

// Crypto Redux States
import { GET_PROJECTS, GET_PROJECT_DETAIL, ADD_NEW_PROJECT, DELETE_PROJECT, UPDATE_PROJECT } from "./actionTypes"
import {
  getProjectsSuccess,
  getProjectsFail,
  getProjectDetailSuccess,
  getProjectDetailFail,
  addProjectFail,
  addProjectSuccess,
  updateProjectSuccess,
  updateProjectFail,
  deleteProjectSuccess,
  deleteProjectFail,
} from "./actions"

//Include Both Helper File with needed methods
import { getProjects, getProjectsDetails, addNewProject, updateProject, deleteProject } from "helpers/fakebackend_helper"

function* fetchProjects() {
  try {
    const response = yield call(getProjects)
    yield put(getProjectsSuccess(response))
  } catch (error) {
    yield put(getProjectsFail(error.message || error.toString() || 'An error occurred'))
  }
}

function* fetchProjectDetail({ projectId }) {
  try {
    const response = yield call(getProjectsDetails, projectId)
    yield put(getProjectDetailSuccess(response))
  } catch (error) {
    yield put(getProjectDetailFail(error.message || error.toString() || 'An error occurred'))
  }
}

function* onUpdateProject({ payload: project }) {
  try {
    const response = yield call(updateProject, project)
    yield put(updateProjectSuccess(response))
  } catch (error) {
    yield put(updateProjectFail(error.message || error.toString() || 'An error occurred'))
  }
}

function* onDeleteProject({ payload: project }) {
  try {
    const response = yield call(deleteProject, project)
    yield put(deleteProjectSuccess(response))
  } catch (error) {
    yield put(deleteProjectFail(error.message || error.toString() || 'An error occurred'))
  }
}

function* onAddNewProject({ payload: project }) {
  try {
    const response = yield call(addNewProject, project)
    yield put(addProjectSuccess(response))
  } catch (error) {

    yield put(addProjectFail(error.message || error.toString() || 'An error occurred'))
  }
}

function* projectsSaga() {
  yield takeEvery(GET_PROJECTS, fetchProjects)
  yield takeEvery(GET_PROJECT_DETAIL, fetchProjectDetail)
  yield takeEvery(ADD_NEW_PROJECT, onAddNewProject)
  yield takeEvery(UPDATE_PROJECT, onUpdateProject)
  yield takeEvery(DELETE_PROJECT, onDeleteProject)
}

export default projectsSaga
