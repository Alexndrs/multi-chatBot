import Input from "./input";

export default function ModalInput({ open, onClose, onSend }: { open: boolean; onClose: () => void, onSend: (message: string) => Promise<void>; }) {

    if (!open) return null;


    const sendMessage = async (txt: string): Promise<void> => {
        await onSend(txt);
        onClose();
    }


    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="fixed inset-0 bg-black/80" onClick={onClose}></div>
            <Input
                onSend={sendMessage}
                isNeon={true}
            />
        </div>
    );
}