import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { useConversationLogic } from '../../hooks/useConversationLogic';
import { useNavigate } from 'react-router-dom';

export default function SideBarConvItem({
    name,
    convId,
}: {
    name: string;
    convId: string;
}) {
    const { openConversation, deleteConversation } = useConversationLogic();
    const navigate = useNavigate();
    return (
        <div className="flex py-1 px-4 hover:bg-[var(--color-onTop)] border-t-transparent border-t-2 hover:border-[var(--color-onTop)] hover:shadow-md rounded-md cursor-pointer transition duration-100 ease-in-out group items-center secondaryTextWithHover" key={convId} id={convId} onClick={async () => {
            await openConversation(convId);
            navigate("/");
        }} >
            <div
                className="whitespace-nowrap overflow-hidden text-ellipsis flex-1"
                title={name}
            >
                {name}
            </div>
            <button
                className="p-1 opacity-0 group-hover:opacity-10 hover:opacity-100 hover:text-red-500 transition-all duration-150 z-10"
                onClick={e => {
                    e.stopPropagation();
                    deleteConversation(convId);
                }}
                tabIndex={-1}
                aria-label="Supprimer la conversation"
            >
                <FontAwesomeIcon icon={faTrash} size="sm" />
            </button>
        </div>
    );
}