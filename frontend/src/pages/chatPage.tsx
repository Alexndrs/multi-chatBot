import { useState } from "react";
import Input from "../components/input/input";
import { UserMessage } from "../components/message/userMessage";
import { BotMessage } from "../components/message/botMessage";
import { useConv } from "../hooks/useConv";
import { createConversation } from "../api";
import { useUser } from "../hooks/useUser";

// const messages = [
//     {
//         msgId: "c2b36a4d-b2bb-4f5d-8bdc-17f0b5e913b3",
//         role: "user",
//         content: "Bonjour, comment tu vas ?",
//         timestamp: "2025-05-18T00:31:26.108Z"
//     },
//     {
//         msgId: "571800e9-2b7c-4f80-b9e3-5c02b98c2837",
//         role: "assistant",
//         content: "[Réponse IA simulée], cela est une réponse longue pour tester comment le message va s'afficher dans la boîte de dialogue. Il est important de s'assurer que le texte est bien formaté et que l'interface utilisateur gère correctement les messages longs. Cela inclut le défilement, la mise en forme et la lisibilité générale du texte. En outre, il est essentiel de tester comment les messages sont envoyés et reçus dans différentes langues et formats. Cela garantit que l'application est robuste et prête à être utilisée par un large éventail d'utilisateurs.",
//         timestamp: "2025-05-18T00:31:26.116Z"
//     },
//     {
//         msgId: "c2be6a4d-b2bb-4f5d-8bdc-17f0b5e913b3",
//         role: "user",
//         content: "Bonjour, comment tu vas ?",
//         timestamp: "2025-05-18T00:31:26.108Z"
//     },
//     {
//         msgId: "571800e9-2b7c-4f83-b9e3-5c02b98c2837",
//         role: "assistant",
//         content: "[Réponse IA simulée]",
//         timestamp: "2025-05-18T00:31:26.116Z"
//     }
// ]



const ChatPage: React.FC = () => {
    const { ConversationData, setConversationData } = useConv();
    const { setUserData } = useUser();
    // console.log("ConversationData: ", ConversationData);


    const onSendMessage = (message: string) => {
        if (ConversationData) {
            console.log("Message sent: ", message, ConversationData);
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