import { useEffect } from 'react';
import { loginUser, getUserInfo, getUserConversations, getToken } from './api';
import { useUser } from './hooks/useUser';
import ChatPage from './pages/chatPage';

const AppContent = () => {
    const { setUserData } = useUser();

    useEffect(() => {
        const init = async () => {
            try {
                const localToken = getToken();
                if (localToken) {
                    console.log('Token déjà présent');
                }
            } catch {
                const loginData = await loginUser('alex@example.com', 'password123');
                localStorage.setItem('token', loginData.token);
            }


            const userInfo = await getUserInfo();
            const conversations = await getUserConversations();

            const newUser = {
                token: localStorage.getItem('token'),
                name: userInfo.name,
                email: userInfo.email,
                conversations,
            }

            setUserData(newUser);

            console.log('✅ Contexte utilisateur initialisé : ', newUser);
        };

        init().catch(console.error);
    }, [setUserData]);

    return <ChatPage />;
};

export default AppContent;
