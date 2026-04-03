/* eslint-disable react-hooks/rules-of-hooks */
import { useState, useRef } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Card, CardContent } from "../../../components/ui/card";
import { Edit } from "lucide-react";
import { useGetLoggedInUser } from "../../../lib/logIn/useGetLoggedInUser";
import dummyPhoto from "/user.svg";
import fetchWithAuth from "../../../utils/fetchWithAuth";
import { toast } from "react-toastify";

export default function PersonalInformation() {
  const { data: user, isLoading, isError, error } = useGetLoggedInUser();

  const baseUrl = import.meta.env.VITE_ADMIN_URL;
  const [editMode, setEditMode] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [userInfo, setUserInfo] = useState({
    name: user?.user?.name || "Md. Nazmus Sakib",
    email: user?.user?.email || "engrsakib02@gmail.com",
    phone: user?.user?.phone || "3000597212",
    countryCode: user?.user?.countryCode || "+1242",
    role: user?.user?.role || "Admin",
    profileImage: user?.user?.profile || dummyPhoto,
    displayName: user?.user?.name || "Silvan",
  });

  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");

  // Password change states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Image upload
  const fileInputRef = useRef();

  if (isLoading) {
    return <div className="p-6 text-center text-gray-500">Loading...</div>;
  }
  if (isError) {
    return (
      <div className="p-6 text-center text-red-600">
        Error: {error.message || "Failed to fetch user data"}
      </div>
    );
  }

  // Handle Edit Profile button
  const handleEditProfile = () => {
    setEditMode(true);
    setShowPasswordForm(false);
    setUpdateError("");
    setUpdateSuccess("");
  };

  // Save edited profile (PUT form-data)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateError("");
    setUpdateSuccess("");
    try {
      const formData = new FormData();
      formData.append("name", userInfo.name);
      formData.append("phone", userInfo.phone);
      if (userInfo.profileImage && typeof userInfo.profileImage !== "string") {
        formData.append("profile", userInfo.profileImage); // image file
      }
      const res = await fetchWithAuth(`${baseUrl}/user/update-user`, {
        method: "PUT",
        body: formData,
      });
      if (!res.ok) {
        let err = null;
        try {
          err = await res.json();
        } catch {
          throw new Error("Failed to update profile");
        }
        throw new Error(err?.message || "Failed to update profile");
      }
      setUpdateSuccess("Profile updated successfully!");
      setEditMode(false);
      toast.success("Profile updated!");
    } catch (err) {
      setUpdateError(err.message || "Failed to update profile");
      toast.error("Failed to update profile");
    } finally {
      setUpdateLoading(false);
    }
  };

  // Handle change for editable fields
  const handleInputChange = (field, value) => {
    setUserInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserInfo((prev) => ({
        ...prev,
        profileImage: file,
        previewImage: URL.createObjectURL(file),
      }));
    }
  };

  // Password change
  const handleChangePassword = () => {
    setShowPasswordForm(true);
    setEditMode(false);
    setPasswordError("");
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordLoading(true);
    if (!oldPassword || !newPassword || !retypePassword) {
      setPasswordError("All fields required");
      setPasswordLoading(false);
      return;
    }
    if (newPassword !== retypePassword) {
      setPasswordError("Password and Retype Password do not match!");
      setPasswordLoading(false);
      return;
    }
    try {
      // Send as form-data with password fields
      const formData = new FormData();
      formData.append("oldPassword", oldPassword);
      formData.append("password", newPassword);
      const res = await fetchWithAuth(`${baseUrl}/user/update-user`, {
        method: "PUT",
        body: formData,
      });
      if (!res.ok) {
        let err = null;
        try {
          err = await res.json();
        } catch {
          throw new Error(err?.message || "Failed to change password");
        }
        throw new Error(err?.message || "Failed to change password");
      }
      toast.success("Password changed successfully!");
      setShowPasswordForm(false);
      setOldPassword("");
      setNewPassword("");
      setRetypePassword("");
    } catch (err) {
      setPasswordError(err.message || "Failed to change password");
      toast.error("Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  // console.log(userInfo)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-red-800 text-white p-6">
        <h1 className="text-2xl font-semibold">Personal Information</h1>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Section */}
            <div className="lg:col-span-1">
              <Card className="p-6 text-center">
                <CardContent className="space-y-4">
                  {/* Profile Image */}
                  <div className="relative mx-auto w-32 h-32">
                    <img
                      src={
                        userInfo.profile
                          ? userInfo.previewImage
                          : typeof userInfo.profileImage === "string"
                          ? userInfo.profileImage
                          : dummyPhoto
                      }
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover border-4 border-red-800"
                    />
                    {editMode && (
                      <>
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          style={{ display: "none" }}
                          onChange={handleImageChange}
                        />
                        <Button
                          type="button"
                          className="absolute bottom-2 right-2 bg-white text-red-800 border border-red-800 rounded-full p-2 shadow hover:bg-red-100"
                          onClick={() => fileInputRef.current.click()}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Name and Role */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {userInfo.name}
                    </h2>
                    <p className="text-gray-600">{userInfo.role}</p>
                  </div>

                  {/* Edit Profile Button */}
                  {!editMode && !showPasswordForm && (
                    <Button
                      onClick={handleEditProfile}
                      className="bg-red-800 hover:bg-red-900 text-white w-full"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                  {updateSuccess && (
                    <div className="text-green-600 text-xs mt-2">
                      {updateSuccess}
                    </div>
                  )}
                  {updateError && (
                    <div className="text-red-600 text-xs mt-2">
                      {updateError}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Information Form Section */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <CardContent className="space-y-6">
                  {/* Change Password Button */}
                  {!editMode && !showPasswordForm && (
                    <div className="flex justify-end">
                      <Button
                        onClick={handleChangePassword}
                        className="bg-red-800 hover:bg-red-900 text-white"
                      >
                        Change Password
                      </Button>
                    </div>
                  )}

                  {/* Edit Profile Form */}
                  {editMode && (
                    <form onSubmit={handleSaveProfile} className="space-y-6">
                      {/* Name Field */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="name"
                          className="text-sm font-medium text-gray-700"
                        >
                          Name
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          value={userInfo.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          className="bg-gray-100 border-gray-300"
                        />
                      </div>

                      {/* Email Field */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="email"
                          className="text-sm font-medium text-gray-700"
                        >
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={userInfo.email}
                          readOnly
                          className="bg-gray-100 border-gray-300"
                        />
                      </div>

                      {/* Phone Number Field */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="phone"
                          className="text-sm font-medium text-gray-700"
                        >
                          Phone Number
                        </Label>
                        <div className="flex">
                          <div className="flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                            <span className="text-lg mr-2">🇺🇸</span>
                            <span className="text-sm text-gray-600">
                              {userInfo.countryCode}
                            </span>
                          </div>
                          <Input
                            id="phone"
                            type="tel"
                            value={userInfo.phone}
                            onChange={(e) =>
                              handleInputChange("phone", e.target.value)
                            }
                            className="bg-gray-100 border-gray-300 rounded-l-none"
                          />
                        </div>
                      </div>
                      {/* Submit Button */}
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          onClick={() => setEditMode(false)}
                          className="bg-gray-200 text-gray-800"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="bg-red-800 hover:bg-red-900 text-white"
                          disabled={updateLoading}
                        >
                          {updateLoading ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    </form>
                  )}

                  {/* Change Password Form */}
                  {showPasswordForm && (
                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="oldPassword"
                          className="text-sm font-medium text-gray-700"
                        >
                          Old Password
                        </Label>
                        <Input
                          id="oldPassword"
                          type="password"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          className="bg-gray-100 border-gray-300"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="password"
                          className="text-sm font-medium text-gray-700"
                        >
                          New Password
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="bg-gray-100 border-gray-300"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="retypePassword"
                          className="text-sm font-medium text-gray-700"
                        >
                          Retype New Password
                        </Label>
                        <Input
                          id="retypePassword"
                          type="password"
                          value={retypePassword}
                          onChange={(e) => setRetypePassword(e.target.value)}
                          className="bg-gray-100 border-gray-300"
                          required
                        />
                      </div>
                      {passwordError && (
                        <div className="text-red-600 text-xs">
                          {passwordError}
                        </div>
                      )}
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          onClick={() => setShowPasswordForm(false)}
                          className="bg-gray-200 text-gray-800"
                          disabled={passwordLoading}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="bg-red-800 hover:bg-red-900 text-white"
                          disabled={passwordLoading}
                        >
                          {passwordLoading ? "Saving..." : "Save Password"}
                        </Button>
                      </div>
                    </form>
                  )}

                  {/* Read-only info fields */}
                  {!editMode && !showPasswordForm && (
                    <div className="space-y-6">
                      {/* Name Field */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="name"
                          className="text-sm font-medium text-gray-700"
                        >
                          Name
                        </Label>
                        <Input
                          id="name"
                          readOnly
                          type="text"
                          value={userInfo.displayName}
                          className="bg-gray-100 border-gray-300"
                        />
                      </div>

                      {/* Email Field */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="email"
                          className="text-sm font-medium text-gray-700"
                        >
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={userInfo.email}
                          readOnly
                          className="bg-gray-100 border-gray-300"
                        />
                      </div>

                      {/* Phone Number Field */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="phone"
                          className="text-sm font-medium text-gray-700"
                        >
                          Phone Number
                        </Label>
                        <div className="flex">
                          <div className="flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                            <span className="text-lg mr-2">🇺🇸</span>
                            <span className="text-sm text-gray-600">
                              {userInfo.countryCode}
                            </span>
                          </div>
                          <Input
                            id="phone"
                            type="tel"
                            value={userInfo.phone}
                            readOnly
                            className="bg-gray-100 border-gray-300 rounded-l-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
