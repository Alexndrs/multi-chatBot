import React, { useEffect, useState } from 'react';
import { getApiKeys } from '../api';
import { ApiKeyInput } from '../components/apiKeyInput';
import type { ApiKey } from '../api';
import { apiList } from '../utils';

const SettingsPage: React.FC = () => {
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);

    const refetchKeys = async () => {
        try {
            const keys = await getApiKeys();
            setApiKeys(keys);
        } catch (error) {
            console.error('Error fetching API keys:', error);
        }
    };

    useEffect(() => {
        refetchKeys();
    }, []);

    const keysByApi: Record<string, ApiKey> = Object.fromEntries(
        apiKeys.map((k) => [k.api, k])
    );

    const usedApis = apiList.filter((api) => keysByApi[api.api]);
    const unusedApis = apiList.filter((api) => !keysByApi[api.api]);

    return (
        <div className="px-5 md:px-20 lg:px-30 py-10 flex flex-col items-start h-screen bg-gradient-to-t from-[#12141b] to-[#191c2a] text-white overflow-auto">
            <div className="w-full mx-auto">
                <h1 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                    Settings
                </h1>

                <p className="text-sm text-gray-400 mb-4">
                    Manage your API keys for different services.
                </p>
                <div className="flex flex-col w-full border border-white/10 rounded-xl">
                    <div className='flex items-center gap-3 w-full py-4 px-10 bg-slate-200/5 rounded-t-xl'>
                        <div className='w-32 pl-4 flex text-white font-medium'>API</div>
                        <div className='flex-grow pl-4 relative'>Keys</div>
                        <div className='w-20 pl-4 px-4'></div>
                        <div className='w-30 pl-4 px-0'>Last Update</div>
                    </div>
                    {usedApis.length > 0 && (
                        <>
                            {usedApis.map((api) => (
                                <ApiKeyInput
                                    key={api.api}
                                    apiName={api.api}
                                    displayName={api.name}
                                    siteUrl={api.siteUrl}
                                    currentKey={keysByApi[api.api]?.key}
                                    updatedAt={keysByApi[api.api]?.date}
                                    onSave={refetchKeys}
                                />
                            ))}
                        </>
                    )}

                    {unusedApis.length > 0 && (
                        <>
                            {unusedApis.map((api) => (
                                <ApiKeyInput
                                    key={api.api}
                                    apiName={api.api}
                                    displayName={api.name}
                                    siteUrl={api.siteUrl}
                                    currentKey={undefined}
                                    onSave={refetchKeys}
                                />
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
