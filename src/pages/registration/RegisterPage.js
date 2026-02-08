import { useState } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { 
    ArrowLeftIcon, 
    CheckCircleIcon, 
    XCircleIcon,
    UserIcon,
    EnvelopeIcon,
    LockClosedIcon,
    SparklesIcon
} from "@heroicons/react/24/outline";
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
    const [activeField, setActiveField] = useState(null);

    //api call to backend
    const registerUser = async () => {
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND;
            
            if (!apiUrl) {
                throw new Error('API URL is not configured.');
            }

            const requestData = {
                username: userdata.username,
                email: userdata.email,
                password: userdata.password,
                first_name: userdata.firstname,
                last_name: userdata.lastname,
            };

            const response = await fetch(`${apiUrl}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'การลงทะเบียนล้มเหลว');
            }

            setSuccess('ยินดีต้อนรับสู่ครอบครัวคนรักผลไม้! 🍊');
            
            setTimeout(() => {
                router.push('/registration/LoginPage');
            }, 2000);

        } catch (err) {
            setError(err.message || 'เกิดข้อผิดพลาดในการลงทะเบียน');
        } finally {
            setIsLoading(false);
        }
    }

    const handleChange = (e) => {
        setUserdata({ ...userdata, [e.target.name]: e.target.value });
    };

    // Password validation logic
    const isLengthValid = userdata.password.length > 8;
    const hasNoSpaces = !userdata.password.includes(' ');
    const isPasswordValid = isLengthValid && hasNoSpaces;

    // Calculate password strength for visual bar
    const calculateStrength = () => {
        if (!userdata.password) return 0;
        let score = 0;
        if (userdata.password.length > 8) score += 1;
        if (userdata.password.length > 12) score += 1;
        if (/[A-Z]/.test(userdata.password)) score += 1;
        if (/[0-9]/.test(userdata.password)) score += 1;
        if (/[^A-Za-z0-9]/.test(userdata.password)) score += 1;
        return score; // Max 5
    };

    const strengthScore = calculateStrength();
    const strengthColor = ['bg-gray-200', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-lime-400', 'bg-green-500'];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isPasswordValid) return;
        registerUser();
    };

    const inputVariants = {
        focus: { scale: 1.02, borderColor: "#F97316", boxShadow: "0px 4px 20px rgba(249, 115, 22, 0.1)" },
        blur: { scale: 1, borderColor: "#E5E7EB", boxShadow: "none" }
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center relative overflow-hidden px-4 md:px-0">
            
            {/* Background Decor - Floating Orbs */}
            <motion.div 
                animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[-10%] left-[-10%] w-[50vh] h-[50vh] bg-gradient-to-br from-orange-200/40 to-yellow-200/40 rounded-full blur-[80px] pointer-events-none"
            />
            <motion.div 
                animate={{ y: [0, 30, 0], rotate: [0, -5, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-[-10%] right-[-10%] w-[60vh] h-[60vh] bg-gradient-to-tl from-green-200/40 to-emerald-100/40 rounded-full blur-[100px] pointer-events-none"
            />

            {/* Back Button */}
            <div className="absolute top-6 left-6 z-20">
                <button
                    onClick={() => router.push('/registration/LoginPage')}
                    className="group flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full text-gray-600 font-medium shadow-sm hover:shadow-md transition-all hover:bg-white"
                >
                    <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span>กลับ</span>
                </button>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-5xl bg-white/60 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/50 relative z-10 mx-4 my-8"
            >
                {/* Left Side: Visual/Branding */}
                <div className="hidden md:flex flex-col justify-center items-center w-2/5 bg-gradient-to-br from-orange-500 to-red-500 p-12 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/10 mix-blend-overlay"></div>
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="relative z-10 text-center"
                    >
                         <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-orange-900/20 overflow-hidden">
                            <img src="/images/Logo.png" alt="Logo" className="w-full h-full object-cover" />
                         </div>
                         <h2 className="text-4xl font-black mb-4 tracking-tight">Fruit Family</h2>
                         <p className="text-orange-100 text-lg font-medium leading-relaxed">
                             เข้าร่วมกับเราวันนี้ เพื่อรับสิทธิพิเศษและผลไม้สดใหม่ส่งตรงถึงหน้าบ้านคุณ
                         </p>
                    </motion.div>
                </div>

                {/* Right Side: Register Form */}
                <div className="w-full md:w-3/5 p-8 md:p-12 lg:p-16">
                    <div className="max-w-md mx-auto">
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <h1 className="text-3xl font-black text-gray-900 mb-2 flex items-center gap-3">
                                สมัครสมาชิก <SparklesIcon className="w-8 h-8 text-yellow-400" />
                            </h1>
                            <p className="text-gray-500 mb-8">กรอกข้อมูลเพื่อเริ่มต้นการใช้งาน</p>
                        </motion.div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <InputField 
                                    label="ชื่อจริง"
                                    name="firstname"
                                    icon={UserIcon}
                                    value={userdata.firstname}
                                    onChange={handleChange}
                                    activeField={activeField}
                                    setActiveField={setActiveField}
                                />
                                <InputField 
                                    label="นามสกุล"
                                    name="lastname"
                                    icon={UserIcon}
                                    value={userdata.lastname}
                                    onChange={handleChange}
                                    activeField={activeField}
                                    setActiveField={setActiveField}
                                />
                            </div>

                            <InputField 
                                label="ชื่อผู้ใช้"
                                name="username"
                                icon={UserIcon}
                                value={userdata.username}
                                onChange={handleChange}
                                activeField={activeField}
                                setActiveField={setActiveField}
                            />

                            <InputField 
                                label="อีเมล"
                                name="email"
                                type="email"
                                icon={EnvelopeIcon}
                                value={userdata.email}
                                onChange={handleChange}
                                activeField={activeField}
                                setActiveField={setActiveField}
                            />

                            <div>
                                <InputField 
                                    label="รหัสผ่าน"
                                    name="password"
                                    type="password"
                                    icon={LockClosedIcon}
                                    value={userdata.password}
                                    onChange={handleChange}
                                    activeField={activeField}
                                    setActiveField={setActiveField}
                                />
                                
                                {/* Password Strength & Validation */}
                                <AnimatePresence>
                                    {userdata.password && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="mt-3 overflow-hidden"
                                        >
                                            {/* Visual Strength Bar */}
                                            <div className="flex gap-1 h-1.5 mb-3">
                                                {[1,2,3,4,5].map((level) => (
                                                    <div 
                                                        key={level} 
                                                        className={`flex-1 rounded-full transition-colors duration-300 ${
                                                            level <= strengthScore ? strengthColor[strengthScore] : 'bg-gray-100'
                                                        }`} 
                                                    />
                                                ))}
                                            </div>

                                            <div className="flex gap-4 text-xs font-medium text-gray-500">
                                                <div className={`flex items-center gap-1 ${isLengthValid ? 'text-green-600' : ''}`}>
                                                    {isLengthValid ? <CheckCircleIcon className="w-4 h-4"/> : <div className="w-4 h-4 rounded-full border border-gray-300"/>}
                                                    8+ ตัวอักษร
                                                </div>
                                                <div className={`flex items-center gap-1 ${hasNoSpaces ? 'text-green-600' : ''}`}>
                                                    {hasNoSpaces ? <CheckCircleIcon className="w-4 h-4"/> : <div className="w-4 h-4 rounded-full border border-gray-300"/>}
                                                    ไม่มีช่องว่าง
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02, boxShadow: "0 10px 30px -10px rgba(249, 115, 22, 0.4)" }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={!isPasswordValid || isLoading}
                                className={`w-full py-4 rounded-2xl font-bold text-lg text-white shadow-lg transition-all ${
                                    isPasswordValid ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gray-300 cursor-not-allowed'
                                }`}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>กำลังสมัครสมาชิก...</span>
                                    </div>
                                ) : (
                                    'ลงทะเบียน'
                                )}
                            </motion.button>
                        </form>
                    </div>
                </div>
            </motion.div>

            {/* Error Modal */}
            <Modal
                isOpen={!!error}
                onClose={() => setError('')}
                type="error"
                title="เกิดข้อผิดพลาด"
                message={error}
                buttonText="ลองใหม่"
            />

            {/* Success Modal */}
            <Modal
                isOpen={!!success}
                onClose={() => {
                    setSuccess('');
                    router.push('/registration/LoginPage');
                }}
                type="success"
                title="สำเร็จ!"
                message={success}
                buttonText="ไปหน้าเข้าสู่ระบบ"
            />
        </div>
    );
};

// Reusable Input Component with Animations
const InputField = ({ label, name, type = "text", icon: Icon, value, onChange, activeField, setActiveField }) => {
    return (
        <div className="relative group">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block ml-1">
                {label}
            </label>
            <motion.div 
                animate={activeField === name ? "focus" : "blur"}
                variants={{
                    focus: { borderColor: "#F97316", boxShadow: "0 4px 20px -5px rgba(249, 115, 22, 0.15)" },
                    blur: { borderColor: "#F3F4F6", boxShadow: "none" }
                }}
                className="relative bg-gray-50/50 border-2 border-gray-100 rounded-2xl transition-colors"
            >
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors">
                    <Icon className="w-5 h-5" />
                </div>
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setActiveField(name)}
                    onBlur={() => setActiveField(null)}
                    className="w-full bg-transparent pl-12 pr-4 py-3.5 outline-none text-gray-900 font-medium placeholder-gray-400 rounded-2xl"
                    placeholder={`กรอก${label}`}
                />
            </motion.div>
        </div>
    );
};

export default RegisterPage;