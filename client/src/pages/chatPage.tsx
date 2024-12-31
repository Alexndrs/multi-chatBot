import { useParams } from "react-router-dom";
import { useEffect, useState, useRef, useContext } from "react";
import "./chatPage.css"
import { FaPaperPlane } from "react-icons/fa";
import { createConv, updateConv } from "../api/api";
import { UserContext } from "../context/user-context";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

type Message = {
    messageID: string;
    messageSender: string; // "user" or "chatbot"
    messageContent: string;
    messageDate: Date;
}


const ChatPage: React.FC = () => {
    const navigate = useNavigate();
    const { convId } = useParams<{ convId: string }>();
    const userContext = useContext(UserContext);
    if (!userContext) {
        throw new Error("ProfilePage must be used within a UserContextProvider");
    }
    const { userState, dispatch } = userContext;
    const [messageList, setMessageList] = useState<Message[]>([]);


    const sendMessage = async () => {
        await updateConv();
    }

    const handleFirstMessage = async () => {
        await createConv();
        await updateConv();
    }





    // Whenever the convId changes, we need to handle it and load the messages
    useEffect(() => {
        if (convId === "newConv") {
            // Wait for first message before creating the conv on the server
            setMessageList([]);
        }
        else {

        };

    }, [convId]);



    // Handling the textarea to make it grow with the content
    const [inputValue, setInputValue] = useState<string>("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
        setInputValue(e.target.value);
    };

    // Detecting the enter key
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Calling the functions to send the message on the server (and update the UI)
    const handleSendMessage = async () => {
        if (messageList.length === 0) {
            await handleFirstMessage();
        }
        await sendMessage();


        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
        setInputValue("");
    };

    return (
        <div className="page chat-page-container">
            <h1 className="conv-name">
                {convId}
            </h1>
            <div className="conv-container">
                {messageList.map((message, index) => (
                    <div key={index} className={`message-row ${message.messageSender === "chatbot" ? "chatRow" : "userRow"}`}>
                        <div className={`messageBox ${message.messageSender === "chatbot" ? "chatBot-message" : "user-message"}`}>
                            {message.messageContent}
                        </div>
                    </div>
                ))}
            </div>
            <div className="input-container">
                <textarea
                    className="input-field"
                    ref={textareaRef}
                    value={inputValue}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    rows={1} />
                <button className="send-button" onClick={handleSendMessage}>
                    <FaPaperPlane />
                </button>
            </div>
        </div>
    );
};

export default ChatPage;
