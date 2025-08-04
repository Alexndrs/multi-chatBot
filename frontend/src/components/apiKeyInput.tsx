import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { addKey, deleteKey } from '../api/key';
import dayjs from 'dayjs';

interface ApiKeyInputProps {
    apiName: string;
    displayName: string;
    currentKey?: string;
    updatedAt?: string;
    siteUrl?: string;
    onSave?: () => void;
    isFree: boolean;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({
    apiName,
    displayName,
    currentKey = '',
    updatedAt,
    siteUrl,
    onSave,
    isFree
}) => {
    const [value, setValue] = useState(currentKey);
    const [show, setShow] = useState(false);
    const [hasChanged, setHasChanged] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);



    useEffect(() => {
        setHasChanged(value !== currentKey);
    }, [value, currentKey]);

    useEffect(() => { setValue(currentKey); }, [currentKey]);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hasChanged || !value.trim()) return;

        setMessage(null);

        try {
            const msg = await addKey(apiName, value.trim());
            setMessage({ text: msg || "Clé ajoutée avec succès !", type: 'success' });
            setTimeout(() => {
                onSave?.();
            }, 5000);
        } catch (err) {
            console.error('Failed to save API key:', err);
            const errMsg = (err instanceof Error && err.message) ? err.message : 'Failed to validate the API key.';
            setMessage({ text: errMsg, type: 'error' });
        }
    };



    return (
        <form
            onSubmit={onSubmit}
            className="flex flex-col items-start w-full pt-4 pb-2 px-6 md:px-10 transition-all border-b-4 border-b-black/15 border-t-2 border-t-[var(--color-onTop)]"
        >
            <div className='flex flex-col md:flex-row md:items-center gap-3 w-full'>
                {/* API name */}
                <h2 className="w-full md:w-32 flex items-center">
                    {displayName}
                </h2>


                {/* Input */}
                <div className="w-full relative items-center flex rounded-lg bg-[var(--color-onTop)]">
                    <input
                        type={show ? 'text' : 'password'}
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        className="flex-1 w-full text-white px-4 py-4 pr-5 outline-none"
                        placeholder="Enter your API Key"
                    />
                    <button
                        onClick={() => setShow(!show)}
                        className="mr-5 opacity-30 hover:opacity-90 transition-all duration-100 z-10 cursor-pointer"
                    >
                        {show ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    {currentKey && (
                        <button
                            onClick={
                                async (e) => {
                                    e.preventDefault();
                                    if (!currentKey) return;
                                    try {
                                        await deleteKey(apiName);
                                        setValue('');
                                        setHasChanged(false);
                                        onSave?.();
                                    } catch (err) {
                                        console.error('Failed to delete API key:', err);
                                    }
                                }
                            }
                            className='mr-5 opacity-30 hover:opacity-90 hover:text-red-500 transition-all duration-100 z-10 cursor-pointer'
                            aria-label="delete API key"
                        >
                            <FontAwesomeIcon icon={faTrash} size="sm" />
                        </button>
                    )}
                </div>

                {message && (
                    <div
                        className={`mt-2 text-xs px-4 py-2 rounded-md border ${message.type === 'success'
                            ? 'text-green-400 bg-green-900/20 border-green-500/20'
                            : 'text-red-400 bg-red-900/20 border-red-500/20'
                            }`}
                    >
                        {message.text}
                    </div>
                )}


                {/* Submit button */}
                <div className="w-full md:w-21 px-0 md:px-4 mt-2 md:mt-0">
                    {hasChanged && value.trim() && (
                        <button
                            type="submit"
                            className="px-6 py-4 bg-[var(--color-onTop)] hover:bg-blue-500 hover:cursor-pointer rounded-lg transition-colors duration-200"
                        >
                            {currentKey ? 'Modifier' : 'Ajouter'}
                        </button>
                    )}
                </div>

                {/* Date */}
                <div className="w-full md:w-25 text-left md:text-right text-xs text-gray-500 mt-2 md:mt-0">
                    {updatedAt && (
                        <span>Modifié le {dayjs(updatedAt).format('DD MMM YYYY à HH:mm')}</span>
                    )}
                </div>
            </div>
            {/* Site URL */}
            {siteUrl && (
                <div className="smallText mt-2 flex flex-wrap w-full justify-center">
                    Find a key here : <a
                        href={siteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 hover:underline text-blue-300/80 hover:text-blue-200 transition-colors"
                    >
                        {siteUrl}
                    </a>
                    {isFree && (<div className='ml-2'>(It's free !)</div>)}
                </div>
            )}
        </form>
    );
};
