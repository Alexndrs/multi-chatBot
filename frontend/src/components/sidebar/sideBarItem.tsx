export function SideBarItem({ name, onClick, icon }: { name: string, onClick?: () => void, icon?: React.ReactNode }) {
    return (
        <div
            className="flex p-2 hover:bg-white/2 border-t-transparent border-t-2 hover:border-t-white/5 hover:shadow-md rounded-md cursor-pointer transition duration-100 ease-in-out text-gray-400 hover:text-gray-200"
            onClick={onClick}
        >
            {icon && <span className="text-lg mr-2">{icon}</span>}
            <div
                className="whitespace-nowrap overflow-hidden text-ellipsis"
                title={name}
            >
                {name}
            </div>
        </div>
    );
}