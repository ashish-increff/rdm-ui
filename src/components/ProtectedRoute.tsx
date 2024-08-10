// components/ProtectedRoute.tsx
import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { isAuthenticated } from "../utils/Auth";

const ProtectedRoute: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href =
        "https://services.nextscm.com/account/auth/login-ui";
    }
  }, [navigate]);

  return isAuthenticated() ? <Outlet /> : null;
};

export default ProtectedRoute;
