import { useState } from "react";
import recovaryImage from "/setPassword.svg";
import { PiEyeClosedBold, PiEyeClosedDuotone } from "react-icons/pi";
import axios from "axios";

import { Link, useNavigate } from "react-router";
import { IoArrowBackSharp } from "react-icons/io5";

const BASE_URL = import.meta.env.VITE_ADMIN_URL;
console.log(BASE_URL)

export default function SetPassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [isEyeOpen, setIsEyeOpen] = useState(false);

  const navigate = useNavigate();

  const data = {
    greetings: "Set Your New Password",
    message: "",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!password.trim()) {
      setError("New Password is required");
      return;
    }
    if (password !== rePassword) {
      setError("Password and Retype Password must be same");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/recovary`, {
        password,
      });
      console.log("Password set success:", response.data);
      // সফল হলে পরবর্তী রাউটে নিয়ে যাওয়া (যেমন ড্যাশবোর্ড বা লগইন)
      navigate("/auth/admin/login");
    } catch (err) {
      console.error("Error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-4 gap-x-7 w-full h-screen">
      {/* img */}
      <section className="flex flex-col justify-center w-full items-center bg-[#ffffff] col-span-2">
        <img src={recovaryImage} alt="Image" />
      </section>

      {/* form */}
      <section className="flex justify-center items-center bg-[#ffffff] col-span-2 gap-x-7 w-full">
        <div className="w-[2px] flex flex-col justify-center items-center bg-[#ffffff] ">
          <div className="w-[2px] h-[800px] bg-[#7D0000]"></div>
        </div>

        <div>
          <div>
            <div className="flex items-center gap-x-2">
              <Link
                className="text-white rounded-full p-1 flex justify-center items-center text-3xl bg-black w-[40px] h-[40px]"
                to={"/auth/admin/login"}
              >
                <IoArrowBackSharp />
              </Link>
              <h3 className="text-[#0e0303] text-4xl font-[600] leading-[1.2] tracking-normal text-left">
                {data.greetings}
              </h3>
            </div>
            <p className="text-[#646464] text-base text-[28px] font-[500] leading-[1.2] tracking-normal text-left mt-2">
              {data.message}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full md:w-full px-4">
            <div>
              <label
                htmlFor="password"
                className="text-[25px] text-center text-[#262626] font-[500]"
              >
                Password
              </label>
              <div className="w-full relative">
                <input
                  type={isEyeOpen ? "text" : "password"}
                  name="password"
                  id="password"
                  autoComplete="off"
                  placeholder="please enter new password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  onFocus={() => setError(null)}
                  className="border-border border text-[#646464] text-[20px] font-[500] rounded-md outline-none px-4 w-full h-[72px] mt-1 py-3 focus:border-primary transition-colors duration-300"
                />
                {isEyeOpen ? (
                  <PiEyeClosedBold
                    className="absolute top-7 right-2 text-[1.5rem] text-[#777777] cursor-pointer"
                    onClick={() => setIsEyeOpen(false)}
                  />
                ) : (
                  <PiEyeClosedDuotone
                    className="absolute top-7 right-2 text-[1.5rem] text-[#777777] cursor-pointer"
                    onClick={() => setIsEyeOpen(true)}
                  />
                )}
              </div>
            </div>

            {error && (
              <p className="text-red-600 font-semibold mt-2 text-left">
                {error}
              </p>
            )}

            <div>
              <label
                htmlFor="password"
                className="text-[25px] text-center text-[#262626] font-[500]"
              >
                Retype Password
              </label>
              <div className="w-full relative">
                <input
                  type={isEyeOpen ? "text" : "password"}
                  name="password"
                  id="retype-password"
                  autoComplete="off"
                  placeholder="please retype your new password"
                  value={rePassword}
                  onChange={(e) => {
                    setRePassword(e.target.value);
                    setError(null);
                  }}
                  onFocus={() => setError(null)}
                  className="border-border border text-[#646464] text-[20px] font-[500] rounded-md outline-none px-4 w-full h-[72px] mt-1 py-3 focus:border-primary transition-colors duration-300"
                />
                {isEyeOpen ? (
                  <PiEyeClosedBold
                    className="absolute top-7 right-2 text-[1.5rem] text-[#777777] cursor-pointer"
                    onClick={() => setIsEyeOpen(false)}
                  />
                ) : (
                  <PiEyeClosedDuotone
                    className="absolute top-7 right-2 text-[1.5rem] text-[#777777] cursor-pointer"
                    onClick={() => setIsEyeOpen(true)}
                  />
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="border-border border text-[#F3F3F3] text-[24px] font-[600] rounded-[40px] outline-none px-4 w-full h-[72px] mt-6 py-3 focus:border-primary transition-colors duration-300 [background-image:linear-gradient(to_right,#D80000,#720000)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Setting Password..." : "Set Password"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
