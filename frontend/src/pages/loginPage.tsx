import { useState, useMemo } from 'react';
import { createUser, loginUser, getUserInfo, getUserConversations } from '../api';
import { useUser } from '../hooks/useUser';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import LogoIcon from '../components/icons/LogoIcon';
import { InfiniteSlider } from '../components/motion-primitives/infinite-slider';

const LoginPage = () => {
    const { setUserData } = useUser();

    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            if (isRegister) {
                await createUser(name, email, password);
            } else {
                await loginUser(email, password);
            }

            const userInfo = await getUserInfo();
            const conversations = await getUserConversations();
            setUserData({
                token: localStorage.getItem('token'),
                name: userInfo.name,
                email: userInfo.email,
                conversations
            });

        } catch (err) {
            setError('❌ Échec de la connexion ou de la création du compte.');
            console.error(err);
        }
    };

    const shuffleArray = <T,>(array: T[]): T[] => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    const shuffledArrays = useMemo(() => {
        const logos = [
            "/api_logo/chatGPT.png",
            "/api_logo/claude.png",
            "/api_logo/llama.png",
            "/api_logo/qwen.png",
            "/api_logo/gemma.png",
            "/api_logo/gemini.png",
            "/api_logo/mistral.png",
        ];
        return Array.from({ length: 7 }, () => shuffleArray(logos));
    }, []);

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-t from-[#12141b] to-[#191c2a] text-white overflow-hidden">


            <div className='absolute w-full flex flex-col gap-10 opacity-5'>
                {shuffledArrays.map((shuffledLogos, index) => (
                    <div className='relative w-full h-30'>
                        <InfiniteSlider key={index} gap={24} reverse={index % 2 === 0}>
                            {shuffledLogos.map((logo, logoIndex) => (
                                <img key={`slider-${logoIndex}`} src={logo} className="h-30 w-auto" />
                            ))}
                        </InfiniteSlider>
                    </div>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.form
                    key={isRegister ? 'register' : 'login'}
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="p-0 rounded-lg shadow-xl bg-blue-300/5 border-t-2 border-gray-500/20 space-y-4 w-[90%] max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg relative z-10 backdrop-blur-md"
                >
                    <div className='px-12 py-5 mb-0 border-b-3 border-black/20 flex items-center'>
                        <LogoIcon className="w-15 h-15 mb-0 text-lime-400" />
                        <h2 className="text-xl font-bold mb-0 text-center">
                            {isRegister ? "Let's get you started" : "Welcome back"}
                        </h2>
                    </div>

                    <div className='px-12 py-5 flex flex-col mb-0 bt-0 border-b-3 border-b-black/20 border-t-2 border-t-white/7'>
                        {isRegister && (
                            <div>
                                <label className="text-sm">What should we call you?</label>
                                <input
                                    type="text"
                                    placeholder="Your name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full h-10 p-2 mb-4 bg-gray-600/20 border-b-2 border-black/35 rounded focus:outline-none placeholder:opacity-30"
                                />
                            </div>
                        )}

                        <div>
                            <label className="text-sm">Your best email</label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full h-10 p-2 mb-4 bg-gray-600/20 border-b-2 border-black/35 rounded focus:outline-none placeholder:opacity-30"
                            />
                        </div>

                        <div className="relative">
                            <label className="text-sm">
                                {isRegister ? "Pick a strong password" : "Your password"}
                            </label>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full h-10 p-2 mb-4 bg-gray-600/20 border-b-2 border-black/35 rounded focus:outline-none placeholder:opacity-30 pr-10"
                            />
                            <button
                                type="button"
                                className="absolute right-2 top-[35px] text-gray-400 hover:text-white"
                                onClick={() => setShowPassword(prev => !prev)}
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="w-full h-10 p-2 my-3 bg-lime-400 hover:bg-lime-500 border-t-2 border-lime-100/70 rounded transition duration-200 cursor-pointer text-gray-900 font-medium"
                        >
                            {isRegister ? "Let's go →" : "Log me in"}
                        </button>

                    </div>

                    <div className='px-12 py-5 border-t-2 border-white/7'>
                        <p className="text-sm text-gray-400 text-center">
                            {isRegister ? 'Already onboard?' : "New here?"}{' '}
                            <button
                                type="button"
                                onClick={() => setIsRegister(!isRegister)}
                                className="text-lime-300 underline ml-1 cursor-pointer hover:text-lime-200 transition duration-200"
                            >
                                {isRegister ? 'Log in' : 'Sign up'}
                            </button>
                        </p>
                    </div>

                    {error && <p className="text-red-400 text-sm">{error}</p>}
                </motion.form>
            </AnimatePresence>
        </div>
    );
};

export default LoginPage;