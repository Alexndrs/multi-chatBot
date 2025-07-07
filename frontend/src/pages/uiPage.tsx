import Button from "../components/button";
import TextArea from "../components/textArea";
import { EditableMessage } from "../components/editableMessage";

import { InfiniteSlider } from '../components/motion-primitives/infinite-slider';


export function InfiniteSliderBasic() {
    const logos = [
        "/api_logo/chatGPT.png",
        "/api_logo/claude.png",
        "/api_logo/llama.png",
        "/api_logo/qwen.png",
        "/api_logo/gemma.png",
        "/api_logo/gemini.png",
    ]

    return (
        <InfiniteSlider gap={24} reverse>
            {logos.map((logo, index) => (
                <img key={`slider-${index}`} src={logo} className="h-[120px] w-auto" />
            ))}
        </InfiniteSlider>
    );
}



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
            <div className="w-full border-2 border-red-400">
                <InfiniteSliderBasic />
            </div>
        </div>
    );
};

export default UIPage;