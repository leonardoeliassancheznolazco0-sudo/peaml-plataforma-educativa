import { createContext, useContext, useState, useEffect } from "react";
import { authAPI, studentsAPI } from "../services/api";
import { useRouter } from "next/router";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("peaml_token");
    const storedUser = localStorage.getItem("peaml_user");
    const storedStudent = localStorage.getItem("peaml_student");

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      if (storedStudent) {
        setStudentProfile(JSON.parse(storedStudent));
      }
    }
    setLoading(false);
  }, []);

  const fetchStudentProfile = async () => {
    try {
      const res = await studentsAPI.me();
      const profile = res.data;
      setStudentProfile(profile);
      localStorage.setItem("peaml_student", JSON.stringify(profile));
      return profile;
    } catch {
      return null;
    }
  };

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { access_token, user: userData } = res.data;

    localStorage.setItem("peaml_token", access_token);
    localStorage.setItem("peaml_user", JSON.stringify(userData));
    setUser(userData);

    if (userData.role === "student") {
      await fetchStudentProfile();
    }

    return userData;
  };

  const logout = () => {
    localStorage.removeItem("peaml_token");
    localStorage.removeItem("peaml_user");
    localStorage.removeItem("peaml_student");
    setUser(null);
    setStudentProfile(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{ user, studentProfile, login, logout, loading, fetchStudentProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
