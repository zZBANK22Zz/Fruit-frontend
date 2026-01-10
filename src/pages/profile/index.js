import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { 
  UserIcon, 
  PencilIcon, 
  EnvelopeIcon, 
  LockClosedIcon,
  PhoneIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import Navbar from "../../components/Navbar";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import { compressImage, validateImageFile } from "../../utils/imageUtils";
import { notifySuccess } from "../../utils/notificationUtils";
import { handleTokenExpiration } from "../../utils/authUtils";

export default function ProfilePage() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLineUser, setIsLineUser] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      let initialUserData = null;

      if (storedUser) {
        initialUserData = JSON.parse(storedUser);
      } else if (token) {
        const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;
        if (apiUrl) {
          const response = await fetch(`${apiUrl}/api/users/profile`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.data && data.data.user) {
              initialUserData = data.data.user;
              localStorage.setItem('user', JSON.stringify(initialUserData));
            }
          } else if (response.status === 401) {
            handleTokenExpiration(true, router.push);
            return;
          }
        }
      }

      if (!initialUserData) {
        if (!token) router.push('/registration/LoginPage');
        return;
      }

      // Check if logged in with LINE
      try {
        const liff = (await import('@line/liff')).default;
        if (liff.isLoggedIn()) {
          const profile = await liff.getProfile();
          // Override email with Line ID for display
          initialUserData.email = profile.userId;
          setIsLineUser(true);
        }
      } catch (err) {
        console.error('LIFF check failed:', err);
      }

      setUserData(initialUserData);
      setFormData({
        username: initialUserData.username || '',
        email: initialUserData.email || '',
        first_name: initialUserData.first_name || '',
        last_name: initialUserData.last_name || '',
        password: '',
        image: initialUserData.image || null
      });
      setImagePreview(initialUserData.image ? `data:image/jpeg;base64,${initialUserData.image}` : null);

    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    setSuccess('');
    // Reset form data to original user data
    if (userData) {
      setFormData({
        username: userData.username || '',
        email: userData.email || '',
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        password: '',
        image: userData.image || null // Reset to current user image
      });
      setImagePreview(userData.image ? `data:image/jpeg;base64,${userData.image}` : null);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file
      const validation = validateImageFile(file, 5);
      if (!validation.valid) {
        setError(validation.error);
        return;
      }

      try {
        // Show loading state
        setIsSaving(true);
        setError('');
        
        // Compress and resize image before converting to base64
        const compressedBase64 = await compressImage(file, 800, 800, 0.8);
        
        // Update form data with compressed image
        setFormData(prev => ({
          ...prev,
          image: compressedBase64
        }));
        
        // Create preview from compressed image
        setImagePreview(`data:image/jpeg;base64,${compressedBase64}`);
        
        // Clear any previous errors
        setError('');
      } catch (err) {
        console.error('Image compression error:', err);
        setError('เกิดข้อผิดพลาดในการประมวลผลรูปภาพ กรุณาลองอีกครั้ง');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null
    }));
    setImagePreview(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      // Validation
      if (!formData.username || !formData.email) {
        setError('กรุณากรอกชื่อผู้ใช้และอีเมล');
        setIsSaving(false);
        return;
      }

      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;

      if (!token || !apiUrl) {
        setError('ไม่พบข้อมูลการเข้าสู่ระบบ');
        setIsSaving(false);
        return;
      }

      // Prepare update data - only include fields that have changed
      const updateData = {};
      let hasChanges = false;
      
      // Check if username changed
      if (formData.username !== userData.username) {
        updateData.username = formData.username;
        hasChanges = true;
      }
      
      // Check if email changed
      if (formData.email !== userData.email) {
        updateData.email = formData.email;
        hasChanges = true;
      }
      
      // Check if first_name changed
      const currentFirstName = userData.first_name || '';
      const newFirstName = formData.first_name || '';
      if (newFirstName !== currentFirstName) {
        updateData.first_name = formData.first_name || null;
        hasChanges = true;
      }
      
      // Check if last_name changed
      const currentLastName = userData.last_name || '';
      const newLastName = formData.last_name || '';
      if (newLastName !== currentLastName) {
        updateData.last_name = formData.last_name || null;
        hasChanges = true;
      }
      
      // Only include password if user wants to change it
      if (formData.password && formData.password.trim() !== '') {
        updateData.password = formData.password;
        hasChanges = true;
      }

      // Check if image changed by comparing with current userData.image
      const currentImage = userData.image || null;
      const formImage = formData.image || null;
      
      // Only update image if it actually changed
      if (currentImage !== formImage) {
        // If formImage is null and currentImage exists, user wants to remove image
        // If formImage exists and is different from currentImage, user uploaded new image
        updateData.image = formImage; // base64 string or null
        hasChanges = true;
      }
      // If images are the same, don't include image in updateData (preserve existing image)
      
      // If no fields changed, show error
      if (!hasChanges) {
        setError('ไม่มีข้อมูลที่เปลี่ยนแปลง');
        setIsSaving(false);
        return;
      }
      
      // Always include username and email for backend validation
      // Use current values if not changed, or new values if changed
      updateData.username = updateData.username !== undefined ? updateData.username : userData.username;
      updateData.email = updateData.email !== undefined ? updateData.email : userData.email;

      const response = await fetch(`${apiUrl}/api/users/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'ไม่สามารถอัปเดตข้อมูลได้');
      }

      // Update local state
      if (data.data && data.data.user) {
        const updatedUser = data.data.user;
        setUserData(updatedUser);
        setFormData(prev => ({
          ...prev,
          password: '', // Clear password field after successful update
          image: updatedUser.image || null // Preserve image from updated user data
        }));
        setImagePreview(updatedUser.image ? `data:image/jpeg;base64,${updatedUser.image}` : null);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setIsEditing(false);
        setSuccess('อัปเดตข้อมูลสำเร็จ');
        
        // Add success notification
        notifySuccess('อัปเดตโปรไฟล์สำเร็จ', 'ข้อมูลโปรไฟล์ของคุณได้รับการอัปเดตเรียบร้อยแล้ว');
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
      console.error('Update profile error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-50">
        <Navbar showBackButton={true} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-pulse">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-8">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-white/20"></div>
                <div className="space-y-2">
                  <div className="h-6 w-48 bg-white/20 rounded"></div>
                  <div className="h-4 w-64 bg-white/20 rounded"></div>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-10 w-full bg-gray-100 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar showBackButton={true} />
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-600">ไม่พบข้อมูลผู้ใช้</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-50">
      <Navbar showBackButton={true} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 px-6 py-10 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute inset-0 bg-black/5"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
            
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg ring-4 ring-white/50 transition-all duration-300 hover:scale-110 hover:ring-8 hover:shadow-2xl overflow-hidden">
                    {imagePreview || (userData.image && `data:image/jpeg;base64,${userData.image}`) ? (
                      <img 
                        src={imagePreview || `data:image/jpeg;base64,${userData.image}`} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-14 h-14 text-orange-500 transition-transform duration-300 group-hover:scale-110" />
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center cursor-pointer transition-opacity duration-200 hover:bg-black/60 z-10">
                      <PencilIcon className="w-6 h-6 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                  {isEditing && (imagePreview || (userData.image && `data:image/jpeg;base64,${userData.image}`)) && (
                    <button
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-20"
                      type="button"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md mb-1">
                    {userData.first_name && userData.last_name
                      ? `${userData.first_name} ${userData.last_name}`
                      : userData.username || 'ผู้ใช้'}
                  </h1>
                  <div className="flex items-center gap-2 mt-2">
                    <EnvelopeIcon className="w-4 h-4 text-orange-100" />
                    <p className="text-orange-100 text-sm sm:text-base">{userData.email}</p>
                  </div>
                  {isLineUser && (
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                      <ShieldCheckIcon className="w-3 h-3 text-white" />
                      <span className="text-xs font-semibold text-white">LINE User</span>
                    </div>
                  )}
                  {userData.role === 'admin' && (
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                      <ShieldCheckIcon className="w-3 h-3 text-white" />
                      <span className="text-xs font-semibold text-white">ผู้ดูแลระบบ</span>
                    </div>
                  )}
                </div>
              </div>
              {!isEditing && (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleEdit}
                  leftIcon={<PencilIcon className="w-5 h-5" />}
                  className="shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 bg-white/90 backdrop-blur-sm"
                >
                  แก้ไขโปรไฟล์
                </Button>
              )}
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-10 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full shadow-lg"></div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">ข้อมูลส่วนตัว</h2>
                <p className="text-sm text-gray-500 mt-1">จัดการข้อมูลโปรไฟล์ของคุณ</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Username */}
              <div className="group transition-all duration-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-orange-50 rounded-xl p-5 border border-transparent hover:border-orange-100">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  <span>ชื่อผู้ใช้</span>
                </label>
                {isEditing ? (
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none transition-colors duration-200 group-focus-within:text-orange-500" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 text-gray-800 transition-all duration-200 bg-white shadow-sm hover:shadow-md focus:shadow-lg"
                      required
                    />
                  </div>
                ) : (
                  <p className="text-gray-800 text-lg font-semibold mt-1 pl-1">{userData.username || '-'}</p>
                )}
              </div>

              {/* First Name */}
              <div className="group transition-all duration-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-orange-50 rounded-xl p-5 border border-transparent hover:border-orange-100">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  <span>ชื่อ</span>
                </label>
                {isEditing ? (
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none transition-colors duration-200 group-focus-within:text-orange-500" />
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 text-gray-800 transition-all duration-200 bg-white shadow-sm hover:shadow-md focus:shadow-lg"
                    />
                  </div>
                ) : (
                  <p className="text-gray-800 text-lg font-semibold mt-1 pl-1">{userData.first_name || '-'}</p>
                )}
              </div>

              {/* Last Name */}
              <div className="group transition-all duration-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-orange-50 rounded-xl p-5 border border-transparent hover:border-orange-100">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  <span>นามสกุล</span>
                </label>
                {isEditing ? (
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none transition-colors duration-200 group-focus-within:text-orange-500" />
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 text-gray-800 transition-all duration-200 bg-white shadow-sm hover:shadow-md focus:shadow-lg"
                    />
                  </div>
                ) : (
                  <p className="text-gray-800 text-lg font-semibold mt-1 pl-1">{userData.last_name || '-'}</p>
                )}
              </div>

              {/* Email */}
              <div className="group transition-all duration-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-orange-50 rounded-xl p-5 border border-transparent hover:border-orange-100">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <EnvelopeIcon className="w-4 h-4" />
                  <span>{isLineUser ? 'LINE ID' : 'อีเมล'}</span>
                </label>
                {isEditing ? (
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none transition-colors duration-200 group-focus-within:text-orange-500" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 text-gray-800 transition-all duration-200 bg-white shadow-sm hover:shadow-md focus:shadow-lg"
                      required
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 mt-1">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <EnvelopeIcon className="w-5 h-5 text-orange-600" />
                    </div>
                    <p className="text-gray-800 text-lg font-semibold">{userData.email || '-'}</p>
                  </div>
                )}
              </div>

              {/* Password (only show in edit mode) */}
              {isEditing && (
                <div className="group transition-all duration-300 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 rounded-xl p-5 border-2 border-dashed border-orange-300 bg-gradient-to-br from-orange-50/80 to-orange-100/40 shadow-sm mt-2">
                  <label className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <LockClosedIcon className="w-4 h-4" />
                    <span>รหัสผ่านใหม่</span>
                    <span className="text-xs font-normal normal-case text-orange-600 ml-auto">(ไม่บังคับ)</span>
                  </label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-orange-500 pointer-events-none transition-colors duration-200 group-focus-within:text-orange-600" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-orange-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 text-gray-800 transition-all duration-200 bg-white shadow-sm hover:shadow-md focus:shadow-lg placeholder:text-gray-400"
                      placeholder="กรอกรหัสผ่านใหม่ (เว้นว่างไว้หากไม่ต้องการเปลี่ยน)"
                    />
                  </div>
                  <p className="text-xs text-orange-600 mt-2 ml-1">เว้นว่างไว้หากไม่ต้องการเปลี่ยนรหัสผ่าน</p>
                </div>
              )}

              {/* Phone (read-only) */}
              {userData.phone && (
                <div className="group transition-all duration-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 rounded-xl p-5 border border-transparent hover:border-blue-100">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <PhoneIcon className="w-4 h-4" />
                    <span>เบอร์โทรศัพท์</span>
                  </label>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <PhoneIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-gray-800 text-lg font-semibold">{userData.phone}</p>
                  </div>
                </div>
              )}

              {/* Role (read-only) */}
              <div className="group transition-all duration-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-purple-50 rounded-xl p-5 border border-transparent hover:border-purple-100">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <ShieldCheckIcon className="w-4 h-4" />
                  <span>บทบาท</span>
                </label>
                <div className="flex items-center gap-3 mt-1">
                  <div className={`p-2 rounded-lg ${userData.role === 'admin' ? 'bg-orange-100' : 'bg-gray-100'}`}>
                    <ShieldCheckIcon className={`w-5 h-5 ${userData.role === 'admin' ? 'text-orange-600' : 'text-gray-500'}`} />
                  </div>
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-sm transition-all duration-200 ${
                    userData.role === 'admin' 
                      ? 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 ring-2 ring-orange-200' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {userData.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้ทั่วไป'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="mt-10 pt-8 border-t-2 border-gray-200 bg-gradient-to-r from-gray-50/50 to-orange-50/50 -mx-6 sm:-mx-8 px-6 sm:px-8 py-6 rounded-b-2xl">
                <div className="flex flex-col sm:flex-row gap-4 justify-end">
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={handleCancel}
                    disabled={isSaving}
                    leftIcon={<XMarkIcon className="w-5 h-5" />}
                    className="transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 border-gray-300"
                  >
                    ยกเลิก
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleSave}
                    isLoading={isSaving}
                    disabled={isSaving}
                    leftIcon={!isSaving && <CheckCircleIcon className="w-5 h-5" />}
                    className="transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl ring-4 ring-orange-200/50"
                  >
                    {isSaving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Modal */}
      <Modal
        isOpen={!!error}
        onClose={() => setError('')}
        type="error"
        title="เกิดข้อผิดพลาด"
        message={error}
        buttonText="ปิด"
      />

      {/* Success Modal */}
      <Modal
        isOpen={!!success}
        onClose={() => setSuccess('')}
        type="success"
        title="สำเร็จ"
        message={success}
        buttonText="ปิด"
      />
    </div>
  );
}

