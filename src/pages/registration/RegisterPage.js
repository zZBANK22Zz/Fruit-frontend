import { useState } from "react";
import { useRouter } from "next/router";
import { 
    ArrowLeftIcon, 
    CheckCircleIcon, 
    XCircleIcon,
    UserIcon,
    EnvelopeIcon,
    LockClosedIcon
} from "@heroicons/react/24/outline";
import Button from "../../components/Button";
import Modal from "../../components/Modal";

const RegisterPage = () => {
    const router = useRouter();

    const [userdata, setUserdata] = useState({
        firstname: '',
        lastname: '',
        username: '',
        password: '',
        email: '',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    //api call to backend
    const registerUser = async () => {
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;
            
            if (!apiUrl) {
                throw new Error('API URL is not configured. Please check your environment variables.');
            }

            // Transform data to match backend API expectations
            const requestData = {
                username: userdata.username,
                email: userdata.email,
                password: userdata.password,
                first_name: userdata.firstname,
                last_name: userdata.lastname,
            };

            const response = await fetch(`${apiUrl}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed. Please try again.');
            }

            setSuccess(data.message || 'Registration successful!');
            console.log('Registration successful:', data);
            
            // Redirect to login page after successful registration
            setTimeout(() => {
                router.push('/registration/LoginPage');
            }, 2000);

        } catch (err) {
            setError(err.message || 'An error occurred during registration. Please try again.');
            console.error('Registration error:', err);
        } finally {
            setIsLoading(false);
        }
    }

    const handleChange = (e) => {
        setUserdata({ ...userdata, [e.target.name]: e.target.value });
    };

    // Password validation
    const isLengthValid = userdata.password.length > 8;
    const hasNoSpaces = !userdata.password.includes(' ');
    const isPasswordValid = isLengthValid && hasNoSpaces;

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!isPasswordValid) {
            alert('กรุณาตรวจสอบรหัสผ่านให้ถูกต้อง');
            return;
        }
        
        registerUser();
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-100 via-white to-orange-100 px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 flex flex-col justify-center relative">
            {/* Back Arrow */}
            <div className="absolute top-4 sm:top-6 md:top-8 left-4 sm:left-6 md:left-8 z-10">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/registration/LoginPage')}
                    leftIcon={<ArrowLeftIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                    className="text-gray-400 hover:text-gray-600"
                >
                    กลับไปหน้าล็อคอิน
                </Button>
            </div>

            <div className="flex flex-col items-center max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto w-full">
                {/* Fruit Illustration */}
                <div className="mb-4 sm:mb-6">
                    <img 
                        src="/images/logo.png" 
                        alt="แก้วมังกร" 
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-6 sm:mb-8 text-center">สมัครสมาชิก</h1>

                {/* Form */}
                <form className="w-full flex flex-col gap-4 sm:gap-5 md:gap-6" onSubmit={handleSubmit}>
                    {/* First Name */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="firstname" className="text-black font-medium text-sm sm:text-base">ชื่อจริง</label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-gray-400 pointer-events-none" />
                            <input 
                                className="border-2 border-gray-300 rounded-lg p-2.5 sm:p-3 md:p-3.5 w-full pl-10 sm:pl-11 md:pl-12 lg:pl-14 text-sm sm:text-base focus:outline-none focus:border-orange-400" 
                                type="text" 
                                id="firstname"
                                name="firstname"
                                value={userdata.firstname}
                                onChange={handleChange}
                                placeholder="Enter your first name" 
                            />
                        </div>
                    </div>

                    {/* Last Name */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="lastname" className="text-black font-medium text-sm sm:text-base">นามสกุล</label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-gray-400 pointer-events-none" />
                            <input 
                                className="border-2 border-gray-300 rounded-lg p-2.5 sm:p-3 md:p-3.5 w-full pl-10 sm:pl-11 md:pl-12 lg:pl-14 text-sm sm:text-base focus:outline-none focus:border-orange-400" 
                                type="text" 
                                id="lastname"
                                name="lastname"
                                value={userdata.lastname}
                                onChange={handleChange}
                                placeholder="Enter your last name" 
                            />
                        </div>
                    </div>

                    {/* Username */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="username" className="text-black font-medium text-sm sm:text-base">ชื่อผู้ใช้</label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-gray-400 pointer-events-none" />
                            <input 
                                className="border-2 border-gray-300 rounded-lg p-2.5 sm:p-3 md:p-3.5 w-full pl-10 sm:pl-11 md:pl-12 lg:pl-14 text-sm sm:text-base focus:outline-none focus:border-orange-400" 
                                type="text" 
                                id="username"
                                name="username"
                                value={userdata.username}
                                onChange={handleChange}
                                placeholder="Enter your username" 
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="email" className="text-black font-medium text-sm sm:text-base">อีเมล</label>
                        <div className="relative">
                            <EnvelopeIcon className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-gray-400 pointer-events-none" />
                            <input 
                                className="border-2 border-gray-300 rounded-lg p-2.5 sm:p-3 md:p-3.5 w-full pl-10 sm:pl-11 md:pl-12 lg:pl-14 text-sm sm:text-base focus:outline-none focus:border-orange-400" 
                                type="email" 
                                id="email"
                                name="email"
                                value={userdata.email}
                                onChange={handleChange}
                                placeholder="Enter your email" 
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="password" className="text-black font-medium text-sm sm:text-base">รหัสผ่าน</label>
                        <div className="relative">
                            <LockClosedIcon className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-gray-400 pointer-events-none" />
                            <input 
                                className={`border-2 rounded-lg p-2.5 sm:p-3 md:p-3.5 w-full pl-10 sm:pl-11 md:pl-12 lg:pl-14 text-sm sm:text-base focus:outline-none ${
                                    userdata.password && !isPasswordValid 
                                        ? 'border-red-400 focus:border-red-500' 
                                        : userdata.password && isPasswordValid
                                        ? 'border-green-400 focus:border-green-500'
                                        : 'border-gray-300 focus:border-orange-400'
                                }`}
                                type="password" 
                                id="password"
                                name="password"
                                placeholder="Enter your password"
                                value={userdata.password}
                                onChange={handleChange}
                            />
                        </div>
                        
                        {/* Password Requirements */}
                        <div className="mt-2 ml-2 sm:ml-4 space-y-1">
                            <p className={`text-xs sm:text-sm flex items-center gap-2 ${
                                userdata.password ? (isLengthValid ? 'text-green-600' : 'text-red-600') : 'text-gray-600'
                            }`}>
                                {userdata.password ? (
                                    isLengthValid ? (
                                        <CheckCircleIcon className="w-4 h-4" />
                                    ) : (
                                        <XCircleIcon className="w-4 h-4" />
                                    )
                                ) : (
                                    <span>•</span>
                                )}
                                รหัสผ่านต้องมากกว่า 8 ตัวอักษร
                            </p>
                            <p className={`text-xs sm:text-sm flex items-center gap-2 ${
                                userdata.password ? (hasNoSpaces ? 'text-green-600' : 'text-red-600') : 'text-gray-600'
                            }`}>
                                {userdata.password ? (
                                    hasNoSpaces ? (
                                        <CheckCircleIcon className="w-4 h-4" />
                                    ) : (
                                        <XCircleIcon className="w-4 h-4" />
                                    )
                                ) : (
                                    <span>•</span>
                                )}
                                รหัสผ่านต้องไม่มีช่องว่าง
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                                <span>•</span>
                                รหัสผ่านสามารถประกอบด้วยตัวอักษรพิเศษได้ เช่น $#@/
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600 text-left ml-2 sm:ml-4">(จะใส่หรือไม่ก็ได้)</p>
                        </div>
                    </div>

                    {/* Register Button */}
                    <div className="mt-2 sm:mt-3 md:mt-4">
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            fullWidth
                            isLoading={isLoading}
                            disabled={!isPasswordValid}
                        >
                            {isLoading ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน'}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Error Modal */}
            <Modal
                isOpen={!!error}
                onClose={() => setError('')}
                type="error"
                title="การลงทะเบียนไม่สำเร็จ"
                message={error}
                buttonText="ปิด"
            />

            {/* Success Modal */}
            <Modal
                isOpen={!!success}
                onClose={() => {
                    setSuccess('');
                    router.push('/registration/LoginPage');
                }}
                type="success"
                title="ลงทะเบียนสำเร็จ"
                message={success}
                buttonText="ไปหน้าเข้าสู่ระบบ"
            />
        </div>
    );
}

export default RegisterPage;