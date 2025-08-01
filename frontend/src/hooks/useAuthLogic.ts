import { useUser } from './useUser';
import { removeToken, createUser, loginUser, getUserInfo, verifyCode, resendVerificationEmail } from '../api/user';
import { getConversationList } from '../api/conversation';

import { isUnauthorizedError } from '../utils';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook to handle authentication logic.
 * Provides methods for login, registration, verification, and user initialization.
 */
export function useAuthLogic() {
    const { setUserData, setAvailableApis, setAvailableModels, setStatus, setLoading } = useUser();
    const navigate = useNavigate();

    const applyUserData = async () => {
        const userData = await getUserInfo();
        const conversations = await getConversationList();

        setUserData({
            token: localStorage.getItem('token'),
            name: userData.userInfo.name,
            email: userData.userInfo.mail,
            conversations,
            userApis: userData.apiInfo.userApis || [],
            verified: userData.verified,
        });

        setAvailableApis(userData.apiInfo.availableApis || {});
        setAvailableModels(userData.apiInfo.availableModels || {});

        setStatus(userData.verified ? 'verified' : 'unverified');

        if (!userData.verified) {
            console.warn('User is not verified, redirecting to verification page');
            navigate('/verify');
        }
    };

    const initUserFromToken = async () => {
        try {
            setLoading(true);
            await applyUserData();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        await loginUser(email, password);
        try {
            await applyUserData();
        } catch (err) {
            if (isUnauthorizedError(err)) {
                setStatus('unverified');
                navigate('/verify');
                return;
            }
            throw err;
        }
    };

    const register = async (name: string, email: string, password: string) => {
        await createUser(name, email, password);
        setStatus('unverified');
        navigate('/verify');
    };

    const verifyUser = async (code: string) => {
        try {
            await verifyCode(code);
        } catch {
            throw new Error("Verification failed, please check your code.");
        }
        try {
            await applyUserData();
        } catch (err) {
            throw new Error("Failed to apply user data after verification : " + err);
        }
    }

    const sendEmail = async () => {
        await resendVerificationEmail()
    }

    const resetStatus = () => {
        setStatus('unauthenticated');
        setUserData(null);
        removeToken();
    }

    return { login, register, initUserFromToken, verifyUser, sendEmail, resetStatus };
}
