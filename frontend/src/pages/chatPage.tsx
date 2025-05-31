import Input from "../components/input/input";
import { UserMessage } from "../components/message/userMessage";
import { BotMessage } from "../components/message/botMessage";
import { useConv } from "../hooks/useConv";
import { createConversation, sendMessage } from "../api";
import { useUser } from "../hooks/useUser";
import { useRef, useEffect } from "react";


const ChatPage: React.FC = () => {
    const { ConversationData, setConversationData } = useConv();
    const { setUserData } = useUser();
    // console.log("ConversationData: ", ConversationData);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const onSendMessage = (message: string) => {
        if (ConversationData && ConversationData.convId) {
            // If conversation exists, send the message to the existing conversation
            sendMessage(ConversationData.convId, message).then((data) => {
                // Update the conv
                console.log(data.userMsg, data.newMsg)
                setConversationData({
                    convId: ConversationData.convId,
                    convName: ConversationData.convName,
                    date: data.userMsg.timestamp,
                    msgList: [...(ConversationData.msgList || []), data.userMsg, data.newMsg]
                });
            });
        }
        else {
            // Create a new conversation with the first message
            createConversation(message)
                .then((data) => {
                    console.log("New conversation created: ", data);
                    setConversationData({
                        convId: data.conv.convId,
                        convName: data.conv.convName,
                        date: data.conv.date,
                        msgList: [data.userMessage, data.newMessage]
                    });

                    setUserData((prevUserData) => ({
                        name: prevUserData?.name ?? null,
                        email: prevUserData?.email ?? null,
                        token: prevUserData?.token ?? null,
                        conversations: [...(prevUserData?.conversations || []), {
                            convId: data.conv.convId,
                            convName: data.conv.convName,
                            date: data.conv.date
                        }]
                    }));
                })
                .catch((error) => {
                    console.error("Error creating conversation: ", error);
                });

        }
    }



    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [ConversationData?.msgList]);


    return (
        <div className="flex flex-col overflow-auto h-screen bg-linear-to-t from-[#12141b] to-[#191c2a]">
            <div className="flex justify-center items-center h-16">
                <h1 className="text-3xl font-medium text-white font-playfair">
                    {ConversationData ? ConversationData.convName : "Hello, ask me anything!"}
                </h1>
            </div>
            {/* Scrollable div where messages will be displayed */}
            <div className="flex flex-col overflow-y-auto p-4 h-full w-full hide-scrollbar scroll-smooth">
                {ConversationData && ConversationData.msgList ? (
                    ConversationData.msgList.map((message) => {
                        if (message.role === "user") {
                            return (
                                <UserMessage
                                    key={message.msgId}
                                    message={message.content}
                                    onEdit={(newMessage) => {
                                        console.log("Edited message: ", newMessage);
                                    }}
                                />
                            );
                        } else {
                            return (
                                <BotMessage
                                    key={message.msgId}
                                    message={message.content}
                                    onReload={() => { console.log("Should reload message: ", message.msgId); }}
                                />
                            );
                        }
                    })
                ) : null}
                <div ref={messagesEndRef} />
            </div>

            {/* Input container div for user to type their message */}
            <div className="flex items-center justify-between p-4 shadow-custom">
                <Input
                    onSend={onSendMessage}
                />
            </div>
        </div>
    );
};

export default ChatPage;