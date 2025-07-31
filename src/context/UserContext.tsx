"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type UserData = {
  username: string;
  passcode: string;
  studentId?: string;
};

type UserContextType = {
  user: UserData | null;
  setUser: (user: UserData | null) => void;
};

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
});

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUserState] = useState<UserData | null>(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedPasscode = localStorage.getItem("passcode");
    const storedStudentId = localStorage.getItem("studentId");

    if (storedUsername && storedPasscode) {
      setUserState({
        username: storedUsername,
        passcode: storedPasscode,
        studentId: storedStudentId || undefined,
      });
    }
  }, []);

  const setUser = (newUser: UserData | null) => {
    if (newUser) {
      localStorage.setItem("username", newUser.username);
      localStorage.setItem("passcode", newUser.passcode);
      if (newUser.studentId) {
        localStorage.setItem("studentId", newUser.studentId);
      } else {
        localStorage.removeItem("studentId");
      }
    } else {
      localStorage.removeItem("username");
      localStorage.removeItem("passcode");
      localStorage.removeItem("studentId");
    }

    setUserState(newUser);
  };

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
