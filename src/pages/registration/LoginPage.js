import { useState } from "react";
import { useRouter } from "next/router";

const LoginPage = () => {
    const router = useRouter();

    const [loginData, setLoginData] = useState({
        username: '',
        password: '',
    });

    const handleChange = (e) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!loginData.username || !loginData.password) {
            alert('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
            return;
        }
        
        console.log('Login data:', loginData);
        // Handle login logic here
    };

    const isFormValid = loginData.username.trim() !== '' && loginData.password.trim() !== '';

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

                {/* Form */}
                <form className="w-full flex flex-col gap-4 sm:gap-5 md:gap-6" onSubmit={handleSubmit}>
                    {/* Username */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="username" className="text-black font-medium text-sm sm:text-base">ชื่อผู้ใช้</label>
                        <input 
                            className="border-2 border-gray-300 rounded-lg p-2.5 sm:p-3 md:p-3.5 w-full text-sm sm:text-base focus:outline-none focus:border-orange-400" 
                            type="text" 
                            id="username"
                            name="username"
                            value={loginData.username}
                            onChange={handleChange}
                            placeholder="Enter your username" 
                        />
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="password" className="text-black font-medium text-sm sm:text-base">รหัสผ่าน</label>
                        <input 
                            className="border-2 border-gray-300 rounded-lg p-2.5 sm:p-3 md:p-3.5 w-full text-sm sm:text-base focus:outline-none focus:border-orange-400" 
                            type="password" 
                            id="password"
                            name="password"
                            placeholder="Enter your password"
                            value={loginData.password}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Login Button */}
                    <button 
                        className={`font-bold rounded-lg p-3 sm:p-3.5 md:p-4 mt-2 sm:mt-3 md:mt-4 w-full text-sm sm:text-base md:text-lg transition-all ${
                            isFormValid
                                ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        type="submit"
                        disabled={!isFormValid}
                    >
                        เข้าสู่ระบบ
                    </button>

                    {/* Register Link */}
                    <div className="text-center mt-3 sm:mt-4">
                        <p className="text-xs sm:text-sm text-gray-600">
                            ยังไม่มีบัญชี?{' '}
                            <button
                                type="button"
                                onClick={() => router.push('/registration/RegisterPage')}
                                className="text-orange-500 font-medium hover:text-orange-600 underline"
                            >
                                สมัครสมาชิก
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;