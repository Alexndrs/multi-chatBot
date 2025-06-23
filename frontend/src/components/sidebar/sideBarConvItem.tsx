export default function SideBarConvItem({ name, id, onClick }: { name: string, id: string, onClick: (id: string) => void }) {
    return (
        <div className="flex py-1.5 px-2 hover:bg-gray-800 rounded-md cursor-pointer transition duration-100 ease-in-out" key={id} id={id} onClick={() => onClick(id)} >
            <div
                className="text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis"
                title={name}
            >
                {name}
            </div>
        </div>
    );
}