import { useState } from "react";
import SideBar from "./sidebar/sideBar";

export default function Layout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="relative min-h-screen flex flex-col overflow-auto h-screen bg-linear-to-tr from-[#12141b] to-[#191c2a]">
            <SideBar open={sidebarOpen} onClose={() => setSidebarOpen(false)}
                conversations={[
                    { id: "1", name: "Conv1 avec un titre vraiment très long", date: "2025-05-21T00:31:26.108Z" },
                    { id: "2", name: "Conv2", date: "2025-05-22T00:31:26.108Z" },
                    { id: "3", name: "Conv3", date: "2025-05-20T00:31:26.108Z" },
                    { id: "4", name: "Conv4", date: "2025-05-17T00:31:26.108Z" },
                    { id: "5", name: "Conv5", date: "2025-05-17T00:31:26.108Z" },
                    { id: "6", name: "Conv6", date: "2025-05-16T00:31:26.108Z" },
                    { id: "7", name: "Conv7", date: "2025-05-15T00:31:26.108Z" },
                    { id: "8", name: "Conv8", date: "2025-05-14T00:31:26.108Z" },
                    { id: "9", name: "Conv9", date: "2025-05-13T00:31:26.108Z" },
                    { id: "10", name: "Conv10", date: "2025-05-12T00:31:26.108Z" },
                    { id: "11", name: "Conv11", date: "2025-05-11T00:31:26.108Z" },
                    { id: "12", name: "Conv12", date: "2025-05-10T00:31:26.108Z" }
                ]}
                username="John Doe"
            />
            {!sidebarOpen && (
                <button
                    className="fixed top-4 left-4 z-40 text-white text-3xl p-5 hover:text-gray-400 transition-colors duration-200 active:scale-105 cursor-pointer"
                    onClick={() => setSidebarOpen(true)}
                >
                    &#9776;
                </button>
            )}
            <div className={sidebarOpen ? "pl-0 sm:pl-68 transition-all" : "pl-0 transition-all"}>
                {children}
            </div>
        </div>
    );
}