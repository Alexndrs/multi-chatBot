import { useEffect, useMemo } from "react";
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

export type ConversationItem = {
    convId: string;
    convName: string;
    date: string;
};

export default function SideBar({ open, onClose }: { open: boolean; onClose: () => void }) {


    const { userData, setUserData } = useUser();
    const { setConversation, setModalOpen } = useConv();


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
        setConversation(null);
        setModalOpen(true);
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
                <div className="mb-2 px-4">
                    <LogoIcon className="w-15 h-15 mb-8 text-lime-300" />
                    <SideBarItem name="New conversation" onClick={onCreateConv} icon={<FontAwesomeIcon icon={faSquarePlus} />} />
                    {/* <SideBarItem name="Notes" onClick={() => { }} icon={<FontAwesomeIcon icon={faNoteSticky} />} /> */}
                </div>


                <div className="flex-grow overflow-y-auto px-4 py-3 border-t border-gray-700 flex flex-col gap-2 custom-scrollbar scroll-smooth">
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




                <div className="px-3 pt-2 pb-0 border-t border-gray-700">
                    {/* <div className="flex items-center gap-2 rounded-md p-3 text-gray-400 hover:text-white hover:bg-gray-800 transition cir">

                        <FontAwesomeIcon icon={faCircleUser} className="text-2xl" />
                        <span>{username}</span>
                    </div> */}
                    <SideBarItem name={userData && userData.name ? userData.name : 'No name found'} onClick={() => { logoutUser(); }} icon={<FontAwesomeIcon icon={faCircleUser} />} />
                </div>
            </div>
            <div className="absolute top-0 right-0 h-full w-[2px] bg-black/20" />
        </div>
    );
}