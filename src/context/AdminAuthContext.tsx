import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface AdminAuthContextProps {
  admintoken: string | null;
  isAdminAuthenticated: boolean;
  Adminlogin: (newToken: string, newData: any) => void;
  Adminlogout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextProps | undefined>(undefined);

interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({ children }) => {
  const [admintoken, setAdmintoken] = useState<string | null>(null);
  const [userdata, setUserdata] = useState<any>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const storedData = JSON.parse(localStorage.getItem("admin_data") || "null");

  useEffect(() => {
    if (storedData) {
      const { adminToken, user } = storedData;
      setAdmintoken(adminToken);
      setUserdata(user);
      setIsAdminAuthenticated(true);
    }
  }, []);

  const Adminlogin = (newToken: string, newData: any) => {
    localStorage.setItem(
      "admin_data",
      JSON.stringify({ adminToken: newToken, user: newData })
    );
    setAdmintoken(newToken);
    setUserdata(newData);
    setIsAdminAuthenticated(true);
  };

  const Adminlogout = () => {
    localStorage.removeItem("admin_data");
    setAdmintoken(null);
    setUserdata(null);
    setIsAdminAuthenticated(false);
  };

  return (
    <AdminAuthContext.Provider
      value={{ admintoken, isAdminAuthenticated, Adminlogin, Adminlogout }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AdminAuthContextProps => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};
