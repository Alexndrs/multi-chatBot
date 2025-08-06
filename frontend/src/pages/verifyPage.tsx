import { useState } from 'react';
import { useUser } from '../hooks/useUser';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthLogic } from '../hooks/useAuthLogic';
import SliderBg from '../components/sliderBg';

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

    return (
        <div>
            <div className="relative flex items-center justify-center min-h-screen text-white overflow-hidden">

                <SliderBg />


                <AnimatePresence mode='wait'>
                    <motion.div
                        className="min-h-screen flex items-center justify-center text-white"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        <div className="bg-[var(--color-onTop)] p-6 rounded-xl border-t-2 border-[var(--color-onTop)] backdrop-blur-md max-w-md w-full">
                            <h2 className="text-xl mb-4 text-lime-400 font-bold">Verify your mail</h2>
                            <p className="text-sm text-[var(--color-smallTextColor)] mb-4">
                                Enter the verification code sent to your email to activate your account.
                            </p>
                            <input
                                className="w-full mb-4 p-2 [var(--color-onTop)] border-b-2 border-[var(--color-onTop)] rounded focus:outline-none placeholder:opacity-30 text-white"
                                placeholder="Code de vérification"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                disabled={loading}
                            />
                            <button
                                onClick={handleVerify}
                                disabled={loading}
                                className="w-full mb-2 p-2 bg-[var(--color-CTA)]/80 hover:bg-[var(--color-CTA)] rounded font-medium text-black"
                            >
                                {loading ? 'Verification...' : 'Verified'}
                            </button>

                            <button
                                onClick={handleResend}
                                disabled={loading}
                                className="w-full p-2 [var(--color-onTop)]/50 hover:[var(--color-onTop)] rounded text-sm"
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
