"use client";
import React, { useState, useEffect } from "react";
import fetchWithAuth from "../../../lib/fetchWithAuth";
import bel from "../../../../public/bell.png";
import Image from "next/image";

const Notifications = () => {
  const [loading, setLoading] = useState(true);
  const [notificationData, setNotificationData] = useState(null);
  const baseUrl = process.env.NEXT_PUBLIC_URL;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await fetchWithAuth(
          `${baseUrl}/user/notification?page=1&limit=10`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setNotificationData(data.data);
      } catch (error) {
        console.error("Error fetching user info:", error);
      } finally {
        setLoading(false);
      }
    };

    if (baseUrl) fetchUserData();
  }, [baseUrl]);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };



  // if (loading) return <p>Loading...</p>;
  // if (!notificationData || notificationData.length === 0) {
  //   return <p>No notifications available</p>;
  // }

  return (
    <div className="p-6 space-y-4 w-full">
      {
        loading ? (
            <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#810000]"></div>
          </div>
        ):(
            <div>
              {notificationData.map((item, index) => (
        <div
          key={index}
          className="flex items-center justify-between gap-2 border-b p-2 rounded  w-full"
        >
          <div className="flex gap-5">
            <div>
              <Image src={bel} alt="bell icon" width={24} height={24} />
            </div>
          <div className="flex justify-end float-right">
            <p className="text-gray-800 font-medium">{item.title}</p>
            

           
          </div>
          </div>
          <div>
            {item.time && (
              <p className="text-sm text-gray-500">
                {formatDate(String(item.time))}
              </p>
            )}
          </div>
        </div>
      ))}
            </div>
        )
      }
    </div>
  );
};

export default Notifications;
