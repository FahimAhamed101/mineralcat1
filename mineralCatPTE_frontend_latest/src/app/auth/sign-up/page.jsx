"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import signupImage from "@/../public/signup/signup.png";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_URL || "";

export default function Page() {
  const [eye, setEye] = useState(false);
  const [confirmEye, setConfirmEye] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!phone.trim()) {
      setError("Please enter your phone number");
      return;
    }
    if (!city.trim()) {
      setError("Please enter your city");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/auth/signup`, {
        name,
        phone,
        city,
        email,
        password,
      });

      if (response.status !== 200) {
        setError("Signup failed. Please try again.");
        setLoading(false);
        return;
      }

      setSuccess("Signup successful. Please sign in.");
      setName("");
      setPhone("");
      setCity("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      window.location.href = "/auth/login";
    } catch (err) {
      console.error("Signup error:", err);
      setError("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lg:flex justify-around md:mt-20 px-5 py-10 md:px-0 md:py-0 mb-20">
      <div className="hidden lg:block">
        <h1 className="font-bold text-2xl md:text-[48px]">MineralCat PTE</h1>
        <h1 className="font-bold md:text-[30px] mt-8">
          Your Complete <span className="text-[#DE3B40]">PTE Core Prep Platform</span>
        </h1>
        <h1 className="font-bold md:text-[30px] mb-5">
          Already have an account?{" "}
          <Link className="text-[#DE3B40]" href="/auth/login">
            Login Here
          </Link>
        </h1>
        <div>
          <Image
            src={signupImage}
            height={100}
            width={500}
            alt="Signup Illustration"
          />
        </div>
      </div>

      <div className="md:border-l border-[#7D0000] md:pl-20 mt-0 md:mt-0">
        <h1 className="font-bold text-[30px] text-[#781216]">Create your account</h1>
        <p className="text-[16px]">Please enter your details to continue.</p>
        <form className="mt-5" onSubmit={handleSubmit}>
          <div>
            <label className="font-medium text-[12px]" htmlFor="name">
              User Name
            </label>
            <div className="border md:w-150 my-3 rounded-xl border-[#DFE3E7] px-5 py-4">
              <input
                className="outline-none w-full"
                type="text"
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
              />
            </div>
          </div>

          <div>
            <label className="font-medium text-[12px]" htmlFor="phone">
              Phone Number
            </label>
            <div className="border md:w-150 my-3 rounded-xl border-[#DFE3E7] px-5 py-4">
              <input
                className="outline-none w-full"
                type="tel"
                id="phone"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setError(null);
                }}
              />
            </div>
          </div>

          <div>
            <label className="font-medium text-[12px]" htmlFor="city">
              City
            </label>
            <div className="border md:w-150 my-3 rounded-xl border-[#DFE3E7] px-5 py-4">
              <input
                className="outline-none w-full"
                type="text"
                id="city"
                placeholder="Enter your city"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setError(null);
                }}
              />
            </div>
          </div>

          <div>
            <label className="font-medium text-[12px]" htmlFor="email">
              Email
            </label>
            <div className="border md:w-150 my-3 rounded-xl border-[#DFE3E7] px-5 py-4">
              <input
                className="outline-none w-full"
                type="email"
                id="email"
                placeholder="please enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
              />
            </div>
          </div>

          <div>
            <label className="font-medium text-[12px]" htmlFor="password">
              Password
            </label>
            <div className="border flex justify-between items-center md:w-150 my-3 rounded-xl border-[#DFE3E7] px-5 py-4">
              <input
                className="outline-none w-full"
                type={eye ? "text" : "password"}
                id="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                className="cursor-pointer"
                type="button"
                onClick={() => setEye(!eye)}
                aria-label={eye ? "Hide password" : "Show password"}
              >
                {eye ? <EyeOff className="opacity-50" /> : <Eye className="opacity-50" />}
              </button>
            </div>
          </div>

          <div>
            <label className="font-medium text-[12px]" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <div className="border flex justify-between items-center md:w-150 my-3 rounded-xl border-[#DFE3E7] px-5 py-4">
              <input
                className="outline-none w-full"
                type={confirmEye ? "text" : "password"}
                id="confirmPassword"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                className="cursor-pointer"
                type="button"
                onClick={() => setConfirmEye(!confirmEye)}
                aria-label={confirmEye ? "Hide password" : "Show password"}
              >
                {confirmEye ? <EyeOff className="opacity-50" /> : <Eye className="opacity-50" />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
          {success && <p className="text-green-600 text-sm mt-2">{success}</p>}

          <button
            className="bg-linear-to-r from-[#DB1F2C] to-[#7A0100] text-[18px] text-white text-center w-full py-3 mt-5 rounded-full disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
          <div>
            <p className="text-center mt-5">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-[#DB1F2C]">
                Login
              </Link>
            </p>
          </div>
        </form>

        <div className="flex items-center my-4 mt-10">
          <hr className="grow border-t border-gray-300" />
          <span className="mx-4 text-gray-500">OR</span>
          <hr className="grow border-t border-gray-300" />
        </div>
        <div className="text-center">
          By continuing, you agree to the updated{" "}
          <Link className="font-bold" href="/company/terms">
            Terms of Service
          </Link>
          , and{" "}
          <Link className="font-bold" href="/company/privacy">
            Privacy Policy
          </Link>
          .
          <button
            className="bg-linear-to-r from-[#DB1F2C] to-[#7A0100] text-[18px] text-white text-center w-full py-2 mt-5 rounded-full flex items-center justify-center gap-4"
            type="button"
          >
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}
