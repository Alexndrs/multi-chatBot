import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { addApiKey } from '../api';
import dayjs from 'dayjs';

interface ApiKeyInputProps {
    apiName: string;
    displayName: string;
    currentKey?: string;
    updatedAt?: string;
    siteUrl?: string;
    onSave?: () => void;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({
    apiName,
    displayName,
    currentKey = '',
    updatedAt,
    siteUrl,
    onSave,
}) => {
    const [value, setValue] = useState(currentKey);
    const [show, setShow] = useState(false);
    const [hasChanged, setHasChanged] = useState(false);

    useEffect(() => {
        setHasChanged(value !== currentKey);
    }, [value, currentKey]);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hasChanged || !value.trim()) return;

        try {
            await addApiKey(apiName, value.trim());
            onSave?.();
        } catch (err) {
            console.error('Failed to save API key:', err);
        }
    };

    return (
        <form
            onSubmit={onSubmit}
            className="flex flex-col items-center w-full pt-4 pb-2 px-10 transition-all border-b-4 border-b-black/15 border-t-2 border-t-white/5"
        >
            <div className='flex items-center gap-3 w-full'>
                {/* API name + icon */}
                <div className="w-32 flex items-center text-white font-medium">
                    {displayName}
                </div>


                {/* Input */}
                <div className="flex-grow relative items-center">
                    <input
                        type={show ? 'text' : 'password'}
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        className="w-full bg-slate-200/3 border-t-4 border-black/30 text-white px-4 py-2 pr-10 rounded-lg outline-none"
                        placeholder="API Key"
                    />
                    <button
                        type="button"
                        onClick={() => setShow(!show)}
                        className="absolute right-2 top-4 text-gray-400 hover:text-white"
                    >
                        {show ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                {/* Submit button */}
                <div className="w-21 px-4">
                    {hasChanged && value.trim() && (
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                        >
                            {currentKey ? 'Modifier' : 'Ajouter'}
                        </button>
                    )}
                    {!hasChanged && currentKey && (
                        <div className="text-sm text-gray-400 text-center"></div>
                    )}
                </div>

                {/* Date */}
                <div className="w-25 text-right text-xs text-gray-500">
                    {updatedAt && (
                        <span>Modifié le {dayjs(updatedAt).format('DD MMM YYYY à HH:mm')}</span>
                    )}
                </div>
            </div>
            {/* Site URL */}
            {siteUrl && (
                <div className="text-xs text-gray-400 mt-2">
                    Find a key here <a
                        href={siteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline text-blue-300/80 hover:text-blue-200 transition-colors"
                    >
                        {siteUrl}
                    </a>
                </div>
            )}
        </form>
    );
};
