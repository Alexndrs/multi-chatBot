export default function TextArea({ onSend }: { onSend?: () => void }) {

    // Handle enter key press
    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            console.log("Send message : ", event.currentTarget.value);
            onSend?.();
            event.currentTarget.value = "";
        }
    };

    return (
        <textarea
            className="w-full h-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-200 resize-none text-gray-200"
            placeholder="Type your message here..."
            onKeyDown={handleKeyDown}
        />
    );
}