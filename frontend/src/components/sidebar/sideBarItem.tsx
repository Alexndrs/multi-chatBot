export function SideBarItem({ name, onClick, icon }: { name: string, onClick: () => void, icon?: React.ReactNode }) {
    return (
        <div
            className="flex p-2 hover:bg-gray-800 rounded-md cursor-pointer transition duration-100 ease-in-out"
            onClick={onClick}
        >
            {icon && <span className="text-lg mr-2 text-gray-400">{icon}</span>}
            <div
                className="text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis"
                title={name}
            >
                {name}
            </div>
        </div>
    );
}