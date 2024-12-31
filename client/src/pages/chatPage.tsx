import { useParams } from "react-router-dom";
import { useEffect, useState, useRef, useContext } from "react";
import "./chatPage.css"
import { FaPaperPlane } from "react-icons/fa";
import { serverAPI } from "../api/api";
import { UserContext } from "../context/user-context";
import { v4 as uuidv4 } from "uuid";

type Message = {
    messageID: string;
    messageSender: string; // "user" or "chatbot"
    messageContent: string;
    messageDate: Date;
}


const ChatPage: React.FC = () => {
    const { convId } = useParams<{ convId: string }>();
    const userContext = useContext(UserContext);
    if (!userContext) {
        throw new Error("ProfilePage must be used within a UserContextProvider");
    }
    const { state } = userContext;
    const [messageList, setMessageList] = useState<Message[]>([]);


    const buildMessage = (messageString: string, messageSender: string): Message => {
        return {
            messageID: uuidv4(),
            messageSender: messageSender,
            messageContent: messageString,
            messageDate: new Date()
        }
    }

    // Whenever the convId changes, we need to handle it and load the messages
    useEffect(() => {
        if (convId === "newConv") {
            // Wait for first message before creating the conv on the server
        }
        else {
            const fetchMessages = async () => {
                // fetch messages from the server
                const token = state.token;
                if (!token) {
                    throw new Error("Token is missing");
                }

                const options = {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Auth-Token": token
                    }
                }
                const response = await fetch(`${serverAPI}conv/${convId}`, options);
                const convContent = await response.json();
                console.log(convContent);
            }
            fetchMessages();
        };

    }, [convId]);

    // When we send the first message : we should create a new conversation on the server
    const handleFistMessage = async (firstMessage: Message) => {

        // Create a new conversation
        const token = state.token;
        if (!token) {
            throw new Error("Token is missing");
        }

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Auth-Token": token
            },
            body: JSON.stringify(firstMessage)
        }
        const response = await fetch(`${serverAPI}conv`, options);
        const convContent = await response.json();
        console.log(convContent);

    }

    // Send message with enter key
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Send message with button
    const handleSendMessage = () => {
        console.log("Message a envoyé:", inputValue);
        const wrappedMsg = buildMessage(inputValue, "user");

        if (messageList.length === 0) {
            handleFistMessage(wrappedMsg);
        }

        setMessageList([...messageList, wrappedMsg]);
        setInputValue("");
    };

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
