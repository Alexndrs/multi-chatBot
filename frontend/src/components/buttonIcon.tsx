// Button.tsx
import clsx from "clsx";

const variantClasses = {
    primary: "py-2 px-4 bg-lime-300 hover:bg-lime-500 border-lime-100 text-gray-800 cursor-pointer",
    danger: "py-2 px-4 bg-red-600 hover:bg-red-700 border-red-400 text-white cursor-pointer",
    success: "py-2 px-4 bg-green-600 hover:bg-green-700 border-green-500 text-white cursor-pointer",
    white: "py-2 px-4 bg-gray-200 hover:bg-gray-300 border-2 border-white text-gray-600 hover:text-gray-700 cursor-pointer",
    black: "py-2 px-4 bg-gray-900 hover:bg-gray-800 border-2 border-gray-700 text-gray-300 hover:text-gray-100 cursor-pointer",
    transparent: "py-2 px-2 bg-transparent border-transparent text-gray-200/15 hover:text-gray-200/30 cursor-pointer",
    deactivated: "py-2 px-4 bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-gray-500 cursor-not-allowed",
};

interface ButtonIconProps {
    icon: React.ReactNode
    onClick: ((e: React.MouseEvent<HTMLButtonElement>) => void) | (() => void);
    text?: string;
    type?: keyof typeof variantClasses;
}

export default function ButtonIcon({ icon, onClick, text = "", type = "primary" }: ButtonIconProps) {
    return (
        <button
            onClick={onClick}
            className={clsx(
                "flex rounded-lg transition duration-150 border-2",
                variantClasses[type]
            )}
        >
            <span className={
                clsx(
                    "flex items-center justify-center",
                    text ? "mr-2" : ""
                )
            }>{icon}</span>
            {text && <span className="text-sm">{text}</span>}
        </button>
    );
}
