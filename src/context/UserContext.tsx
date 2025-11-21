"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type UserData = {
  username: string;
  passcode: string;
  studentId?: string;
  uid?: string;
  token?: string;
  role?: string;
  tokenExpiry?: number; // Add token expiry tracking
  schoolId?: string; // School ID for teachers
};

type UserContextType = {
  user: UserData | null;
  setUser: (user: UserData | null) => void;
  isLoaded: boolean;
};

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  isLoaded: false,
});

export const useUser = () => useContext(UserContext);

// Helper function to check if token is expired
const isTokenExpired = (expiry?: number): boolean => {
  if (!expiry) return true;
  return Date.now() >= expiry;
};

// Helper function to get secure storage (sessionStorage for sensitive data)
const getSecureStorage = () => {
  // Use sessionStorage for tokens (cleared when tab closes)
  // Use localStorage for non-sensitive data
  return {
    getToken: () => sessionStorage.getItem("auth_token"),
    setToken: (token: string) => sessionStorage.setItem("auth_token", token),
    removeToken: () => sessionStorage.removeItem("auth_token"),
    getExpiry: () => sessionStorage.getItem("token_expiry"),
    setExpiry: (expiry: number) =>
      sessionStorage.setItem("token_expiry", expiry.toString()),
    removeExpiry: () => sessionStorage.removeItem("token_expiry"),
  };
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUserState] = useState<UserData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Validate token function with better error handling
  const validateToken = async (token: string) => {
    try {
      const response = await fetch("/api/auth/validate", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.warn("Token validation failed:", response.status);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Token validation error:", error);
      return false;
    }
  };

  useEffect(() => {
    // Only run on client side to avoid hydration issues
    if (typeof window !== "undefined") {
      const secureStorage = getSecureStorage();

      const storedUsername = localStorage.getItem("username");
      const storedPasscode = localStorage.getItem("passcode");
      const storedStudentId = localStorage.getItem("studentId");
      const storedUid = localStorage.getItem("uid");
      const storedRole = localStorage.getItem("role");
      const storedSchoolId = localStorage.getItem("schoolId");

      // Get token from secure storage
      const storedToken = secureStorage.getToken();
      const storedExpiry = secureStorage.getExpiry();
      const tokenExpiry = storedExpiry ? parseInt(storedExpiry) : undefined;

      // Check if we have stored user data
      // For teachers/admins: we need username and valid token
      // For students: we need username and passcode
      const hasTeacherData =
        storedUsername &&
        storedToken &&
        (storedRole === "teacher" || storedRole === "admin") &&
        !isTokenExpired(tokenExpiry);
      const hasStudentData = storedUsername && storedPasscode;

      if (hasTeacherData || hasStudentData) {
        const userData = {
          username: storedUsername!,
          passcode: storedPasscode || "", // Empty string for teachers
          studentId: storedStudentId || undefined,
          uid: storedUid || undefined,
          token: storedToken || undefined,
          role: storedRole || undefined,
          tokenExpiry: tokenExpiry,
          schoolId: storedSchoolId || undefined,
        };

        // If user has a token (teacher or admin), validate it
        if (
          storedToken &&
          (storedRole === "teacher" || storedRole === "admin")
        ) {
          validateToken(storedToken)
            .then((isValid) => {
              if (isValid) {
                setUserState(userData);
              } else {
                // Token is invalid, clear the session
                console.log("Invalid token detected, clearing session");
                setUserState(null);
                clearAllStorage();
              }
              setIsLoaded(true);
            })
            .catch((error) => {
              console.error("Token validation failed:", error);
              // Validation failed, clear session
              setUserState(null);
              clearAllStorage();
              setIsLoaded(true);
            });
        } else {
          // Student user or no token, set user data directly
          setUserState(userData);
          setIsLoaded(true);
        }
      } else {
        setIsLoaded(true);
      }
    }
  }, []);

  // Helper function to clear all storage
  const clearAllStorage = () => {
    if (typeof window !== "undefined") {
      const secureStorage = getSecureStorage();

      // Clear localStorage
      localStorage.removeItem("username");
      localStorage.removeItem("passcode");
      localStorage.removeItem("studentId");
      localStorage.removeItem("uid");
      localStorage.removeItem("role");
      localStorage.removeItem("schoolId");

      // Clear secure storage
      secureStorage.removeToken();
      secureStorage.removeExpiry();
    }
  };

  const setUser = (newUser: UserData | null) => {
    // Only access storage on client side
    if (typeof window !== "undefined") {
      const secureStorage = getSecureStorage();

      if (newUser) {
        // Store non-sensitive data in localStorage
        localStorage.setItem("username", newUser.username);
        localStorage.setItem("passcode", newUser.passcode);
        if (newUser.studentId) {
          localStorage.setItem("studentId", newUser.studentId);
        } else {
          localStorage.removeItem("studentId");
        }
        if (newUser.uid) {
          localStorage.setItem("uid", newUser.uid);
        } else {
          localStorage.removeItem("uid");
        }
        if (newUser.role) {
          localStorage.setItem("role", newUser.role);
        } else {
          localStorage.removeItem("role");
        }
        if (newUser.schoolId) {
          localStorage.setItem("schoolId", newUser.schoolId);
        } else {
          localStorage.removeItem("schoolId");
        }

        // Store sensitive data (token) in sessionStorage
        if (newUser.token) {
          secureStorage.setToken(newUser.token);
          // Set token expiry (1 hour from now for Firebase ID tokens)
          const expiry = Date.now() + 60 * 60 * 1000; // 1 hour
          secureStorage.setExpiry(expiry);
        } else {
          secureStorage.removeToken();
          secureStorage.removeExpiry();
        }
      } else {
        clearAllStorage();
      }
    }

    setUserState(newUser);
  };

  return (
    <UserContext.Provider value={{ user, setUser, isLoaded }}>
      {children}
    </UserContext.Provider>
  );
};
