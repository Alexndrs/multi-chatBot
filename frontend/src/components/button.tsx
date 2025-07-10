// Button.tsx
import clsx from "clsx";

const variantClasses = {
    primary: "bg-lime-300 hover:bg-lime-500 border-lime-100 text-gray-800",
    danger: "bg-red-600 hover:bg-red-700 border-red-400 text-white",
    success: "bg-green-600 hover:bg-green-700 border-green-500 text-white",
    white: "bg-gray-200 hover:bg-gray-300 border-2 border-white text-gray-600 hover:text-gray-700",
    black: "bg-gray-900 hover:bg-gray-800 border-2 border-gray-700 text-gray-300 hover:text-gray-100",
    transparent: "bg-transparent hover:bg-gray-200/2 border-4 border-gray-200/2 hover:border-gray-200/5 text-gray-200/15 hover:text-gray-200/30",
};

interface ButtonProps {
    text: string;
    onClick: () => void;
    type?: keyof typeof variantClasses;
}

export default function Button({ text, onClick, type = "primary" }: ButtonProps) {
    return (
        <button
            onClick={onClick}
            className={clsx(
                "py-2 px-3 text-xs rounded-md transition duration-150 border-2 cursor-pointer",
                variantClasses[type]
            )}
        >
            {text}
        </button>
    );
}
