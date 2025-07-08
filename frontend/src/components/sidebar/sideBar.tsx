import { useEffect, useMemo, useState, useRef, forwardRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleUser, faSquarePlus } from "@fortawesome/free-regular-svg-icons";
import LogoIcon from "../icons/LogoIcon";
import SideBarConvItem from "./sideBarConvItem";
import { SideBarItem } from "./sideBarItem";
import { useUser } from '../../hooks/useUser';
import { useConv } from "../../hooks/useConv";
import { getConversation, deleteConversation, logoutUser } from "../../api";
import { stripThinkTags } from "../../utils";
import { splitThinkContent } from "../../utils";
import type { Message } from "../../contexts/convContext";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

const FloatingUserMenu = forwardRef<HTMLDivElement, { x: number, y: number, onClose: () => void }>(({ x, y, onClose }, ref) => {
    const navigate = useNavigate();

    return (
        <div
            ref={ref}
            className="absolute bg-blue-300/5 backdrop-blur-md rounded-md shadow-md border-t-2 border-white/5 z-50 w-48 text-sm text-gray-400"
            style={{ top: y, left: x }}
        >
            <div
                className="hover:bg-white/2 hover:border-t-2 border-transparent hover:border-white/5 hover:shadow-md px-6 py-3 cursor-pointer transition-all ease-in-out duration-100" onClick={() => {
                    navigate("/settings");
                    onClose();

                }}>Settings</div>
            <div
                className="hover:bg-white/2 hover:border-t-2 border-transparent hover:border-white/5 hover:shadow-md px-6 py-3 cursor-pointer transition-all ease-in-out duration-100" onClick={() => {
                    navigate("/contact");
                    onClose();
                }}>Contact</div>
            <div
                className="hover:bg-red-300/2 hover:border-t-2 border-transparent hover:border-white/5 hover:text-red-400 hover:shadow-md px-6 py-3 cursor-pointer transition-all ease-in-out duration-100"
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

export default function SideBar({ open, onClose }: { open: boolean; onClose: () => void }) {
    const navigate = useNavigate();
    const { userData, setUserData } = useUser();
    const { setConversation, setModalOpen } = useConv();

    const [menuOpen, setMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const userRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);



    // Group conversations by Today, Yesterday, Last 7 days, Preceding conversations
    const groupedConversations = useMemo(() => {
        const now = new Date();
        const todayStr = now.toDateString();
        const yesterdayStr = new Date(Date.now() - 86400000).toDateString();
        const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);

        const groups = {
            Today: [] as ConversationItem[],
            Yesterday: [] as ConversationItem[],
            Last7: [] as ConversationItem[],
            Preceding: [] as ConversationItem[],
        };
        if (userData?.conversations) {
            for (const conv of userData.conversations) {
                const convDate = new Date(conv.date);
                const convStr = convDate.toDateString();
                if (convStr === todayStr) groups.Today.push(conv);
                else if (convStr === yesterdayStr) groups.Yesterday.push(conv);
                else if (convDate > sevenDaysAgo) groups.Last7.push(conv);
                else groups.Preceding.push(conv);
            }
        }
        Object.values(groups).forEach(list =>
            list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        );
        return groups;
    }, [userData?.conversations]);


    // Handing the escape key to close the sidebar
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

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





    // Function to open a conversation
    const openConv = async (convId: string) => {
        const convData = await getConversation(convId);
        const cleanedMsgList = convData.msgList?.map((msg: Message) => {
            const { content: initialContent, thinkContent } = splitThinkContent(msg.content);
            let content = initialContent;
            if ((content === null || content.trim() === "") && (thinkContent)) {
                content = "should I continue thinking?";
            }
            const historyTokens = msg.historyTokens || 0;
            const token = msg.token || 0;
            return {
                ...msg,
                historyTokens,
                token,
                content,
                thinkContent,
            };
        }) || [];

        setConversation({
            ...convData,
            msgList: cleanedMsgList,
        });


        setModalOpen(false);
    };
    const deleteConv = async (convId: string) => {
        await deleteConversation(convId);
        // We should remove the right conv from the UI i.e : remove the conv in userData.conversations:
        setUserData((prevUserData) => {
            if (!prevUserData || !prevUserData.conversations) return prevUserData;
            return {
                ...prevUserData,
                conversations: prevUserData.conversations.filter(conv => conv.convId !== convId),
            };
        });

        setModalOpen(false);
    };



    const onCreateConv = async () => {
        navigate("/");
        setModalOpen(true);
        setConversation(null);
    }


    return (
        <div
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
                    {/* <SideBarItem name="Notes" onClick={() => { }} icon={<FontAwesomeIcon icon={faNoteSticky} />} /> */}
                </div>


                <div className="flex-grow overflow-y-auto px-0 py-3 border-t border-gray-700 flex flex-col gap-2 custom-scrollbar scroll-smooth">
                    {Object.entries(groupedConversations).map(([label, list]) =>
                        list.length > 0 ? (
                            <div key={label}>
                                <div className="text-gray-400 text-xs font-bold my-2">{label}</div>
                                {list.map((conv) => (
                                    <SideBarConvItem key={conv.convId} name={stripThinkTags(conv.convName)} id={conv.convId} onClick={(openConv)} onDelete={(deleteConv)} />
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
}