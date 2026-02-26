import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { EnvelopeIcon, LockClosedIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import { useLanguage } from "../../utils/LanguageContext";

const LoginPage = () => {
    const router = useRouter();
    const { t } = useLanguage();

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
            setError(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ โปรดลองอีกครั้ง');
            console.error('Login error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!loginData.email || !loginData.password) {
            setError(t('fillEmailPassword'));
            return;
        }
        
        loginUser();
    };

    // Handle LINE Login
    const handleLineLogin = async () => {
        setIsLineLoading(true);
        setError('');

        try {
            const liff = (await import('@line/liff')).default;
            if (!liff.isLoggedIn()) {
                liff.login();
            } else {
                // If already logged in, we can proceed to get token
                handleLiffCallback();
            }
        } catch (err) {
            setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย LINE');
            setIsLineLoading(false);
            console.error('LIFF Login error:', err);
        }
    };

    // Handle LIFF Login callback and token verification
    const handleLiffCallback = async () => {
        setIsLineLoading(true);
        setError('');

        try {
            const liff = (await import('@line/liff')).default;
            
            // Get ID Token from LIFF
            const idToken = liff.getIDToken();
            
            if (!idToken) {
                throw new Error('Could not retrieve ID Token from LINE');
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;
            if (!apiUrl) {
                throw new Error('API URL is not configured.');
            }

            // Send ID Token to backend for verification
            const response = await fetch(`${apiUrl}/api/auth/line/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idToken }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'LINE Login verification failed');
            }

            // Store token and user data
            if (data.data && data.data.token) {
                localStorage.setItem('token', data.data.token);
                localStorage.setItem('user', JSON.stringify(data.data.user));
            }

            // Redirect to home
            router.replace('/');
        } catch (err) {
            setError(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย LINE');
            setIsLineLoading(false);
            console.error('LIFF callback error:', err);
        }
    };

    // Check for existing session or LIFF login status on mount
    useEffect(() => {
        const checkAuthAndLiff = async () => {
            // 1. Immediate redirect if token already exists
            const token = localStorage.getItem('token');
            if (token) {
                router.replace('/');
                return;
            }

            try {
                const liff = (await import('@line/liff')).default;
                
                // Wait for LIFF or signs of redirect
                // LIFF SDK needs time to parse query parameters (code/state)
                if (liff.isLoggedIn()) {
                    await handleLiffCallback();
                } else if (router.query.code && router.query.state) {
                    // Force a small wait if we see LIFF params but sdk says not logged in yet
                    setTimeout(async () => {
                        if (liff.isLoggedIn()) {
                            await handleLiffCallback();
                        }
                    }, 500);
                }
            } catch (err) {
                console.error('Error checking LIFF status:', err);
            }
        };

        if (router.isReady) {
            checkAuthAndLiff();
        }
    }, [router.isReady, router.query]);

    const isFormValid = loginData.email.trim() !== '' && loginData.password.trim() !== '';

    return (
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 relative overflow-hidden">
             {/* Background decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-100/40 rounded-full blur-3xl opacity-50 animate-pulse-slow"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-green-100/40 rounded-full blur-3xl opacity-50 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

            <div className="relative z-10 w-full max-w-md">
                <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-8 sm:p-10 border border-white/50 animate-fade-in relative overflow-hidden">
                    {/* Decorative top bar */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-red-500"></div>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-24 h-24 mx-auto mb-6 bg-white rounded-full shadow-lg flex items-center justify-center p-0 overflow-hidden transform hover:scale-110 transition-transform duration-300">
                             <img 
                                src="/images/Logo.png" 
                                alt="Logo" 
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                            {t('welcome')}
                        </h1>
                        <p className="text-gray-500 font-medium">
                            {t('loginSubtitle')}
                        </p>
                    </div>

                    {/* Form */}
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Email */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-bold text-gray-700 uppercase tracking-wide ml-1">{t('email')}</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <EnvelopeIcon className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                                </div>
                                <input 
                                    className="block w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-orange-400 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-50 transition-all font-medium text-gray-900 placeholder-gray-400 shadow-inner group-hover:bg-white" 
                                    type="email" 
                                    id="email"
                                    name="email"
                                    value={loginData.email}
                                    onChange={handleChange}
                                    placeholder={t('emailPlaceholder')} 
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-sm font-bold text-gray-700 uppercase tracking-wide ml-1">{t('password')}</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <LockClosedIcon className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                                </div>
                                <input 
                                    className="block w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-orange-400 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-50 transition-all font-medium text-gray-900 placeholder-gray-400 shadow-inner group-hover:bg-white" 
                                    type="password" 
                                    id="password"
                                    name="password"
                                    placeholder="••••••••"
                                    value={loginData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={!isFormValid || isLoading || isLineLoading}
                            className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-bold text-lg hover:shadow-lg hover:shadow-orange-200 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>{t('login')}</span>
                                    <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white/80 backdrop-blur-xl text-gray-500 font-medium">{t('orContinueWith')}</span>
                        </div>
                    </div>

                    {/* LINE Login Button */}
                    <button
                        type="button"
                        onClick={handleLineLogin}
                        disabled={isLoading || isLineLoading}
                        className="w-full py-4 bg-[#06C755] text-white rounded-2xl font-bold text-lg hover:bg-[#05b34c] hover:shadow-lg hover:shadow-green-200 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                         {isLineLoading ? (
                             <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                         ) : (
                             <>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 5.187 18.615.8 12 .8S0 5.187 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.058.898-.018.127-.037.255-.056.38-.021.144-.045.288-.062.436-.02.18.097.361.274.404.179.042.357-.008.501-.095.09-.055.19-.123.281-.187.408-.283.935-.653 1.365-1.05 2.109-.09 4.052-.605 5.646-1.561C22.603 18.892 24 14.789 24 10.314" fill="white"/>
                                </svg>
                                <span>{t('loginWithLine')}</span>
                             </>
                         )}
                    </button>

                    {/* Register Link */}
                    <div className="text-center mt-8">
                        <p className="text-sm text-gray-500 font-medium">
                            {t('noAccount')}{' '}
                            <button
                                type="button"
                                onClick={() => router.push('/registration/RegisterPage')}
                                className="text-orange-600 font-bold hover:text-orange-700 hover:underline transition-colors"
                            >
                                {t('register')}
                            </button>
                        </p>
                    </div>
                </div>
            </div>

            {/* Error Modal */}
            <Modal
                isOpen={!!error}
                onClose={() => setError('')}
                type="error"
                title={t('loginFailed')}
                message={error}
                buttonText={t('close')}
            />
        </div>
    );
}

export default LoginPage;