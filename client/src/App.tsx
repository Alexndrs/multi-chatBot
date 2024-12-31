import './App.css'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from "./context/user-context.tsx";
import LoginPage from "./pages/login.tsx";
import PrivateRoute from "./PrivateRoute.tsx";
import HomePage from './pages/homePage.tsx';
import ChatPage from './pages/chatPage.tsx';
import ProfilePage from './pages/profile.tsx';
import Tab from "./components/tab.tsx";

const TabOnLogin = () => {
  const location = useLocation();

  // Masquer Header et Tab si on est sur la route /login
  const isLoginPage = location.pathname === '/login';

  return (
    <>
      {!isLoginPage && <Tab />}
    </>
  );
};


function App() {
  const userContext = useContext(UserContext);
  if (!userContext) {
    throw new Error('App must be used within a UserContextProvider');
  }
  const { userState } = userContext;
  return (
    <div className={`app-container ${userState.theme}`}>
      <div className="app theme">
        <Router>
          <TabOnLogin />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<LoginPage />} />
            <Route element={<PrivateRoute />}>
              <Route path="/chat/:convId" element={<ChatPage />} />
              <Route path="/" element={<HomePage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Routes>
        </Router>
      </div>
    </div >
  )
}

export default App