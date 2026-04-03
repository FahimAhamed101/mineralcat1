"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, FormEvent } from "react";
import loginImage from "@/../public/login/login.png";
import { Eye, EyeOff } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_URL as string;

export default function Page() {
  const [eye, setEye] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email,
        password,
      });

      if (response.status !== 200) {
        setError("Login failed. Please check your credentials.");
        setLoading(false);
        return;
      }

      localStorage.setItem("accessToken", response?.data?.accessToken);
      localStorage.setItem("refreshToken", response?.data?.refreshToken);
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lg:flex justify-around md:mt-20 px-5 py-10 md:px-0 md:py-0">
      <div className="hidden lg:block">
        <h1 className="font-bold text-2xl md:text-[48px]">MineralCat PTE</h1>
        <h1 className="font-bold md:text-[30px] mt-8">
          Your Complete <span className="text-[#DE3B40]">PTE Core Prep Platform</span>
        </h1>
        <h1 className="font-bold md:text-[30px] mb-5">
          No account yet?{" "}
          <Link className="text-[#DE3B40]" href="/auth/sign-up">
            Sign Up Here!
          </Link>
        </h1>
        <div>
          <Image src={loginImage} height={100} width={600} alt="Login Illustration" />
        </div>
      </div>

      <div className="md:border-l border-[#7D0000] md:pl-20 mt-0 md:mt-0">
        <h1 className="font-bold text-[30px] text-[#781216]">Welcome back !</h1>
        <p className="text-[16px]">Please enter your email and password to continue.</p>
        <form className="mt-5" onSubmit={handleSubmit}>
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

          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

          <div className="flex justify-between items-center mx-1">
            <label className="flex items-center gap-2 text-[#742023]">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => setIsChecked(!isChecked)}
              />
              <span>Remember me</span>
            </label>
            <Link
              className="text-[#742023] font-medium text-[14px]"
              href="/auth/login/forgot-password"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            className="bg-linear-to-r from-[#DB1F2C] to-[#7A0100] text-[18px] text-white text-center w-full py-3 mt-5 rounded-full disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
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
            <FaGoogle />
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}
