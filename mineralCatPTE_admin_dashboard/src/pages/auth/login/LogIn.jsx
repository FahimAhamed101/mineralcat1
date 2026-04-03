import { useState } from "react";
import logo from "/logo.png";
import { PiEyeClosedBold, PiEyeClosedDuotone } from "react-icons/pi";
import axios from "axios";
import { IoMdCheckboxOutline } from "react-icons/io";
import { MdOutlineCheckBoxOutlineBlank } from "react-icons/md";
import { Link, useNavigate } from "react-router";

const BASE_URL = import.meta.env.VITE_ADMIN_URL;

export default function LogIn() {
  const [isEyeOpen, setIsEyeOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  //  console.log(BASE_URL);
  const data = {
    greetings: "Welcome back!",
    message: "Please enter your email and password to continue.",
  };

  const handleSubmit = async (e) => {
    
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
      const response = await axios.post(`${BASE_URL}/admin/login`, {
        email,
        password,
      });
      if (response.status !== 200) {
        setError("Login failed. Please check your credentials.");
      }
      
      localStorage.setItem("accessToken", response?.data?.accessToken);
      localStorage.setItem("refreshToken", response?.data?.refreshToken);
      navigate("/"); // Redirect to the home page or dashboard after successful login
      
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-4 w-full h-screen">
      {/* img */}
      
      <section className="flex flex-col justify-center items-center bg-[#ffffff] col-span-2">
        <img src={logo} alt="main logo" />
      </section>

        {/* row */}
       


        {/* form */}
      <section className="flex justify-center items-center bg-[#ffffff] col-span-2 gap-x-7">
         <div className="w-[2px] flex flex-col justify-center items-center bg-[#ffffff] ">
            <div className="w-[2px] h-[800px] bg-[#7D0000]"></div>
        </div>
       <div>
         <div>
          <h3 className="text-[#7D0000] text-4xl font-[600] leading-[1.2] tracking-normal text-center">
            {data.greetings}
          </h3>
          <p className="text-[#646464] text-base text-[28px] font-[500] leading-[1.2] tracking-normal text-center mt-2">
            {data.message}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full md:w-full px-4">
          <div className="mb-4 mt-5">
            <label
              htmlFor="email"
              className="text-[25px] text-center text-[#262626] font-[500]"
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              autoComplete="on"
              placeholder="please enter your email"
              value={email}
              onChange={(e) => {setEmail(e.target.value), setError(null)}}
              onFocus={() => setError(null)}
              className="border-border border rounded-md outline-none px-4 w-full h-[72px] text-[#646464] text-[20px] font-[500] mt-1 py-3 focus:border-primary transition-colors duration-300"
            />
          </div>

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
                placeholder="Password"
                value={password}
                onChange={(e) =>{setPassword(e.target.value)}}
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
            <p className="text-red-600 font-semibold mt-2 text-left">{error}</p>
          )}


          {/* remember sections */}
            
          <div className="flex justify-between mt-4">   
            <div className="flex items-center ">
               {
                isChecked ? (
                  <IoMdCheckboxOutline
                    className="text-[#7D0000] text-[1.5rem] cursor-pointer"
                    onClick={() => setIsChecked(false)}
                  />
                ) : (
                  <MdOutlineCheckBoxOutlineBlank
                    className="text-[#7D0000] text-[1.5rem] cursor-pointer"
                    onClick={() => setIsChecked(true)}
                  />
                )
               }
                <label
                htmlFor="remember"
                className="ml-2 text-[#7D0000] text-[20px] font-[500]"
                >
                Remember me
                </label>    
            </div>
            <Link to={'/auth/admin/recover-password'} className="text-[#7D0000] underline text-[20px] font-[500]">
              Forgot Password?
            </Link>
            </div>

          <button
            type="submit"
            disabled={loading}
            className="border-border border text-[#F3F3F3] text-[24px] font-[600] rounded-[40px] outline-none px-4 w-full h-[72px] mt-6 py-3 focus:border-primary transition-colors duration-300 [background-image:linear-gradient(to_right,#D80000,#720000)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>


       </div>
      </section>
    </div>
  );
}
