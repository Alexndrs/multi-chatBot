import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotateRight } from '@fortawesome/free-solid-svg-icons';


export function BotMessage({ message, onReload, token }: { message: string | null; onReload: () => void; token: number }) {
    return (

        <div className="self-start ml-15 mt-5 w-fit max-w-[90%]">
            <div className="p-4 text-gray-500">
                {message}
            </div>

            {/* Ligne de séparation */}
            <div className="border-t-2 border-gray-800 mb-2 w-full" />

            {/* Footer : token à gauche, reload à droite */}
            {token > 0 ? (
                <div className="flex justify-between items-center text-[10px] text-gray-500 italic w-full px-1">

                    <span>{token} tokens</span>
                    <button onClick={onReload} className="text-gray-500 hover:text-gray-300 transition-colors cursor-pointer">
                        <FontAwesomeIcon icon={faRotateRight} />
                    </button>
                </div>
            ) : (
                <div className="flex justify-end items-center text-[10px] text-gray-500 italic w-full px-1">
                    <button onClick={onReload} className="text-gray-500 hover:text-gray-300 transition-colors cursor-pointer">
                        <FontAwesomeIcon icon={faRotateRight} />
                    </button>
                </div>
            )
            }
        </div>
    );
}