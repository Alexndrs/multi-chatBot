export function SideBarItem({ name, onClick, icon }: { name: string, onClick?: () => void, icon?: React.ReactNode }) {
    return (
        <div
            className="px-5 py-3 bg-[var(--color-onTop)]/50 border-t-2 border-[var(--color-onTop)] shadow-md rounded-lg cursor-pointer transition duration-200 ease-in-out hover:bg-[var(--color-onTop)] flex items-center"
            onClick={onClick}
        >
            {icon && <span className="text-lg mr-4">{icon}</span>}
            <h2
                className="whitespace-nowrap overflow-hidden text-ellipsis"
                title={name}
            >
                {name}
            </h2>
        </div>
    );
}