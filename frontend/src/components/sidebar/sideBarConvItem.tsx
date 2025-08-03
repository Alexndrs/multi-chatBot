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
        <div className="flex py-2 px-2 hover:bg-white/5 border-t-transparent border-t-2 hover:border-t-white/5 hover:shadow-md rounded-md cursor-pointer transition duration-100 ease-in-out group items-center text-gray-400 hover:text-gray-200" key={convId} id={convId} onClick={async () => {
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
                className="ml-2 text-gray-400/20 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-100 z-10"
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