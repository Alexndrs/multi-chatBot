import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotateRight } from '@fortawesome/free-solid-svg-icons';


export function BotMessage({ message, onReload }: { message: string; onReload: () => void; }) {
    return (
        <div className="flex flex-col">
            <div className="self-start mr-15 ml-15 mt-5 p-4 border-b-2 border-gray-800 text-gray-500">
                <p>{message}</p>
            </div>
            {/* Feedback icon */}
            <div className="flex items-center justify-end mt-2 mr-15 text-gray-700 hover:text-gray-500 cursor-pointer transition duration-200 ease-in-out"
                onClick={onReload}
            >
                <FontAwesomeIcon icon={faRotateRight} />
            </div>
        </div>

    );
}