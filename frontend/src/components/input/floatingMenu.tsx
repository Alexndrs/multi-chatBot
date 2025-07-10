import { useEffect, useRef } from "react";
import { useConv } from "../../hooks/useConv";
import { useUser } from "../../hooks/useUser";

interface FloatingMenuProps {
    onSelect: (value: string) => void;
    onClose: () => void;
}


export default function FloatingMenu({ onSelect, onClose }: FloatingMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);
    const { setTask, setSelectedModel } = useConv();
    const { availableModels, availableApis, userData } = useUser();

    type ModelItem = { modelName: string; isAvailableForUser: boolean };
    type SectionItem = { task: string; models: ModelItem[] };

    const items = Object.entries(availableModels || {}).reduce((acc, [modelName, modelInfo]) => {
        if (!modelInfo.task) return acc;


        let section = acc.find(s => s.task === modelInfo.task);
        if (!section) {
            section = { task: modelInfo.task, models: [] };
            acc.push(section);
        }


        let isAvailableForUser = false;
        if (userData?.userApis?.includes(modelInfo.api) || availableApis?.[modelInfo.api]?.isFree) {
            isAvailableForUser = true;
        }
        section.models.push({ modelName, isAvailableForUser });
        section.models.sort((a, b) => {
            if (a.isAvailableForUser === b.isAvailableForUser) return 0;
            return a.isAvailableForUser ? -1 : 1;
        });


        return acc;
    }, [] as SectionItem[]);


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
            className="absolute bottom-full mb-4 left-0 z-50 bg-slate-300/3 text-gray-200 shadow-lg rounded-xl py-3 text-sm min-w-[220px] border-t-2 border-white/7 backdrop-blur-2xl flex flex-row"
        >
            {items.map((section, idx) => (
                <div key={idx} className="flex flex-col min-w-[180px] ml-0 border-l-2 border-r-2 border-l-slate-300/6 border-r-black/8 opacity-50 first:ml-0 first:border-l-0 last:border-r-0 max-h-[200px] overflow-auto hide-scrollbar">
                    {/* Titre de section (task) */}
                    <div className="text-xs px-3 text-gray-400 uppercase tracking-wide mb-1 mt-2 cursor-default">
                        {section.task}
                    </div>
                    {/* Modèles associés */}
                    <div className="flex flex-col justify-center">

                        {section.models.length > 0 ? (
                            section.models.map((model) => (
                                <div
                                    key={model.modelName}
                                    className={`px-5 py-2 hover:bg-blue-400/15 hover:text-blue-300 border-t-2 border-t-transparent hover:border-t-slate-300/5 hover:shadow-md cursor-pointer transition duration-150 ease-in-out ${!model.isAvailableForUser ? 'opacity-30 pointer-events-none' : ''}`}
                                    onClick={() => {
                                        if (!model.isAvailableForUser) return;
                                        setTask(section.task);
                                        console.log("Task set to:", section.task);
                                        setSelectedModel(model.modelName);
                                        console.log("Model set to:", model.modelName);
                                        onSelect(model.modelName);
                                        onClose();
                                    }}
                                >
                                    {model.modelName}
                                    {/* {!model.isAvailableForUser && (
                                        <span className="ml-2 text-xs text-red-400">(Not available)</span>
                                        )} */}
                                </div>
                            ))
                        ) : (
                            <div className="px-3 py-2 text-gray-600 italic cursor-default">
                                No models available
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}



