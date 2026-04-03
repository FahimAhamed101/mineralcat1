import fetchWithAuth from "../../../utils/fetchWithAuth";
import React, { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const OtpInput = ({ setOtp }) => {
  const navigationInputs = useRef([]);
  const length = 6;
  const location = useLocation();
  const navigate = useNavigate();
  const [otpValue, setOtpValue] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const baseUrl = import.meta.env.VITE_ADMIN_URL;
  const email = location.state?.email || "";

  if (!email) {
    return (
      <div className="text-red-500 text-center mt-4">
        Email is required for OTP verification.
      </div>
    );
  }

  // OTP Verification Mutation
  const otpMutation = useMutation({
    mutationFn: async ({ email, otp }) => {
      // Send { email, otp } in body
      const res = await fetchWithAuth(`${baseUrl}/user/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.message || "OTP verification failed");
      }
      return json;
    },
    onSuccess: (data) => {
      setOtpError("");
      if (data.resetToken) {
        localStorage.setItem("resetToken", data.resetToken);
        setShowPasswordModal(true);
      }
      if (data.message && !data.resetToken) {
        setOtpError(data.message); // Show OTP error like "Invalid OTP."
      }
    },
    onError: (err) => {
      setOtpError(err?.message || "OTP verification failed");
    }
  });

  // Password Reset Handler (with min 8 char and navigation)
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setResetError("");
    setResetSuccess("");
    setResetLoading(true);

    if (!newPassword || !confirmPassword) {
      setResetError("Password fields cannot be empty.");
      setResetLoading(false);
      return;
    }
    if (newPassword.length < 8) {
      setResetError("Password must be at least 8 characters.");
      setResetLoading(false);
      return;
    }
    if (confirmPassword.length < 8) {
      setResetError("Confirm password must be at least 8 characters.");
      setResetLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError("Passwords don't match.");
      setResetLoading(false);
      return;
    }
    const resetToken = localStorage.getItem("resetToken");
    if (!resetToken) {
      setResetError("Reset token not found.");
      setResetLoading(false);
      return;
    }

    try {
      const res = await fetchWithAuth(`${baseUrl}/user/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-reset-token": resetToken,
        },
        body: JSON.stringify({ newPassword, confirmPassword }),
      });
      const json = await res.json();
      if (!res.ok) {
        setResetError(json?.message || "Password reset failed.");
        setResetLoading(false);
        return;
      }
      setResetSuccess(json?.message || "Password reset successful!");
      setResetLoading(false);
      localStorage.removeItem("resetToken");
      // Redirect to admin login after a short delay
      setTimeout(() => {
        // navigate("/auth/admin/login");
      }, 1200);
    } catch (err) {
      setResetError(err?.message || "Something went wrong.");
      setResetLoading(false);
    }
  };

  // OTP input change logic
  const onChange = (value) => {
    setOtp(value);
    setOtpValue(value);
    setOtpError("");
    if (value.length === length && email) {
      otpMutation.mutate({ email, otp: value });
    }
  };

  const handleInputChange = (e, index) => {
    const { value } = e.target;
    const newOtp = [...navigationInputs.current.map((input) => input?.value || "")];
    if (/^[0-9]$/.test(value) && value.length === 1) {
      newOtp[index] = value;
      onChange(newOtp.join(""));
      if (index < length - 1 && navigationInputs.current[index + 1]) {
        navigationInputs.current[index + 1].focus();
      }
    } else if (value === "") {
      newOtp[index] = "";
      onChange(newOtp.join(""));
    } else {
      e.target.value = value.slice(0, 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/[^0-9]/g, "")
      .slice(0, length);
    const newOtp = [...navigationInputs.current.map((input) => input?.value || "")];
    for (let i = 0; i < pastedData.length && i < length; i++) {
      if (navigationInputs.current[i]) {
        newOtp[i] = pastedData[i];
        navigationInputs.current[i].value = pastedData[i];
      }
    }
    onChange(newOtp.join(""));
    const focusIndex = Math.min(pastedData.length, length - 1);
    if (navigationInputs.current[focusIndex]) {
      navigationInputs.current[focusIndex].focus();
    }
  };

  const handleKeydown = (e, index) => {
    if (
      e.key === "Backspace" &&
      !navigationInputs.current[index]?.value &&
      index > 0 &&
      navigationInputs.current[index - 1]
    ) {
      navigationInputs.current[index - 1].focus();
    }
  };

  return (
    <div className="w-full">
      {!showPasswordModal ? (
        <>
          <div className="grid grid-cols-6 gap-[25px] w-full mx-auto md:w-[90%]">
            {Array.from({ length }).map((_, index) => (
              <input
                key={index}
                ref={(el) => (navigationInputs.current[index] = el)}
                className="p-3 text-center border border-[#bcbcbc] rounded-md outline-none focus:border-[#3B9DF8] placeholder-[#bcbcbc] text-[30px] font-[500] focus:shadow-md focus:shadow-[#3B9DF8] transition duration-200"
                placeholder="-"
                onWheel={(e) => e.target.blur()}
                onChange={(e) => handleInputChange(e, index)}
                onKeyDown={(e) => handleKeydown(e, index)}
                onPaste={handlePaste}
                type="number"
                inputMode="numeric"
                maxLength={1}
              />
            ))}
          </div>

          {/* OTP Verification Status */}
          {otpMutation.isLoading && (
            <div className="text-blue-500 mt-4 text-center text-sm">Verifying OTP...</div>
          )}
          {otpError && (
            <div className="text-red-500 mt-4 text-center text-sm">{otpError}</div>
          )}
          {otpMutation.isSuccess && !otpMutation.data?.resetToken && otpMutation.data?.message && (
            <div className="text-green-600 mt-4 text-center text-sm">
              {otpMutation.data?.message}
            </div>
          )}
        </>
      ) : (
        <div className="w-full max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6">Reset Your Password</h2>
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 border border-[#bcbcbc] rounded-md focus:border-[#3B9DF8] focus:shadow-md focus:shadow-[#3B9DF8] transition duration-200"
                  required
                  minLength={8}
                  placeholder="Minimum 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500"
                  tabIndex={-1}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 border border-[#bcbcbc] rounded-md focus:border-[#3B9DF8] focus:shadow-md focus:shadow-[#3B9DF8] transition duration-200"
                  required
                  minLength={8}
                  placeholder="Minimum 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-500"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {resetError && (
              <div className="text-red-500 text-sm text-center">{resetError}</div>
            )}
            {resetSuccess && (
              <div className="text-green-600 text-sm text-center">{resetSuccess}</div>
            )}

            <button
              type="submit"
              disabled={resetLoading}
              className="w-full py-3 bg-[#3B9DF8] text-white rounded-md hover:bg-[#2a8be8] transition duration-200 disabled:bg-[#3B9DF8]/50"
            >
              {resetLoading ? "Processing..." : "Reset Password"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default OtpInput;