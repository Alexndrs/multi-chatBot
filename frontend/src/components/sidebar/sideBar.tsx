import { useEffect, useState, useRef, forwardRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

import { useUser } from '../../hooks/useUser';
import { logoutUser } from "../../api/user";
import { useConversationLogic } from "../../hooks/useConversationLogic";


import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleUser, faSquarePlus } from "@fortawesome/free-regular-svg-icons";
import LogoIcon from "../icons/LogoIcon";
import SideBarConvItem from "./sideBarConvItem";
import { SideBarItem } from "./sideBarItem";


import { stripThinkTags } from "../../utils";
// import { splitThinkContent } from "../../utils";
// import type { Message } from "../../contexts/convContext";

const FloatingUserMenu = forwardRef<HTMLDivElement, { x: number, y: number, onClose: () => void }>(({ x, y, onClose }, ref) => {
    const navigate = useNavigate();

    return (
        <div
            ref={ref}
            className="absolute bg-blue-300/5 backdrop-blur-md rounded-md shadow-md border-t-2 border-white/5 z-50 w-48 text-sm text-gray-400"
            style={{ top: y, left: x }}
        >
            <div
                className="hover:bg-white/2 border-t-2 border-transparent hover:border-white/5 hover:shadow-md px-6 py-3 cursor-pointer transition-all ease-in-out duration-100" onClick={() => {
                    navigate("/settings");
                    onClose();

                }}>Settings</div>
            <div
                className="hover:bg-white/2 border-t-2 border-transparent hover:border-white/5 hover:shadow-md px-6 py-3 cursor-pointer transition-all ease-in-out duration-100" onClick={() => {
                    navigate("/contact");
                    onClose();
                }}>Contact</div>
            <div
                className="hover:bg-red-300/2 border-t-2 border-transparent hover:border-white/5 hover:text-red-400 hover:shadow-md px-6 py-3 cursor-pointer transition-all ease-in-out duration-100"
                onClick={() => {
                    logoutUser();
                    onClose();
                }}>Logout</div>
        </div>
    );
});


export type ConversationItem = {
    convId: string;
    convName: string;
    date: string;
};

const SideBar = forwardRef<HTMLDivElement, { open: boolean; onClose: () => void }>(({ open, onClose }, ref) => {
    const navigate = useNavigate();
    const { setModalOpen, userData } = useUser();
    const { groupedConversations } = useConversationLogic();

    const [menuOpen, setMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const userRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);



    // Handling the click on profile 
    const handleUserOpenMenu = () => {
        if (userRef.current) {
            const rect = userRef.current.getBoundingClientRect();
            const menuHeight = 130;
            setMenuPosition({
                x: rect.left,
                y: rect.top - menuHeight - 8,
            });

        }
        setMenuOpen(!menuOpen);
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;

            const clickedOutside =
                userRef.current &&
                !userRef.current.contains(target) &&
                menuRef.current &&
                !menuRef.current.contains(target);

            if (clickedOutside) {
                setMenuOpen(false);
            }
        };

        if (menuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuOpen]);


    const onCreateConv = async () => {
        navigate("/");
        setModalOpen(true);
    }

    const groupConv = groupedConversations();

    return (
        <div
            ref={ref}
            className={`fixed top-0 left-0 h-screen w-64 bg-linear-to-t from-[#12141b] to-[#191c2a] border-r-2 border-gray-700/40 p-4 z-50 shadow-lg transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"
                }`}
        >
            <button
                className="absolute top-4 right-4 text-gray-400 text-3xl hover:text-white transition-colors duration-200 active:scale-105 cursor-pointer"
                onClick={onClose}
            >
                &times;
            </button>

            <div className="flex flex-col h-full text-white">
                <div className="mb-2 px-0">
                    <LogoIcon className="w-15 h-15 mb-8 text-lime-300" />
                    <SideBarItem name="New conversation" onClick={onCreateConv} icon={<FontAwesomeIcon icon={faSquarePlus} />} />
                </div>


                <div className="flex-grow overflow-y-auto px-0 py-3 border-t border-gray-700 flex flex-col gap-2 custom-scrollbar scroll-smooth">
                    {Object.entries(groupConv).map(([label, list]) =>
                        list.length > 0 ? (
                            <div key={label}>
                                <div className="text-gray-400 text-xs font-bold my-2">{label}</div>
                                {list.map((conv) => (
                                    <SideBarConvItem key={conv.convId} name={stripThinkTags(conv.convName)} convId={conv.convId} />
                                ))}
                            </div>
                        ) : null
                    )}
                </div>


                <div className="px-0 pt-2 pb-0 border-t border-gray-700 relative">
                    <div ref={userRef} onClick={handleUserOpenMenu}>
                        <SideBarItem
                            name={userData?.name || 'No name found'}
                            icon={<FontAwesomeIcon icon={faCircleUser} />}
                        />
                    </div>

                    {menuOpen && createPortal(
                        <FloatingUserMenu
                            x={menuPosition.x}
                            y={menuPosition.y}
                            onClose={() => setMenuOpen(false)}
                            ref={menuRef}
                        />,
                        document.body
                    )}
                </div>
            </div>
        </div>
    );
});

export default SideBar;