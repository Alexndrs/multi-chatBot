import { Routes, Route, Navigate } from "react-router-dom";
import ChatPage from "./pages/chatPage";
import SettingsPage from "./pages/settingsPage";
import ContactPage from "./pages/contactPage";
import VerifyPage from "./pages/verifyPage";
import Layout from "./components/layout";
import LoginPage from "./pages/loginPage";

type Props = {
    status: 'unverified' | 'verified' | 'unauthenticated';
};

const AppContent = ({ status }: Props) => {
    if (status === 'unauthenticated') {
        return (
            <Routes>
                <Route path="*" element={<LoginPage />} />
            </Routes>
        );
    }

    if (status === 'unverified') {
        return (
            <Routes>
                <Route path="/verify" element={<VerifyPage />} />
                <Route path="*" element={<Navigate to="/verify" />} />
            </Routes>
        );
    }


    return (
        <Layout>
            <Routes>
                <Route path="/" element={<ChatPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Layout>

    );
};

export default AppContent;
