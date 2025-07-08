import { useEffect } from 'react';
import { useUser } from './hooks/useUser';
import { getToken, getUserInfo, getUserConversations, removeToken } from './api';
import Layout from './components/layout';
import LoadingPage from './pages/loadingPage';
import LoginPage from './pages/loginPage';
import AppContent from './AppContent';

const AppWrapper = () => {
    const { userData, setUserData, loading, setLoading } = useUser();

    useEffect(() => {
        const init = async () => {
            try {
                const token = getToken();
                const userInfo = await getUserInfo();
                const conversations = await getUserConversations();
                setUserData({
                    token,
                    name: userInfo.name,
                    email: userInfo.email,
                    conversations
                });
            } catch {
                removeToken();
                setUserData(null);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [setUserData, setLoading]);

    if (loading) return <LoadingPage />;

    if (!userData) return <LoginPage />;

    return (
        <Layout>
            <AppContent />
        </Layout>
    );
};

export default AppWrapper;
