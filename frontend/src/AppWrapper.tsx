import { useEffect, useRef } from 'react';
import { useUser } from './hooks/useUser';
import LoadingPage from './pages/loadingPage';
import AppContent from './AppContent';
import { useAuthLogic } from './hooks/useAuthLogic';

const AppWrapper = () => {
    const { loading, status } = useUser();
    const { initUserFromToken } = useAuthLogic();

    const initCalled = useRef(false);


    useEffect(() => {
        // Check if a token is present and load user if true
        if (initCalled.current) return;
        initCalled.current = true;

        initUserFromToken();
    }, [initUserFromToken]);


    if (loading) return <LoadingPage />;

    return <AppContent status={status} />
};

export default AppWrapper;
