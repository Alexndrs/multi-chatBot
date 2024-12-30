import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import "./chatPage.css"
import { FaPaperPlane } from "react-icons/fa";

const convName = "conv1";



const initialTestMessageList = [
    {
        sender: "chatBot",
        message: "Hello How can I help you ?",
    },
    {
        sender: "user",
        message: "Please tell me about the product",
    },
    {
        sender: "chatBot",
        message: "Hello How can I help you ?",
    },
    {
        sender: "user",
        message: "Please tell me about the product",
    },
    {
        sender: "chatBot",
        message: "Hello How can I help you ?",
    },
    {
        sender: "user",
        message: "Please tell me about the product",
    },
    {
        sender: "chatBot",
        message: "Hello How can I help you ?",
    },
    {
        sender: "user",
        message: "Please tell me about the product",
    },
    {
        sender: "chatBot",
        message: "Hello How can I help you ?",
    },
    {
        sender: "user",
        message: "Please tell me about the product",
    },
    {
        sender: "chatBot",
        message: "Hello How can I help you ?",
    },
    {
        sender: "user",
        message: "Please tell me about the product",
    },
];

const ChatPage: React.FC = () => {
    const { convId } = useParams<{ convId: string }>();
    const [messageList, setMessageList] = useState<{ sender: string; message: string }[]>(initialTestMessageList);

    // Handling the textarea to make it grow with the content
    const [inputValue, setInputValue] = useState<string>("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto"; // Réinitialise la hauteur
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
        setInputValue(e.target.value); // Met à jour la valeur
    };



    useEffect(() => {
        // fetch messages from the server
    }, [convId]);


    return (
        <div className="page chat-page-container">
            <h1 className="conv-name">
                {convName}, {convId}
            </h1>
            <div className="conv-container">
                {messageList.map((message, index) => (
                    <div key={index} className={`message-row ${message.sender === "chatBot" ? "chatRow" : "userRow"}`}>
                        <div className={`messageBox ${message.sender === "chatBot" ? "chatBot-message" : "user-message"}`}>
                            {message.message}
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
                    rows={1} />
                <button className="send-button">
                    <FaPaperPlane />
                </button>
            </div>
        </div>
    );
};

export default ChatPage;
