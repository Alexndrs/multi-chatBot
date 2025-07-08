import React, { useEffect } from 'react';
import { addApiKey, getApiKeys } from '../api';

const SettingsPage: React.FC = () => {
    useEffect(() => {
        const fetchApiKeys = async () => {
            try {
                const keys = await getApiKeys();
                console.log('Fetched API Keys:', keys);
            } catch (error) {
                console.error('Error fetching API keys:', error);
            }
        };

        fetchApiKeys();
    }, []);

    return (
        <div className="flex flex-col overflow-auto h-screen bg-linear-to-t from-[#12141b] to-[#191c2a]">
            <h1>Hello Settings ⚙️</h1>
            {/* Mini form for adding a apiName / key with addApiKey */}
            <form
                onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    const apiName = formData.get('apiName') as string;
                    const apiKey = formData.get('apiKey') as string;

                    try {
                        await addApiKey(apiName, apiKey);
                        console.log('API Key added successfully');
                    } catch (error) {
                        console.error('Error adding API Key:', error);
                    }
                }}
                className="flex flex-col gap-4 p-4"
            >
                <input
                    type="text"
                    name="apiName"
                    placeholder="API Name"
                    className="p-2 rounded bg-gray-800 text-white"
                    required
                />
                <input
                    type="text"
                    name="apiKey"
                    placeholder="API Key"
                    className="p-2 rounded bg-gray-800 text-white"
                    required
                />
                <button
                    type="submit"
                    className="p-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                    Add API Key
                </button>
            </form>
        </div>
    );
};

export default SettingsPage;