import Button from "../components/button";
import TextArea from "../components/textArea";
import { EditableMessage } from "../components/editableMessage";



const UIPage: React.FC = () => {


    return (
        <div className="flex flex-col overflow-auto h-screen bg-linear-to-tr from-[#12141b] to-[#191c2a]">
            <h1 className="text-3xl mt-10 font-medium text-center text-white font-playfair">
                Hello world
            </h1>
            {/* Grid for displaying UI KIT */}
            <div className="mx-auto m-3 flex flex-wrap gap-4">
                {(["primary", "danger", "success", "white", "black", "transparent"] as const).map((type) => (
                    <Button
                        key={type}
                        onClick={() => {
                            console.log(`${type} button clicked`);
                        }}
                        text={`${type.charAt(0).toUpperCase() + type.slice(1)} Button`}
                        type={type} />
                ))}
                <div className="flex w-full max-w-2xl">
                    <TextArea />
                </div>
                <div className="flex w-full max-w-2xl">
                    <EditableMessage
                        message="This is an editable message"
                        onEdit={(newMessage) => {
                            console.log("Edited message: ", newMessage);
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default UIPage;