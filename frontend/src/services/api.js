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

export default api;
