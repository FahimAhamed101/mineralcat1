"use client";
import React, { useRef, useState, useEffect } from "react";
import { toast, ToastContainer  } from 'react-toastify';
import fetchWithAuth from "../../lib/fetchWithAuth";
import Image from "next/image";
import frame from "../../../public/frame.png";
import dummy from "../../../public/dummy-image.png";
import edit from "../../../public/edit.png";
import UserForm from "../../components/personal/UserForm";

const Profile = () => {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const baseUrl = process.env.NEXT_PUBLIC_URL;

  const fetchUserData = async () => {
    
    try {
      
       setLoading(true);
      const response = await fetchWithAuth(`${baseUrl}/user/user-info`);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error("Error fetching user info:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    
    if (baseUrl) fetchUserData();
    
  }, [baseUrl]);
  

  const [preview, setPreview] = useState(dummy);

  useEffect(() => {
    if (userData?.user?.profile) {
      setPreview(userData.user.profile);
    } else setPreview(dummy);
  }, [userData]);

  // if (loading) return <p>Loading</p>;
  console.log("loading ", loading);
  console.log("user.user", userData?.user);
  
 

// if (!userData) return <p>No user data available</p>;

if (!userData) {
  return (
    <div className="flex w-full justify-center items-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#810000]"></div>
    </div>
  );
}

  const handleImageClick = (e) => {
    e.stopPropagation()
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

 const handleFileChange = async (e) => {
  if (e.target.files && e.target.files[0]) {
    const file = e.target.files[0];

    const formData = new FormData();
    formData.append("profile", file); // must match the backend field name

    try {
      const response = await fetchWithAuth(`${baseUrl}/user/update-user`, {
        method: "PUT",
        body: formData,
        // DO NOT set headers; fetch will set correct multipart/form-data automatically
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();

      // Preview updated image
      setPreview(result.user?.profile); // if API returns updated user object with new image URL
        toast.success("Profile updated successfully!");
window.location.reload();
      
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Update failed. Please try again.");
    }
  }
};

  // setPreview(URL.createObjectURL(file));
  return (
    <div>
      {
        loading ? (<div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#810000]"></div>
          </div>):(
          <div>
      <div className="grid">
        <div className="block md:hidden rounded-full top-45 left-6 mt-10">
          <div
            className="user-image relative w-[140px] h-[140px] rounded-full shadow-lg border-2 border-pink-50"
            onClick={handleImageClick}
          >
            <Image
              className="rounded-full object-cover"
              src={preview}
              alt="User Image"
              fill
            />
            <div className="absolute top-25 left-22">
              <Image src={edit} alt="Edit Icon" width={40} height={40} />
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="user-name absolute md:left-40 md:top-20 w-100 grid gap-2">
            <h1 className="text-[#7D0000] font-semibold text-4xl">
              {userData.user?.name}
            </h1>
            <h1 className="text-black">{userData.user?._id}</h1>
          </div>
        </div>

        <div
          className="hidden md:block relative w-full h-full"
         
        >
          <Image src={frame} alt="" />
          <div className="absolute rounded-full top-45 left-6 flex">
            <div  onClick={handleImageClick} className="user-image relative w-[140px] h-[140px] rounded-full shadow-lg border-2 border-pink-50">
              <Image
                className="rounded-full object-cover"
                src={preview}
                alt="User Image"
                fill
              />
              <div className="absolute top-25 left-22">
                <Image src={edit} alt="Edit Icon" width={40} height={40} />
              </div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="user-name absolute left-40 top-20 w-100 grid gap-2">
              <h1 className="text-black font-semibold text-4xl">
                {userData.user?.name}
              </h1>
              <h1 className="text-black">{userData.user?._id}</h1>
            </div>
          </div>
        </div>

        <div className="mt-25">
          <UserForm data={userData.user} onUpdateSuccess={fetchUserData} />
        </div>
      </div>
      <ToastContainer/>
    </div>
        )
      }
    </div>
  );
};

export default Profile;
