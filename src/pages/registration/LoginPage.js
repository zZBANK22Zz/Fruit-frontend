import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import Button from "../../components/Button";
import Modal from "../../components/Modal";

const LoginPage = () => {
    const router = useRouter();

    const [loginData, setLoginData] = useState({
        email: '',
        password: '',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isLineLoading, setIsLineLoading] = useState(false);
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

            // console.log('Login successful:', data);
            
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

    // Handle LINE Login
    const handleLineLogin = async () => {
        setIsLineLoading(true);
        setError('');

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;
            
            if (!apiUrl) {
                throw new Error('API URL is not configured. Please check your environment variables.');
            }

            // Get authorization URL from backend
            const response = await fetch(`${apiUrl}/api/auth/line/login`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to initiate LINE Login');
            }

            // Store state for verification
            if (data.data && data.data.state) {
                localStorage.setItem('line_login_state', data.data.state);
                console.log('LINE Login - Stored state:', data.data.state);
            } else {
                throw new Error('State not received from server');
            }

            // Redirect to LINE authorization page
            if (data.data && data.data.auth_url) {
                // Small delay to ensure localStorage is persisted
                setTimeout(() => {
                    window.location.href = data.data.auth_url;
                }, 100);
            } else {
                throw new Error('Authorization URL not received');
            }
        } catch (err) {
            setError(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย LINE');
            setIsLineLoading(false);
            console.error('LINE Login error:', err);
        }
    };

    // Handle LINE Login callback
    useEffect(() => {
        const handleLineCallback = async () => {
            // Check if we have code and state in URL (callback from LINE)
            // Use router.query for Next.js (more reliable than window.location.search)
            const { code, state, error: errorParam } = router.query;

            // If there's an error from LINE
            if (errorParam) {
                setError('การเข้าสู่ระบบด้วย LINE ถูกยกเลิก');
                // Clean URL
                router.replace('/registration/LoginPage', undefined, { shallow: true });
                return;
            }

            // If we have code and state, process the callback
            if (code && state) {
                setIsLineLoading(true);
                setError('');

                try {
                    // Verify state matches what we stored
                    const storedState = localStorage.getItem('line_login_state');
                    
                    // Debug logging (remove in production)
                    console.log('LINE Callback - State from URL:', state);
                    console.log('LINE Callback - Stored state:', storedState);
                    console.log('LINE Callback - States match:', state === storedState);
                    
                    if (!storedState) {
                        throw new Error('State not found. Please initiate LINE login again.');
                    }
                    
                    if (state !== storedState) {
                        console.error('State mismatch - URL state:', state, 'Stored state:', storedState);
                        // Clean up the mismatched state
                        localStorage.removeItem('line_login_state');
                        throw new Error('Security verification failed. Please try logging in with LINE again.');
                    }

                    // Clean up stored state
                    localStorage.removeItem('line_login_state');

                    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;
                    
                    if (!apiUrl) {
                        throw new Error('API URL is not configured.');
                    }

                    // Send code to backend
                    const response = await fetch(`${apiUrl}/api/auth/line/callback`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ code, state }),
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.message || 'LINE Login failed');
                    }

                    // Store token and user data
                    if (data.data && data.data.token) {
                        localStorage.setItem('token', data.data.token);
                        localStorage.setItem('user', JSON.stringify(data.data.user));
                    }

                    // Clean URL and redirect to home
                    router.replace('/');
                } catch (err) {
                    setError(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย LINE');
                    setIsLineLoading(false);
                    console.error('LINE Login callback error:', err);
                    // Clean URL
                    router.replace('/registration/LoginPage', undefined, { shallow: true });
                }
            }
        };

        handleLineCallback();
    }, [router.query]);

    const isFormValid = loginData.email.trim() !== '' && loginData.password.trim() !== '';

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-100 via-white to-orange-100 px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 flex flex-col justify-center">
            <div className="flex flex-col items-center max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto w-full">
                {/* Fruit Illustration */}
                <div className="mb-4 sm:mb-6">
                    <img 
                        src="/images/Logo.png" 
                        alt="แก้วมังกร" 
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-6 sm:mb-8 text-center">เข้าสู่ระบบ</h1>

                {/* Form */}
                <form className="w-full flex flex-col gap-4 sm:gap-5 md:gap-6" onSubmit={handleSubmit}>
                    {/* Email */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="email" className="text-black font-medium text-sm sm:text-base">อีเมล</label>
                        <div className="relative">
                            <EnvelopeIcon className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-gray-400 pointer-events-none" />
                            <input 
                                className="border-2 border-gray-300 rounded-lg p-2.5 sm:p-3 md:p-3.5 w-full pl-10 sm:pl-11 md:pl-12 lg:pl-14 text-sm sm:text-base focus:outline-none focus:border-orange-400" 
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
                            <LockClosedIcon className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-gray-400 pointer-events-none" />
                            <input 
                                className="border-2 border-gray-300 rounded-lg p-2.5 sm:p-3 md:p-3.5 w-full pl-10 sm:pl-11 md:pl-12 lg:pl-14 text-sm sm:text-base focus:outline-none focus:border-orange-400" 
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
                            disabled={!isFormValid || isLineLoading}
                        >
                            {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                        </Button>
                    </div>

                    {/* Divider */}
                    <div className="relative mt-4 sm:mt-5 md:mt-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-transparent text-gray-500">หรือ</span>
                        </div>
                    </div>

                    {/* LINE Login Button */}
                    <div className="mt-4 sm:mt-5 md:mt-6">
                        <Button
                            type="button"
                            variant="success"
                            size="lg"
                            fullWidth
                            isLoading={isLineLoading}
                            disabled={isLoading || isLineLoading}
                            onClick={handleLineLogin}
                            leftIcon={
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 5.187 18.615.8 12 .8S0 5.187 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.058.898-.018.127-.037.255-.056.38-.021.144-.045.288-.062.436-.02.18.097.361.274.404.179.042.357-.008.501-.095.09-.055.19-.123.281-.187.408-.283.935-.653 1.365-1.05 2.109-.09 4.052-.605 5.646-1.561C22.603 18.892 24 14.789 24 10.314"
                                        fill="#00B900"
                                    />
                                </svg>
                            }
                        >
                            {isLineLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย LINE'}
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

            {/* Error Modal */}
            <Modal
                isOpen={!!error}
                onClose={() => setError('')}
                type="error"
                title="เข้าสู่ระบบไม่สำเร็จ"
                message={error}
                buttonText="ปิด"
            />
        </div>
    );
}

export default LoginPage;