import { Routes, Route, Navigate } from "react-router-dom";
import ChatPage from "./pages/chatPage";
import SettingsPage from "./pages/settingsPage";
import ContactPage from "./pages/contactPage";


const AppContent = () => {
    return (
        <Routes>
            <Route path="/" element={<ChatPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>

    );
};

export default AppContent;
