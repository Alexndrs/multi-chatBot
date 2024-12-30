import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import "./chatPage.css"
import { FaPaperPlane } from "react-icons/fa";



const initialTestMessageList = [
    {
        sender: "chatBot",
        message: "Hello How can I help you ?",
    }
];

const ChatPage: React.FC = () => {
    const { convId } = useParams<{ convId: string }>();
    useEffect(() => {
        // fetch messages from the server
    }, [convId]);



    const [messageList, setMessageList] = useState<{ sender: string; message: string }[]>(initialTestMessageList);




    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleSendMessage = () => {
        console.log("Message a envoyé:", inputValue);
        setMessageList([...messageList, { sender: "user", message: inputValue }]);
        setInputValue("");

        // Send the message to the server
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
