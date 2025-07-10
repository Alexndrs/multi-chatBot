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
            className="absolute bottom-full mb-4 left-0 z-50 bg-slate-300/3 text-gray-200 shadow-lg rounded-xl py-[1px] text-sm min-w-[220px] border-t-2 border-white/7 backdrop-blur-2xl flex flex-row"
        >
            {items.map((section, idx) => (
                <div key={idx} className="flex flex-col py-3 min-w-[180px] ml-0 border-l-2 border-r-2 border-l-slate-300/6 border-r-black/8 opacity-50 first:ml-0 first:border-l-0 last:border-r-0">
                    {/* Titre de section (task) */}
                    <div className="text-xs px-3 text-gray-400 uppercase tracking-wide mb-1 mt-2">
                        {section.task}
                    </div>

                    {/* Modèles associés */}
                    {section.models.length > 0 ? (
                        section.models.map((model) => (
                            <div
                                key={model}
                                className="px-5 py-2 hover:bg-blue-400/15 hover:text-blue-300 border-t-2 border-t-transparent hover:border-t-slate-300/5 hover:shadow-md cursor-pointer transition duration-150 ease-in-out"
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



