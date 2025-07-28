import { useState, useMemo } from 'react';
import { useUser } from '../hooks/useUser';
import { AnimatePresence, motion } from 'framer-motion';
import { InfiniteSlider } from '../components/motion-primitives/infinite-slider';
import { useAuthLogic } from '../hooks/useAuthLogic';

const VerifyPage = () => {
    const { setStatus } = useUser();
    const { verifyUser, resetStatus, sendEmail } = useAuthLogic();
    const [code, setCode] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleVerify = async () => {
        if (!code.trim()) {
            setMessage("❌ Please enter a verification code");
            return;
        }
        setLoading(true);

        try {
            await verifyUser(code);
            setMessage("✅ Successfully verified!");
            setStatus('verified');
        } catch (error) {
            console.error('Verification error:', error);
            setMessage("❌ Error during verification");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setLoading(true);
        try {
            await sendEmail();
            setMessage("✅ Verification email resent successfully!");
        } catch (error) {
            console.error('Error resending verification email:', error);
            setMessage("❌ Error resending verification email");
        } finally {
            setLoading(false);
        }
    }

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
        <div>
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


                <AnimatePresence mode='wait'>
                    <motion.div
                        className="min-h-screen flex items-center justify-center text-white"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        <div className="bg-blue-300/5 p-6 rounded-xl border-t-2 border-gray-500/20 backdrop-blur-md max-w-md w-full">
                            <h2 className="text-xl mb-4 text-lime-400 font-bold">Verify your mail</h2>
                            <p className="text-sm text-gray-400 mb-4">
                                Enter the verification code sent to your email to activate your account.
                            </p>
                            <input
                                className="w-full mb-4 p-2 bg-gray-600/20 border-b-2 border-black/35 rounded focus:outline-none placeholder:opacity-30 text-white"
                                placeholder="Code de vérification"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                disabled={loading}
                            />
                            <button
                                onClick={handleVerify}
                                disabled={loading}
                                className="w-full mb-2 p-2 bg-lime-400 hover:bg-lime-500 rounded font-medium text-black"
                            >
                                {loading ? 'Verification...' : 'Verified'}
                            </button>

                            <button
                                onClick={handleResend}
                                disabled={loading}
                                className="w-full p-2 bg-gray-500/30 hover:bg-gray-500/50 rounded font-medium text-white text-sm"
                            >
                                Resend verification code
                            </button>
                            <div className="text-center">
                                <button
                                    onClick={resetStatus}
                                    className="text-gray-400 hover:text-white text-sm underline"
                                >
                                    Use a different account
                                </button>
                            </div>
                            {message && <p className="mt-3 text-sm">{message}</p>}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default VerifyPage;
