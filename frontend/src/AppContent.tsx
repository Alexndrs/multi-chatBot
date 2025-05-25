import { useEffect } from 'react';
import { loginUser, getUserConversations, getConversation } from './api';
import { useUser } from './hooks/useUser';
import ChatPage from './pages/chatPage';


const AppContent = () => {
    const { setUserData } = useUser();

    useEffect(() => {
        const init = async () => {
            const localToken = localStorage.getItem('token');

            if (localToken) {
                console.log('Token déjà présent, skip login.');
            } else {
                const loginData = await loginUser('alex@example.com', 'password123');
                localStorage.setItem('token', loginData.token); // sécurité min
            }

            const conversations = await getUserConversations();
            const firstConv = conversations[0];

            const fullConversation = await getConversation(firstConv.convId);

            const newUser = {
                token: localStorage.getItem('token'),
                name: null,
                email: null,
                userId: fullConversation.userId,
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
