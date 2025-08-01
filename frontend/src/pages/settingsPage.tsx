import React, { useEffect, useState } from 'react';
import { getApiKeys } from '../api/key';
import type { ApiKey } from '../api/types';
import { ApiKeyInput } from '../components/apiKeyInput';
import { useUser } from '../hooks/useUser';
import type { ApiInfo } from '../contexts/userContext';

const SettingsPage: React.FC = () => {
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const { setUserData, availableApis, userData } = useUser();

    const refetchKeys = React.useCallback(async () => {
        try {
            const keys = await getApiKeys();
            setApiKeys(keys);
            setUserData((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    userApis: keys.map(k => k.api),
                }
            });
        } catch (error) {
            console.error('Error fetching API keys:', error);
        }
    }, [setUserData]);

    useEffect(() => {
        refetchKeys();
    }, [refetchKeys]);

    const keysByApi: Record<string, ApiKey> = Object.fromEntries(
        apiKeys.map(k => [k.api, k])
    );


    let usedApis: [string, ApiInfo][] = [];
    let unusedApis: [string, ApiInfo][] = [];

    if (availableApis && userData?.userApis) {
        usedApis = Object.entries(availableApis).filter(
            ([apiName]) => userData.userApis?.includes(apiName)
        );

        unusedApis = Object.entries(availableApis).filter(
            ([apiName]) => !userData.userApis?.includes(apiName)
        );
    }

    return (
        <div className="px-5 md:px-20 lg:px-30 py-10 flex flex-col items-start h-screen bg-gradient-to-t from-[#12141b] to-[#191c2a] text-white overflow-x-hidden">
            <div className="w-full mx-auto">
                <h1 className="pl-30 md:pl-0 text-2xl font-semibold mb-6 flex items-center gap-2">
                    Settings
                </h1>

                <p className="text-sm text-gray-400 mb-4">
                    Manage your API keys for different services.
                </p>
                <div className="flex flex-col w-full border border-white/10 rounded-xl">
                    <div className='hidden md:flex items-center gap-3 w-full py-4 px-10 bg-slate-200/5 rounded-t-xl'>
                        <div className='w-32 pl-4 text-white font-medium'>API</div>
                        <div className='flex-grow pl-4 relative'>Keys</div>
                        <div className='w-20 pl-4 px-4'></div>
                        <div className='w-30 pl-4 px-0'>Last Update</div>
                    </div>

                    <>
                        {usedApis.map(([apiName, apiInfo]) => {
                            return <ApiKeyInput
                                key={apiName}
                                apiName={apiName}
                                displayName={apiInfo.name}
                                siteUrl={apiInfo.url}
                                currentKey={keysByApi[apiName]?.key}
                                updatedAt={keysByApi[apiName]?.date}
                                onSave={refetchKeys}
                                isFree={apiInfo.isFree}
                            />
                        }
                        )}

                        {unusedApis.map(([apiName, apiInfo]) => {

                            return <ApiKeyInput
                                key={apiName}
                                apiName={apiName}
                                displayName={apiInfo.name}
                                siteUrl={apiInfo.url}
                                currentKey={undefined}
                                onSave={refetchKeys}
                                isFree={apiInfo.isFree}
                            />
                        }
                        )}
                    </>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
