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
                await loginUser('alex@example.com', 'password123');
            }

            try {
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
            } catch (error) {
                // Remove token we need to login again :
                console.error('❌ Erreur lors de l\'initialisation du contexte utilisateur : ', error);
                localStorage.removeItem('token');
            }
        };

        init().catch(console.error);
    }, [setUserData]);

    return <ChatPage />;
};

export default AppContent;
