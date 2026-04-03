"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import resetImg from "../../../../../public/resetpass.png"
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import { PiEyeClosedBold, PiEyeClosedDuotone } from "react-icons/pi";
const ResetPassword = () => {
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_URL;
 const [isEyeOpen, setIsEyeOpen] = useState(false);
 const [isEyeOpend, setIsEyeOpend] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (formData.newPassword.length < 6) {
    toast.error("Password must be at least 6 characters");
    return;
  }

  if (formData.newPassword !== formData.confirmPassword) {
    toast.error("Passwords do not match");
    return;
  }

  const token = localStorage.getItem("resetToken");
   
   
  if (!token) {
    toast.error("Reset token missing. Please verify OTP again.");
    return;
  }

  try {
  const res = await fetch(`${baseUrl}/user/reset-password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-reset-token": token, // ✅ set token in custom header
    },
    body: JSON.stringify({
      newPassword: formData.newPassword,
      confirmPassword: formData.confirmPassword,
    }),
  });

    const data = await res.json();

    if (res.ok) {
      toast.success("Password reset successfully!");
      localStorage.removeItem("resetToken"); // cleanup
      setTimeout(() => router.push("/auth/login"), 1500);
    } else {
      toast.error(data?.message || "Failed to reset password");
    }
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong");
  }
};


  return (
    <div className="md:ml-70 md:mt-40 gap-10 md:flex items-center justify-center  px-4">
      <div className="">
          <Image src={resetImg} alt=""/>
      </div>
      <div className="md:w-1/2">
        <form
        onSubmit={handleSubmit}
        className="bg-white p-8  max-w-md w-full space-y-6"
      >
        <h2 className="text-2xl md:text-4xl font-semibold  text-start">
          Set new password
        </h2>
        <p>Password  must have 6-8 characters.</p>

        <div>
          <label htmlFor="newPassword" className="block mb-2 font-medium">
            New Password
          </label>
          <div className="w-full relative" >
            <input
            type={isEyeOpen ? "text" : "password"}
            name="newPassword"
            id="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7D0000]"
            placeholder="Enter new password"
          />
           {isEyeOpen ? (
                  <PiEyeClosedBold
                    className="absolute top-2 right-2 text-[1.5rem] text-[#777777] cursor-pointer"
                    onClick={() => setIsEyeOpen(false)}
                  />
                ) : (
                  <PiEyeClosedDuotone
                    className="absolute top-2 right-2 text-[1.5rem] text-[#777777] cursor-pointer"
                    onClick={() => setIsEyeOpen(true)}
                  />
                )}
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block mb-2 font-medium">
            Confirm Password
          </label>
          <div className="w-full relative">
            <input
            type={isEyeOpend ? "text" : "password"}
            name="confirmPassword"
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7D0000]"
            placeholder="Confirm new password"
          />
          {isEyeOpend ? (
                  <PiEyeClosedBold
                    className="absolute top-2 right-2 text-[1.5rem] text-[#777777] cursor-pointer"
                    onClick={() => setIsEyeOpend(false)}
                  />
                ) : (
                  <PiEyeClosedDuotone
                    className="absolute top-2 right-2 text-[1.5rem] text-[#777777] cursor-pointer"
                    onClick={() => setIsEyeOpend(true)}
                  />
                )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-[#D80000] to-[#720000] text-white py-4 rounded-full hover:bg-[#5e0000] transition"
        >
          Reset Now
        </button>
      </form>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default ResetPassword;
