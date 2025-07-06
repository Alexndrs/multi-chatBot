import { useEffect, useRef } from "react";
import { useConv } from "../../hooks/useConv";

interface FloatingMenuProps {
    onSelect: (value: string) => void;
    onClose: () => void;
}


export default function FloatingMenu({ onSelect, onClose }: FloatingMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);
    const { setTask, setSelectedModel } = useConv();

    const items = [
        {
            task: "multimodal-2-text",
            models: ['gemini-2.5-flash', 'gemini-2.5-pro']
        },
        {
            task: "text-2-text",
            models: ['llama-3.1-8b-instant', 'qwen-qwq-32b', 'gemma2-9b-it', 'qwen-0.6b (local)']
        },
        {
            task: "text-2-image",
            models: []
        },
        {
            task: "text-2-audio",
            models: []
        }
    ]


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);


    return (
        <div
            ref={menuRef}
            className="absolute bottom-full mb-4 left-0 z-50 bg-[#0f1117]/90 text-gray-200 shadow-xl rounded-xl py-3 text-sm min-w-[220px] border border-gray-700 backdrop-blur-md flex flex-row gap-4"
        >
            {items.map((section, idx) => (
                <div key={idx} className="flex flex-col min-w-[180px] ml-2 border-l border-gray-700 opacity-50 first:ml-0 first:border-l-0">
                    {/* Titre de section (task) */}
                    <div className="text-xs px-3 text-gray-400 uppercase tracking-wide mb-1 mt-2">
                        {section.task}
                    </div>

                    {/* Modèles associés */}
                    {section.models.length > 0 ? (
                        section.models.map((model) => (
                            <div
                                key={model}
                                className="px-3 py-2 hover:bg-gray-800 hover:text-blue-300 rounded-md cursor-pointer transition duration-150 ease-in-out"
                                onClick={() => {
                                    setTask(section.task);
                                    console.log("Task set to:", section.task);
                                    setSelectedModel(model);
                                    console.log("Model set to:", model);
                                    onSelect(model);
                                    onClose();
                                }}
                            >
                                {model}
                            </div>
                        ))
                    ) : (
                        <div className="px-3 py-2 text-gray-600 italic cursor-default">
                            No models available
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}



