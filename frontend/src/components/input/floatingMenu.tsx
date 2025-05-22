import { useEffect, useRef } from "react";

interface FloatingMenuProps {
    items: string[];
    onSelect: (value: string) => void;
    onClose: () => void;
}


export default function FloatingMenu({ items, onSelect, onClose }: FloatingMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);

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
            className="absolute bottom-full mb-4 left-0 z-50 gray-900 text-gray-400 shadow-lg rounded-lg py-2 text-sm w-40 border-2 border-gray-800">
            {items.map((item, index) => (
                <div
                    key={index}
                    className="px-4 py-2 hover:bg-gray-800 hover:text-blue-300 cursor-pointer"
                    onClick={() => {
                        onSelect(item);
                        onClose();
                    }}
                >
                    {item}
                </div>
            ))}
        </div>
    );
}



