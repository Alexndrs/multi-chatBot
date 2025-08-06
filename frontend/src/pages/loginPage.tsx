import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import LogoIcon from '../components/icons/LogoIcon';
import { useAuthLogic } from '../hooks/useAuthLogic';
import SliderBg from '../components/sliderBg';


const LoginPage = () => {
    const { login, register } = useAuthLogic();

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
                await register(name, email, password);
            } else {
                await login(email, password);
            }
        } catch (err) {
            setError(`${err instanceof Error ? err.message : 'An unexpected error occurred'}`);
            console.error(err);
        }
    };



    return (
        <div className="relative flex items-center justify-center min-h-screen overflow-hidden">


            <SliderBg />

            <AnimatePresence mode="wait">
                <motion.form
                    key={isRegister ? 'register' : 'login'}
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="p-0 rounded-lg shadow-xl bg-[var(--color-onTop)] border-t-2 border-[var(--color-onTop)] space-y-4 w-[90%] max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg relative z-10 backdrop-blur-md"
                >
                    <div className='px-12 py-5 mb-0 border-b-3 border-black/20 flex items-center'>
                        <LogoIcon className="w-15 h-15 mb-0 text-lime-400" />
                        <h2 className="text-xl font-bold mb-0 text-center">
                            {isRegister ? "Let's get you started" : "Welcome back"}
                        </h2>
                    </div>

                    <div className='px-12 py-5 flex flex-col mb-0 bt-0 border-b-3 border-b-black/20 border-t-2 border-t-[var(--color-onTop)]'>
                        {isRegister && (
                            <div>
                                <label className="text-sm">What should we call you?</label>
                                <input
                                    type="text"
                                    placeholder="Your name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full h-10 p-2 mb-4 bg-[var(--color-onTop)] border-b-2 border-black/35 rounded focus:outline-none placeholder:opacity-30"
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
                                className="w-full h-10 p-2 mb-4 bg-[var(--color-onTop)] border-b-2 border-black/35 rounded focus:outline-none placeholder:opacity-30"
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
                                className="w-full h-10 p-2 mb-4 bg-[var(--color-onTop)] border-b-2 border-black/35 rounded focus:outline-none placeholder:opacity-30 pr-10"
                            />
                            <button
                                type="button"
                                className="absolute right-2 top-[35px] text-white opacity-50 hover:opacity-100"
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

                    <div className='px-12 py-5 border-t-2 border-[var(--color-onTop)]'>
                        <p className="text-sm text-neutral-400 text-center">
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
                    {error && (
                        <div className='mb-4 w-full flex items-center justify-center'>
                            <p className="px-4 py-2 text-red-400 text-sm bg-red-900/20 border-1 border-red-400 rounded-md">{error}</p>
                        </div>
                    )}
                </motion.form>
            </AnimatePresence>
        </div>
    );
};

export default LoginPage;