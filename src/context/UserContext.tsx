"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type UserData = {
  username: string;
  passcode: string;
  studentId?: string;
  uid?: string;
  token?: string;
  role?: string;
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

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUserState] = useState<UserData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Validate token function
  const validateToken = async (token: string) => {
    try {
      const response = await fetch("/api/auth/validate", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.ok;
    } catch (error) {
      console.error("Token validation error:", error);
      return false;
    }
  };

  useEffect(() => {
    // Only run on client side to avoid hydration issues
    if (typeof window !== "undefined") {
      const storedUsername = localStorage.getItem("username");
      const storedPasscode = localStorage.getItem("passcode");
      const storedStudentId = localStorage.getItem("studentId");
      const storedUid = localStorage.getItem("uid");
      const storedToken = localStorage.getItem("token");
      const storedRole = localStorage.getItem("role");

      if (storedUsername && storedPasscode) {
        const userData = {
          username: storedUsername,
          passcode: storedPasscode,
          studentId: storedStudentId || undefined,
          uid: storedUid || undefined,
          token: storedToken || undefined,
          role: storedRole || undefined,
        };

        // If user has a token (teacher), validate it
        if (storedToken && storedRole === "teacher") {
          validateToken(storedToken)
            .then((isValid) => {
              if (isValid) {
                setUserState(userData);
              } else {
                // Token is invalid, clear the session
                console.log("Invalid token detected, clearing session");
                setUserState(null);
                // Clear localStorage
                localStorage.removeItem("username");
                localStorage.removeItem("passcode");
                localStorage.removeItem("studentId");
                localStorage.removeItem("uid");
                localStorage.removeItem("token");
                localStorage.removeItem("role");
              }
              setIsLoaded(true);
            })
            .catch(() => {
              // Validation failed, clear session
              setUserState(null);
              setIsLoaded(true);
            });
        } else {
          // No token or student user, set user data directly
          setUserState(userData);
          setIsLoaded(true);
        }
      } else {
        setIsLoaded(true);
      }
    }
  }, []);

  const setUser = (newUser: UserData | null) => {
    // Only access localStorage on client side
    if (typeof window !== "undefined") {
      if (newUser) {
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
        if (newUser.token) {
          localStorage.setItem("token", newUser.token);
        } else {
          localStorage.removeItem("token");
        }
        if (newUser.role) {
          localStorage.setItem("role", newUser.role);
        } else {
          localStorage.removeItem("role");
        }
      } else {
        localStorage.removeItem("username");
        localStorage.removeItem("passcode");
        localStorage.removeItem("studentId");
        localStorage.removeItem("uid");
        localStorage.removeItem("token");
        localStorage.removeItem("role");
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
