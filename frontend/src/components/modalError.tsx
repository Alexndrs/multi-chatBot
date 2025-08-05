
export default function ModalError({ errorMessage, onClose }: { errorMessage: string, onClose: () => void }) {


    return (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50">
            <div className="bg-[var(--color-onTop)] border-t-2 border-[var(--color-onTop)] min-w-80 rounded-lg p-6 max-w-md mx-4 shadow-xl backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-red-500">Erreur</h3>
                    <button
                        onClick={onClose}
                        className="opacity-50 hover:opacity-100 transition-opacity"
                    >
                        ✕
                    </button>
                </div>
                <p className="mb-4">{errorMessage}</p>
                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-700 transition-colors"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}