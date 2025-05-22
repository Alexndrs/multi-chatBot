import { useState } from "react";
import Input from "../components/input/Input";

const ChatPage: React.FC = () => {
    const [showTitle, setShowTitle] = useState(true);


    return (
        <div className="flex flex-col overflow-auto h-screen bg-linear-to-tr from-[#12141b] to-[#191c2a]">
            {showTitle && (
                <div className="flex justify-center items-center h-16">
                    <h1 className="text-3xl font-medium text-white font-playfair">
                        Hello, ask me anything!
                    </h1>
                </div>
            )}
            {/* Scrollable div where messages will be displayed */}
            <div className="flex-1 overflow-y-auto p-4 h-full w-full">
                hey
            </div>

            {/* Input container div for user to type their message */}
            <div className="flex items-center justify-between p-4">
                <Input
                    onSend={(message) => {
                        console.log("Message sent: ", message);
                    }}
                />
            </div>
        </div>
    );
};

export default ChatPage;