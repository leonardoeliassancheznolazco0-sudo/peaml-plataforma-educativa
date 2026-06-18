import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("peaml_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  me: () => api.get("/users/me"),
};

export const studentsAPI = {
  me: () => api.get("/students/me"),
  list: () => api.get("/students/"),
  get: (id) => api.get(`/students/${id}`),
};

export const contentsAPI = {
  list: () => api.get("/contents/"),
  create: (data) => api.post("/contents/", data),
  update: (id, data) => api.patch(`/contents/${id}`, data),
  remove: (id) => api.delete(`/contents/${id}`),
};

export const assessmentsAPI = {
  create: (data) => api.post("/assessments/", data),
  getByStudent: (studentId) => api.get(`/assessments/${studentId}`),
};

export const recommendationsAPI = {
  getByStudent: (studentId) => api.get(`/recommendations/${studentId}`),
};

export const mlAPI = {
  predict: (data) => api.post("/ml/predict", data),
  retrain: () => api.post("/ml/train"),
};

export const dashboardAPI = {
  student: (studentId) => api.get(`/dashboard/student/${studentId}`),
  teacher: () => api.get("/dashboard/teacher"),
  admin: () => api.get("/dashboard/admin"),
};

export const healthAPI = {
  check: () => axios.get(`${API_URL}/health`),
};
// Management
export const managementAPI = {
  // Admin
  createTeacher: (data) => api.post("/manage/admin/teachers", data),
  listTeachers: () => api.get("/manage/admin/teachers"),
  listAllStudents: () => api.get("/manage/admin/students"),
  updateUserStatus: (userId, status) => api.patch(`/manage/admin/users/${userId}/status?status=${status}`),
  listTrialUsers: () => api.get("/manage/admin/users/trial"),
  // Teacher
  createStudent: (data) => api.post("/manage/teacher/students", data),
  listMyStudents: () => api.get("/manage/teacher/students"),
  updateStudentProfile: (studentId, data) => api.patch(`/manage/teacher/students/${studentId}`, data),
  updateMyStudentStatus: (userId, status) => api.patch(`/manage/teacher/students/${userId}/status?status=${status}`),

};

export const quizAPI = {
  // docente
  addQuestion: (contentId, data) => api.post(`/quiz/contents/${contentId}/questions`, data),
  listQuestions: (contentId) => api.get(`/quiz/contents/${contentId}/questions`),
  // estudiante
  getQuiz: (contentId) => api.get(`/quiz/contents/${contentId}/quiz`),
  submit: (data) => api.post(`/quiz/submit`, data),
  results: (studentId) => api.get(`/quiz/results/${studentId}`),
  updateQuestion: (questionId, data) => api.patch(`/quiz/questions/${questionId}`, data),
  deleteQuestion: (questionId) => api.delete(`/quiz/questions/${questionId}`),
};

export const analyticsAPI = {
  studentAlerts: () => api.get("/analytics/student-alerts"),
  itemQuality: () => api.get("/analytics/item-quality"),
};

export default api;
