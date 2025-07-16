import { useState } from 'react';
import { serverUrl, getToken, getUserInfo, getUserConversations, resendVerificationEmail, removeToken } from '../api';
import { useUser } from '../hooks/useUser';

const VerifyPage = () => {
    const { setStatus, setUserData, setAvailableApis, setAvailableModels } = useUser();
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
            const res = await fetch(`${serverUrl}/user/verify/${code}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                    'Content-Type': 'application/json',
                }
            });
            if (!res.ok) {
                setMessage("❌ invalid code");
                return;
            }

            setMessage("✅ Successfully verified !");


            try {
                const userInfo = await getUserInfo();
                const conversations = await getUserConversations();

                setUserData({
                    token: getToken(),
                    name: userInfo.userInfo.name,
                    email: userInfo.userInfo.email,
                    conversations,
                    userApis: userInfo.apiInfo.userApis || [],
                });
                setAvailableApis(userInfo.apiInfo.availableApis || {});
                setAvailableModels(userInfo.apiInfo.availableModels || {});
                setStatus('verified');

            } catch {
                setStatus('verified');
            }

        } catch {
            setMessage("❌ Error during verification");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setLoading(true);
        try {
            await resendVerificationEmail();
            setMessage("✅ Verification email resent successfully!");
        } catch (error) {
            console.error('Error resending verification email:', error);
            setMessage("❌ Error resending verification email");
        } finally {
            setLoading(false);
        }
    }

    const resetStatus = () => {
        setStatus('unauthenticated');
        setUserData(null);
        removeToken();
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#12141b] text-white">
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
        </div>
    );
};

export default VerifyPage;
