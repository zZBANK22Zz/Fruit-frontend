import { useState } from "react";
import { useRouter } from "next/router";

const RegisterPage = () => {
    const router = useRouter();

    const [userdata, setUserdata] = useState({
        firstname: '',
        lastname: '',
        username: '',
        password: '',
    });

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
        
        console.log(userdata);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-100 via-white to-orange-100 px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 flex flex-col justify-center relative">
            {/* Back Arrow */}
            <button 
                onClick={() => router.push('/registration/LoginPage')} 
                className="absolute top-4 sm:top-6 md:top-8 left-4 sm:left-6 md:left-8 text-gray-400 hover:text-gray-600 flex items-center gap-2 text-sm sm:text-base z-10"
            >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>กลับไปหน้าล็อคอิน</span>
            </button>

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
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-6 sm:mb-8 text-center">สมัครสมาชิก</h1>

                {/* Form */}
                <form className="w-full flex flex-col gap-4 sm:gap-5 md:gap-6" onSubmit={handleSubmit}>
                    {/* First Name */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="firstname" className="text-black font-medium text-sm sm:text-base">ชื่อจริง</label>
                        <input 
                            className="border-2 border-gray-300 rounded-lg p-2.5 sm:p-3 md:p-3.5 w-full text-sm sm:text-base focus:outline-none focus:border-orange-400" 
                            type="text" 
                            id="firstname"
                            name="firstname"
                            value={userdata.firstname}
                            onChange={handleChange}
                            placeholder="Enter your first name" 
                        />
                    </div>

                    {/* Last Name */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="lastname" className="text-black font-medium text-sm sm:text-base">นามสกุล</label>
                        <input 
                            className="border-2 border-gray-300 rounded-lg p-2.5 sm:p-3 md:p-3.5 w-full text-sm sm:text-base focus:outline-none focus:border-orange-400" 
                            type="text" 
                            id="lastname"
                            name="lastname"
                            value={userdata.lastname}
                            onChange={handleChange}
                            placeholder="Enter your last name" 
                        />
                    </div>

                    {/* Username */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="username" className="text-black font-medium text-sm sm:text-base">ชื่อผู้ใช้</label>
                        <input 
                            className="border-2 border-gray-300 rounded-lg p-2.5 sm:p-3 md:p-3.5 w-full text-sm sm:text-base focus:outline-none focus:border-orange-400" 
                            type="text" 
                            id="username"
                            name="username"
                            value={userdata.username}
                            onChange={handleChange}
                            placeholder="Enter your username" 
                        />
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="password" className="text-black font-medium text-sm sm:text-base">รหัสผ่าน</label>
                        <input 
                            className={`border-2 rounded-lg p-2.5 sm:p-3 md:p-3.5 w-full text-sm sm:text-base focus:outline-none ${
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
                        
                        {/* Password Requirements */}
                        <div className="mt-2 ml-2 sm:ml-4 space-y-1">
                            <p className={`text-xs sm:text-sm flex items-center gap-2 ${
                                userdata.password ? (isLengthValid ? 'text-green-600' : 'text-red-600') : 'text-gray-600'
                            }`}>
                                <span>{userdata.password ? (isLengthValid ? '✓' : '✗') : '•'}</span>
                                รหัสผ่านต้องมากกว่า 8 ตัวอักษร
                            </p>
                            <p className={`text-xs sm:text-sm flex items-center gap-2 ${
                                userdata.password ? (hasNoSpaces ? 'text-green-600' : 'text-red-600') : 'text-gray-600'
                            }`}>
                                <span>{userdata.password ? (hasNoSpaces ? '✓' : '✗') : '•'}</span>
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
                    <button 
                        className={`font-bold rounded-lg p-3 sm:p-3.5 md:p-4 mt-2 sm:mt-3 md:mt-4 w-full text-sm sm:text-base md:text-lg transition-all ${
                            isPasswordValid
                                ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        type="submit"
                        disabled={!isPasswordValid}
                    >
                        ลงทะเบียน
                    </button>
                </form>
            </div>
        </div>
    );
}

export default RegisterPage;