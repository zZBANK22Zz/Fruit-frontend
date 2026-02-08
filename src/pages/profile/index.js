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
        setError('เกิดข้อผิดพลาดในการประมวลผลรูปภาพ กรุณาลองอีกครั้ง');
        console.error('Image compression error:', err);
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

  // Render Section
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar showBackButton={true} />
        <div className="max-w-3xl mx-auto px-6 py-12 animate-pulse">
           <div className="w-24 h-24 bg-gray-100 rounded-full mb-8"></div>
           <div className="h-8 w-48 bg-gray-100 rounded mb-4"></div>
           <div className="h-4 w-32 bg-gray-50 rounded mb-12"></div>
           <div className="space-y-8">
              {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-gray-50 rounded-lg"></div>
              ))}
           </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar showBackButton={true} />
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">เซสชั่นหมดอายุ</h2>
            <p className="text-gray-500 mb-8">กรุณาเข้าสู่ระบบใหม่อีกครั้งเพื่อดูโปรไฟล์ของคุณ</p>
            <Button 
                variant="primary" 
                className="rounded-lg px-6 py-2 bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200"
                onClick={() => router.push('/registration/LoginPage')}
            >
                เข้าสู่ระบบ
            </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 pb-20 selection:bg-orange-100 selection:text-orange-900 overflow-hidden relative">
      <Navbar showBackButton={true} />
      
      {/* Subtle Background Blobs for specific "pop" */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-yellow-200/30 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="max-w-3xl mx-auto px-6 py-12 sm:py-20 relative z-10">
        
        {/* Minimal Header with Color Accents */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 mb-16 border-b border-gray-100 pb-12">
            <div className="flex items-center gap-6">
                <div className="relative group">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-white p-1 ring-2 ring-orange-100 shadow-lg shadow-orange-100/50">
                        {imagePreview || (userData.image && `data:image/jpeg;base64,${userData.image}`) ? (
                            <img 
                                src={imagePreview || `data:image/jpeg;base64,${userData.image}`} 
                                alt="Profile" 
                                className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-500"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-orange-50 text-orange-300 rounded-full">
                                <UserIcon className="w-10 h-10" />
                            </div>
                        )}
                         {/* Edit Overlay */}
                         {isEditing && (
                            <label className="absolute inset-0 bg-black/40 backdrop-blur-[1px] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer">
                                <PencilIcon className="w-6 h-6 text-white" />
                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </label>
                        )}
                    </div>
                     {isEditing && (imagePreview || (userData.image && `data:image/jpeg;base64,${userData.image}`)) && (
                        <button onClick={handleRemoveImage} className="absolute -top-1 -right-1 bg-white text-red-500 p-1.5 rounded-full shadow-md hover:bg-red-50 border border-red-100 transition-colors">
                            <XMarkIcon className="w-3 h-3" />
                        </button>
                    )}
                </div>
                
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900">
                         <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                             {userData.first_name || userData.username}
                         </span>
                         <span className="block text-xl sm:text-2xl font-medium text-gray-400 mt-1">{userData.last_name}</span>
                    </h1>
                     <div className="flex items-center gap-3 mt-3 text-sm font-bold">
                        <span className={`px-3 py-1 rounded-full text-xs uppercase tracking-wide ${userData.role === 'admin' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                            {userData.role === 'admin' ? 'ผู้ดูแลระบบ' : 'สมาชิก'}
                        </span>
                        {isLineUser && (
                            <span className="flex items-center gap-1 text-[#06C755]">
                                <ShieldCheckIcon className="w-4 h-4" />
                                <span className="font-semibold">เชื่อมต่อ LINE แล้ว</span>
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="w-full sm:w-auto">
                {!isEditing ? (
                        <button
                            onClick={handleEdit}
                            className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-900 hover:border-orange-400 hover:text-orange-600 hover:shadow-lg hover:shadow-orange-100 transition-all duration-300 flex items-center justify-center gap-2 group"
                        >
                            <PencilIcon className="w-4 h-4 group-hover:-rotate-12 transition-transform" />
                            แก้ไขโปรไฟล์
                        </button>
                    ) : (
                        <div className="flex gap-3 w-full sm:w-auto">
                             <button
                                onClick={handleCancel}
                                disabled={isSaving}
                                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold shadow-lg shadow-orange-200 hover:shadow-orange-300 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                            >
                                {isSaving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                            </button>
                        </div>
                )}
            </div>
        </div>

        {/* Minimal Layout - List View with Icons */}
        <div className="space-y-12">
            
            {/* Section: Identity */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12">
                <div className="md:col-span-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                            <UserIcon className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">ข้อมูลระบุตัวตน</h3>
                    </div>
                    <p className="text-sm text-gray-500 pl-11">ข้อมูลพื้นฐานเกี่ยวกับตัวตนของคุณ</p>
                </div>
                <div className="md:col-span-8 space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                         <div className="group">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">ชื่อผู้ใช้</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className="block w-full border-0 border-b-2 border-gray-100 bg-transparent py-2 px-0 text-gray-900 font-bold placeholder:text-gray-300 focus:border-orange-400 focus:ring-0 transition-colors sm:text-base"
                                />
                            ) : (
                                <div className="text-lg font-medium text-gray-900">{userData.username}</div>
                            )}
                        </div>
                        
                         <div className="group">
                             <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">สถานะ</label>
                             <div className="text-lg font-bold text-green-600 flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                                ใช้งานอยู่
                             </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="group">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">ชื่อจริง</label>
                             {isEditing ? (
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleInputChange}
                                    className="block w-full border-0 border-b-2 border-gray-100 bg-transparent py-2 px-0 text-gray-900 font-bold placeholder:text-gray-300 focus:border-orange-400 focus:ring-0 transition-colors sm:text-base"
                                    placeholder="กรอกชื่อจริง"
                                />
                            ) : (
                                <div className="text-lg font-medium text-gray-900">{userData.first_name || '—'}</div>
                            )}
                        </div>
                        <div className="group">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">นามสกุล</label>
                             {isEditing ? (
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleInputChange}
                                    className="block w-full border-0 border-b-2 border-gray-100 bg-transparent py-2 px-0 text-gray-900 font-bold placeholder:text-gray-300 focus:border-orange-400 focus:ring-0 transition-colors sm:text-base"
                                    placeholder="กรอกนามสกุล"
                                />
                            ) : (
                                <div className="text-lg font-medium text-gray-900">{userData.last_name || '—'}</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-100"></div>

            {/* Section: Contact & Security */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12">
                <div className="md:col-span-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <LockClosedIcon className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">ความปลอดภัย</h3>
                    </div>
                    <p className="text-sm text-gray-500 pl-11">จัดการข้อมูลการติดต่อและรหัสผ่านของคุณ</p>
                </div>
                <div className="md:col-span-8 space-y-8">
                     <div className="group">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">อีเมล</label>
                         {isEditing ? (
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="block w-full border-0 border-b-2 border-gray-100 bg-transparent py-2 px-0 text-gray-900 font-medium placeholder:text-gray-300 focus:border-orange-400 focus:ring-0 transition-colors sm:text-base"
                            />
                        ) : (
                            <div className="text-lg font-medium text-gray-900">{userData.email}</div>
                        )}
                    </div>

                    {isEditing && (
                        <div className="group pt-4">
                             <label className="block text-xs font-bold text-red-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <LockClosedIcon className="w-3 h-3" />
                                รหัสผ่านใหม่
                             </label>
                             <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="block w-full border-0 border-b-2 border-red-100 bg-transparent py-2 px-0 text-gray-900 font-medium placeholder:text-gray-300 focus:border-red-500 focus:ring-0 transition-colors sm:text-base"
                                placeholder="เว้นว่างไว้หากไม่ต้องการเปลี่ยน"
                            />
                        </div>
                    )}
                </div>
            </div>

        </div>

      </div>

      {/* Pop Modals */}
      <Modal
        isOpen={!!error}
        onClose={() => setError('')}
        type="error"
        title="แจ้งเตือน!"
        message={error}
        buttonText="รับทราบ"
      />

      <Modal
        isOpen={!!success}
        onClose={() => setSuccess('')}
        type="success"
        title="สำเร็จ!"
        message={success}
        buttonText="ตกลง"
      />
    </div>
  );
}

