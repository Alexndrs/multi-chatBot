import { useState, useEffect, useRef } from "react";
import SideBar from "./sidebar/sideBar";

export default function Layout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleOverlayClick = () => {
        if (isMobile) {
            setSidebarOpen(false);
        }
    };


    return (
        <div className="relative min-h-screen flex flex-col overflow-auto h-screen bg-linear-to-tr from-[#12141b] to-[#191c2a]">
            {isMobile && sidebarOpen && (
                <div
                    ref={overlayRef}
                    className="fixed inset-0 bg-black/5 z-40"
                    onClick={handleOverlayClick}
                />
            )}
            <div ref={sidebarRef}>
                <SideBar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            </div>

            {!sidebarOpen && (
                <button
                    className="fixed top-2 left-2 md:top-4 md:left-4 z-40 text-white text-3xl p-5 hover:text-gray-400 transition-colors duration-200 active:scale-105 cursor-pointer"
                    onClick={() => setSidebarOpen(true)}
                >
                    &#9776;
                </button>
            )}
            <div className={sidebarOpen ? "pl-0 sm:pl-64 transition-all" : "pl-0 transition-all"}>
                {children}
            </div>
        </div>
    );
}