import { useState } from "react";
import { useRouter } from "next/router";
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import Button from "../../components/Button";

const LoginPage = () => {
    const router = useRouter();

    const [loginData, setLoginData] = useState({
        email: '',
        password: '',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
    };

    // API call to backend
    const loginUser = async () => {
        setIsLoading(true);
        setError('');

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;
            
            if (!apiUrl) {
                throw new Error('API URL is not configured. Please check your environment variables.');
            }

            const response = await fetch(`${apiUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed. Please try again.');
            }

            // Store token and user data
            if (data.data && data.data.token) {
                localStorage.setItem('token', data.data.token);
                localStorage.setItem('user', JSON.stringify(data.data.user));
            }

            console.log('Login successful:', data);
            
            // Redirect to home page after successful login
            router.push('/');

        } catch (err) {
            setError(err.message || 'An error occurred during login. Please try again.');
            console.error('Login error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!loginData.email || !loginData.password) {
            setError('กรุณากรอกอีเมลและรหัสผ่าน');
            return;
        }
        
        loginUser();
    };

    const isFormValid = loginData.email.trim() !== '' && loginData.password.trim() !== '';

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-100 via-white to-orange-100 px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 flex flex-col justify-center">
            <div className="flex flex-col items-center max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto w-full">
                {/* Fruit Illustration */}
                <div className="mb-4 sm:mb-6">
                    <img 
                        src="/images/แก้วมังกร.jpg" 
                        alt="แก้วมังกร" 
                        className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32"
                    />
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-6 sm:mb-8 text-center">เข้าสู่ระบบ</h1>

                {/* Error Message */}
                {error && (
                    <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm sm:text-base">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form className="w-full flex flex-col gap-4 sm:gap-5 md:gap-6" onSubmit={handleSubmit}>
                    {/* Email */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="email" className="text-black font-medium text-sm sm:text-base">อีเมล</label>
                        <div className="relative">
                            <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                className="border-2 border-gray-300 rounded-lg p-2.5 sm:p-3 md:p-3.5 w-full pl-10 sm:pl-11 text-sm sm:text-base focus:outline-none focus:border-orange-400" 
                                type="email" 
                                id="email"
                                name="email"
                                value={loginData.email}
                                onChange={handleChange}
                                placeholder="Enter your email" 
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="password" className="text-black font-medium text-sm sm:text-base">รหัสผ่าน</label>
                        <div className="relative">
                            <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                className="border-2 border-gray-300 rounded-lg p-2.5 sm:p-3 md:p-3.5 w-full pl-10 sm:pl-11 text-sm sm:text-base focus:outline-none focus:border-orange-400" 
                                type="password" 
                                id="password"
                                name="password"
                                placeholder="Enter your password"
                                value={loginData.password}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Login Button */}
                    <div className="mt-2 sm:mt-3 md:mt-4">
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            fullWidth
                            isLoading={isLoading}
                            disabled={!isFormValid}
                        >
                            {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                        </Button>
                    </div>

                    {/* Register Link */}
                    <div className="text-center mt-3 sm:mt-4">
                        <p className="text-xs sm:text-sm text-gray-600">
                            ยังไม่มีบัญชี?{' '}
                            <Button
                                type="button"
                                variant="link"
                                size="sm"
                                onClick={() => router.push('/registration/RegisterPage')}
                                className="inline"
                            >
                                สมัครสมาชิก
                            </Button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;