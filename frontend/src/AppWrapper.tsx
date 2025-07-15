import { useEffect, useRef } from 'react';
import { useUser } from './hooks/useUser';
import { getToken, getUserInfo, getUserConversations, removeToken, } from './api';
import LoadingPage from './pages/loadingPage';
import AppContent from './AppContent';
import { isUnauthorizedError } from './utils';

const AppWrapper = () => {
    const {
        setUserData,
        setAvailableApis,
        setAvailableModels,
        setStatus,
        loading,
        setLoading,
        status,
    } = useUser();

    const initCalled = useRef(false);


    useEffect(() => {
        if (initCalled.current) return;
        const init = async () => {
            initCalled.current = true;


            const token = getToken();
            if (!token) {
                setStatus('unauthenticated');
                setLoading(false);
                return;
            }

            try {
                const userInfo = await getUserInfo();
                const conversations = await getUserConversations();
                setUserData({
                    token,
                    name: userInfo.userInfo.name,
                    email: userInfo.userInfo.email,
                    conversations,
                    userApis: userInfo.apiInfo.userApis || [],
                });
                setAvailableApis(userInfo.apiInfo.availableApis || {});
                setAvailableModels(userInfo.apiInfo.availableModels || {});
                setStatus(userInfo.verified ? 'verified' : 'unverified');
            } catch (err: unknown) {
                if (isUnauthorizedError(err)) {
                    setStatus('unverified');
                } else {
                    removeToken();
                    setUserData(null);
                    setStatus('unauthenticated');
                }
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [setUserData, setLoading, setAvailableApis, setAvailableModels, setStatus]);

    if (loading) return <LoadingPage />;

    return (
        <AppContent status={status} />
    );
};

export default AppWrapper;
