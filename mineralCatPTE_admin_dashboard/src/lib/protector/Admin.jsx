import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useGetLoggedInUser } from "../logIn/useGetLoggedInUser";

const Admin = ({ children }) => {
  const refreshToken = localStorage.getItem("refreshToken");
  const { data, isLoading, isError, error } = useGetLoggedInUser();
  const location = useLocation();
 
  if (!refreshToken) {
    return <Navigate to="/auth/admin/login" replace />;
  }

  if (isLoading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  //   console.log(user?.user.name)
//   console.log(data);
//   console.log(data?.user.role);
//   console.log(data?.user.name);
  const user = data?.user;
//   console.log(user);

  if (isError) {
    return (
      <div className="text-center p-4 text-red-600">
        Error: {error?.message || "Something went wrong"}
      </div>
    );
  }

  if (user && user.role === "admin" && user.name && user.email) {
    return children;
  }

  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  return <Navigate to="/auth/admin/login" state={{ from: location }} replace />;
};

export default Admin;
