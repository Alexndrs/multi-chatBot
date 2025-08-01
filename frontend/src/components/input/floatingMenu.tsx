import { useEffect, useRef } from "react";
import { useUser } from "../../hooks/useUser";

interface FloatingMenuProps {
    onSelect: (value: string) => void;
    onClose: () => void;
}


export default function FloatingMenu({ onSelect, onClose }: FloatingMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);
    const { availableModels, availableApis, userData, setSelectedModel, selectedModel } = useUser();

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
            className="absolute bottom-full mb-4 left-0 z-50 bg-slate-700/5 text-gray-200 shadow-lg rounded-xl text-sm min-w-[220px] border-t-2 border-white/7 backdrop-blur-3xl flex flex-row"
        >

            {items.map((section, idx) => (
                <div className="py-3 border-l-2 border-r-3 border-l-slate-300/6 border-r-black/20 opacity-100 first:ml-0 first:border-l-0 last:border-r-0">
                    <div key={idx} className="flex flex-col min-w-[180px] ml-0 opacity-100 first:ml-0 max-h-[200px] overflow-auto hide-scrollbar">
                        {/* Titre de section (task) et nombre de model*/}
                        <div className="text-xs px-3 text-gray-500 uppercase tracking-wide mb-1 mt-2 cursor-default">
                            {section.task} {section.models.length > 0 ? `(${section.models.length})` : ""}
                        </div>
                        {/* Modèles associés */}
                        <div className="flex flex-col justify-center">

                            {section.models.length > 0 ? (
                                section.models.map((model) => {

                                    const isSelected = selectedModel.includes(model.modelName);
                                    const isAvailable = model.isAvailableForUser;


                                    return (
                                        <div
                                            key={model.modelName}
                                            className={`
                                            group relative px-5 py-2 border-t-2 border-t-transparent text-gray-300 transition-all duration-200 ease-in-out
                                            ${!isAvailable
                                                    ? 'opacity-30 cursor-not-allowed'
                                                    : 'cursor-pointer hover:border-t-slate-300/20 hover:shadow-xl'}
                                            ${isSelected
                                                    ? 'bg-lime-300/10 text-lime-400 border-l-4 border-l-lime-400 hover:bg-red-400/10 hover:text-red-500 hover:border-l-red-500'
                                                    : isAvailable
                                                        ? 'hover:bg-slate-400/10'
                                                        : ''
                                                }`}
                                            onClick={() => {
                                                if (!model.isAvailableForUser) return;
                                                if (selectedModel.includes(model.modelName)) {
                                                    setSelectedModel(selectedModel.filter(m => m !== model.modelName));
                                                }
                                                else {
                                                    setSelectedModel([...selectedModel, model.modelName]);
                                                }

                                                // console.log("Model set to:", model.modelName);
                                                onSelect(model.modelName);
                                            }}
                                        >
                                            <div className="flex items-center justify-between">

                                                {model.modelName}
                                                {isAvailable && (
                                                    <div className="flex items-center">

                                                        <div className={`
                                                                transition-all duration-200 
                                                                ${isSelected
                                                                ? 'opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100'
                                                                : 'opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100'
                                                            }
                                                        `}>
                                                            {isSelected ? (
                                                                <div className="flex items-center justify-center w-6 h-6 bg-red-500/20 rounded-full border border-red-500/30 text-red-600 hover:bg-red-500/30">
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                                    </svg>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center justify-center w-6 h-6 bg-lime-500/20 rounded-full border border-lime-500/30 text-lime-500 hover:bg-lime-500/30">
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                        </div>
                                    )
                                })
                            ) : (
                                <div className="px-3 py-2 text-gray-600 italic cursor-default">
                                    No models available
                                </div>
                            )}
                        </div>
                    </div>
                </div>))}
        </div>
    );
}



