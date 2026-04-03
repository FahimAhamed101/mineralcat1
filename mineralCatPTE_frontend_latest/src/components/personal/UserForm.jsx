"use client";
import React, { useState } from "react";
import { countries } from "country-data";
import fetchWithAuth from "../../lib/fetchWithAuth";
import { ToastContainer, toast } from "react-toastify";

export default function UserForm({ data, onUpdateSuccess }) {
  const [changePass, setChangePass] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_URL;

  // Helper function to get calling code by country name
  const getCallingCodeByName = (name) => {
    const country = countries.all.find((c) => c.name === name);
    return country?.countryCallingCodes[0] || "";
  };

  // Helper function to get country name by calling code
  const getCountryNameByCallingCode = (callingCode) => {
    const country = countries.all.find((c) => 
      c.countryCallingCodes && c.countryCallingCodes.includes(callingCode)
    );
    return country?.name || "";
  };

  // Function to extract country code and phone number from combined phone
  const parsePhoneData = (phone, phoneCountry) => {
    let extractedCountryCode = "";
    let extractedPhoneNumber = "";

    if (phone && phone.startsWith('+')) {
      // Phone contains country code, extract it
      const possibleCodes = countries.all
        .filter(c => c.countryCallingCodes && c.countryCallingCodes.length > 0)
        .map(c => c.countryCallingCodes[0])
        .sort((a, b) => b.length - a.length); // Sort by length descending to match longer codes first

      // Find the matching country code
      const matchingCode = possibleCodes.find(code => phone.startsWith(code));
      
      if (matchingCode) {
        extractedCountryCode = matchingCode;
        extractedPhoneNumber = phone.substring(matchingCode.length);
      } else {
        // Fallback: assume first 1-4 digits after + are country code
        const match = phone.match(/^(\+\d{1,4})(.*)/);
        if (match) {
          extractedCountryCode = match[1];
          extractedPhoneNumber = match[2];
        }
      }
    } else {
      // Phone doesn't contain country code, use phoneCountry
      if (phoneCountry && phoneCountry.startsWith('+')) {
        extractedCountryCode = phoneCountry;
      } else if (phoneCountry) {
        extractedCountryCode = getCallingCodeByName(phoneCountry);
      }
      extractedPhoneNumber = phone || "";
    }

    // Default to Bangladesh if no country code found
    if (!extractedCountryCode) {
      extractedCountryCode = getCallingCodeByName("Bangladesh");
    }

    return { countryCode: extractedCountryCode, phoneNumber: extractedPhoneNumber };
  };

  // Helper function to get country object by calling code for display
  const getCountryByCallingCode = (callingCode) => {
    return countries.all.find((c) => 
      c.countryCallingCodes && c.countryCallingCodes.includes(callingCode)
    );
  };

  const { countryCode: initialPhoneCountryCode, phoneNumber: initialPhoneNumber } = parsePhoneData(data.phone, data.phoneCountry);
  
  // Get the country object for display
  const initialCountryObj = getCountryByCallingCode(initialPhoneCountryCode);
  const displayCountryName = initialCountryObj ? initialCountryObj.name : "Bangladesh";

  const [formData, setFormData] = useState({
    _id: data._id,
    name: data.name || "",
    phoneCountry: displayCountryName, // Store country name for display
    phoneCountryCode: initialPhoneCountryCode, // Store country code for saving
    phone: initialPhoneNumber, // Only the phone number part (without country code)
    city: data.city || "",
    email: data.email || "",
    oldPassword: "",
    password: "",
  });

 
  const [originalData, setOriginalData] = useState({
    name: data.name || "",
    phoneCountry: displayCountryName,
    phoneCountryCode: initialPhoneCountryCode,
    phone: initialPhoneNumber, 
    city: data.city || ""
  });

 

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phoneCountry') {
      // When country changes, update both display name and country code
      const selectedCountry = countries.all.find(c => c.name === value);
      const countryCode = selectedCountry ? selectedCountry.countryCallingCodes[0] : "";
      
      setFormData((prev) => ({
        ...prev,
        phoneCountry: value, 
        phoneCountryCode: countryCode, 
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    
    const changedFields = {};

    
    if (formData.name.trim() !== originalData.name.trim()) {
      changedFields.name = formData.name.trim();
    }
    
    
    const combinedPhone = formData.phoneCountryCode + formData.phone.trim();
    const originalCombinedPhone = originalData.phoneCountryCode + originalData.phone.trim();
    
    if (combinedPhone !== originalCombinedPhone) {
      changedFields.phone = combinedPhone;
      console.log("Phone changed from", originalCombinedPhone, "to", combinedPhone);
    }
    
    if (formData.city.trim() !== originalData.city.trim()) {
      changedFields.city = formData.city.trim();
    }

    
    if (changePass) {
      if (!formData.oldPassword.trim() || !formData.password.trim()) {
        toast.error("Please fill in both old and new password fields.");
        return;
      }
      changedFields.oldPassword = formData.oldPassword.trim();
      changedFields.password = formData.password.trim();
    }

  
    changedFields._id = formData._id;

   
    const hasChanges = Object.keys(changedFields).length > 1; // More than just _id
    if (!hasChanges && !changePass) {
      toast.info("No changes detected.");
      return;
    }

    try {
      const response = await fetchWithAuth(`${baseUrl}/user/update-user`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(changedFields),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error:", errorData);
        
        // Show specific error message if available
        if (errorData.message) {
          toast.error(errorData.message);
        } else {
          toast.error(`Update failed: ${response.status} - ${response.statusText}`);
        }
        return;
      }

      const result = await response.json();
      console.log("Update successful:", result);
      
      toast.success("Profile updated successfully!");

    
      setFormData((prev) => ({
        ...prev,
        oldPassword: "",
        password: "",
      }));
      setChangePass(false);

      
      if (changedFields.name !== undefined) {
        data.name = changedFields.name;
      }
      if (changedFields.phone !== undefined) {
        data.phone = changedFields.phone;
        
        data.phoneCountry = formData.phoneCountryCode;
      }
      if (changedFields.city !== undefined) {
        data.city = changedFields.city;
      }

     
      const { countryCode: newCountryCode, phoneNumber: newPhoneNumber } = parsePhoneData(data.phone, data.phoneCountry);
      const newCountryObj = getCountryByCallingCode(newCountryCode);
      const newDisplayCountryName = newCountryObj ? newCountryObj.name : "Bangladesh";

      
      setOriginalData({
        name: data.name || "",
        phoneCountry: newDisplayCountryName,
        phoneCountryCode: newCountryCode,
        phone: newPhoneNumber,
        city: data.city || ""
      });

      if (onUpdateSuccess) {
        toast.success("Profile updated successfully!");
window.location.reload();
        await onUpdateSuccess();
      }
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Update failed. Please try again.");
    }
  };

  return (
    <div>
      <div className="border-2 border-[#C38ABA]"></div>
      <div>
        <form onSubmit={handleSubmit} className="space-y-6 mt-10 md:mx-15">
          {/* Name */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <label
              htmlFor="name"
              className="w-full sm:w-32 font-semibold text-gray-700 mb-1 sm:mb-0"
            >
              Name
            </label>
            <div className="flex-1">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 bg-slate-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                required
                placeholder="Your name"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <label
              htmlFor="phone"
              className="w-full sm:w-32 font-semibold text-gray-700 mb-1 sm:mb-0"
            >
              Phone
            </label>
            <div className="flex-1 flex gap-2">
              <select
                id="phoneCountry"
                name="phoneCountry"
                value={formData.phoneCountry}
                onChange={handleChange}
                className="w-1/4 bg-slate-100 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              >
                {countries.all
                  .filter((country) => country.countryCallingCodes && country.countryCallingCodes.length > 0)
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((country) => (
                    <option key={country.alpha2} value={country.name}>
                      {country.name} ({country.countryCallingCodes[0]})
                    </option>
                  ))}
              </select>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border bg-slate-100 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                required
              />
            </div>
          </div>

          {/* City */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <label
              htmlFor="city"
              className="w-full sm:w-32 font-semibold text-gray-700 mb-1 sm:mb-0"
            >
              City
            </label>
            <div className="flex-1">
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full border bg-slate-100 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                required
                placeholder="City"
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <label
              htmlFor="email"
              className="w-full sm:w-32 font-semibold text-gray-700 mb-1 sm:mb-0"
            >
              Email
            </label>
            <div className="flex-1">
              <input
                disabled
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border bg-slate-100 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                readOnly
              />
            </div>
          </div>

          {/* Password Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <label
              htmlFor="password"
              className="w-full sm:w-32 font-semibold text-gray-700 mb-1 sm:mb-0"
            >
              Password
            </label>
            <div>
              {!changePass ? (
                <button
                  type="button"
                  className="bg-[#7D0000] text-white rounded p-2 px-3"
                  onClick={() => setChangePass(true)}
                >
                  Change Password
                </button>
              ) : (
                <div className="grid gap-2 md:flex md:gap-5 text-black w-full">
                  <input
                    type="password"
                    id="old-password"
                    name="oldPassword"
                    placeholder="Old Password"
                    value={formData.oldPassword}
                    onChange={handleChange}
                    className="w-full border bg-slate-100 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    required
                  />
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="New Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full border bg-slate-100 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    required
                  />
                  <button
                    type="button"
                    className="bg-[#7D0000] text-white rounded p-2 px-3"
                    onClick={() => {
                      setChangePass(false);
                      setFormData((prev) => ({
                        ...prev,
                        password: "",
                        oldPassword: "",
                      }));
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="bg-gradient-to-r from-[#D80000] to-[#720000] p-3 font-medium px-15 rounded-full text-white float-end"
          >
            Update Profile
          </button>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
}