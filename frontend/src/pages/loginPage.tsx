import { useState } from 'react';
import { createUser, loginUser, getUserInfo, getUserConversations } from '../api';
import { useUser } from '../hooks/useUser';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import LogoIcon from '../components/icons/LogoIcon';

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

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-t from-[#12141b] to-[#191c2a] text-white overflow-hidden">

            <AnimatePresence mode="wait">
                <motion.form
                    key={isRegister ? 'register' : 'login'}
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="p-0 rounded-lg shadow-xl bg-gray-700/20 border-t-2 border-gray-500/20 space-y-4 w-80 relative z-10 backdrop-blur-md"
                >
                    <div className='px-8 py-5 mb-0 border-b-3 border-black/20 flex items-center'>
                        <LogoIcon className="w-15 h-15 mb-0 text-lime-400" />
                        <h2 className="text-xl font-bold mb-0 text-center">
                            {isRegister ? "Let's get you started" : "Welcome back"}
                        </h2>
                    </div>

                    <div className='px-8 py-5 flex flex-col mb-0 bt-0 border-b-3 border-b-black/20 border-t-2 border-t-white/7'>
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
                            <label className="text-sm">Pick a strong password</label>
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

                    <div className='px-8 py-5 border-t-2 border-white/7'>
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