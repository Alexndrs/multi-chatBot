import { useState } from "react";
import SideBar from "./sidebar/sideBar";

export default function Layout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="relative min-h-screen flex flex-col overflow-auto h-screen bg-linear-to-tr from-[#12141b] to-[#191c2a]">
            <SideBar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            {!sidebarOpen && (
                <button
                    className="fixed top-4 left-4 z-40 text-white text-3xl p-5 hover:text-gray-400 transition-colors duration-200 active:scale-105 cursor-pointer"
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