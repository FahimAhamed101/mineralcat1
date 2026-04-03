import React from "react";
// eslint-disable-next-line no-unused-vars
import { Navigate, useLocation } from "react-router-dom";
import { useGetLoggedInUser } from "../logIn/useGetLoggedInUser";

const Public = ({ children }) => {
  const { data, isLoading, isError, error } = useGetLoggedInUser();
  

  if (isLoading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  //   console.log(user?.user.name)
  const user = data?.user;
  console.log(user);

  if (isError) {
    return (
      <div className="text-center p-4 text-red-600">
        Error: {error?.message || "Something went wrong"}
      </div>
    );
  }

  if (!user && !user.role === "admin" && !user.name && !user.email) {
    return children;
  }



  
    
  return <Navigate to="/" />;
};

export default Public;
