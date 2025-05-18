// This file is a set of exercice to get more familiar with TailwindCSS

import { useState } from 'react';


// Exercice 1: Button

export function MyButton() {

    const content = ["Clique moi", "Tu as cliqué !", "Encore !", "Tu es fou !", "Tu es un génie !", "Tu es le meilleur !😃"]
    const [contentIdx, setcontentIdx] = useState(0);

    const changeContent = () => {
        setcontentIdx((prevIdx) => (prevIdx + 1) % content.length);
    };

    return (
        <button className="mx-auto w-fit self-center bg-red-700 text-white my-3 px-4 py-2 rounded-2xl shadow-2xl hover:bg-red-900 transition duration-150 cursor-pointer active:scale-95" onClick={changeContent}>
            {content[contentIdx]}
        </button>
    );
}

// Exercice 2: Profile card

interface ProfileCardProps {
    name: string;
    bio: string;
    avatarUrl: string;
}

export function ProfileCard({ name, bio, avatarUrl }: ProfileCardProps) {
    return (
        <div className='mx-auto flex max-w-sm items-center gap-x-4 rounded-xl bg-white px-6 py-5 m-6 shadow-lg outline-1 outline-gray-300 hover:outline-gray-500 transition duration-150'>
            <img src={avatarUrl} alt="logo" className='h-16 w-16 shrink-0 rounded-full' />
            <div>
                <h2 className='text-xl font-medium text-black'>{name}</h2>
                <p className='text-gray-700'>{bio}</p>
            </div>
        </div>

    )
}


// Exercice 3: Image gallery grid responsive
interface ImageGalleryProps {
    images: string[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
    return (
        <div className='m-6 mx-auto max-w-7xl px-4 py-6 rounded-2xl bg-white shadow-lg outline-1 outline-gray-300 hover:outline-gray-500 transition duration-150'>
            <h2 className='text-xl font-medium text-gray-700 mb-4'>Pokémon générés avec DDPM</h2>
            <div className='mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                {images.map((image, index) => (
                    <img key={index} src={image} alt={`Image ${index}`} className='size-30 shrink-0 rounded-lg hover:scale-105 transition duration-150 cursor-pointer' />
                ))}
            </div>
        </div>
    )
}


// Exercice 4 : Form
export function Form() {
    return (
        <form className="m-6 flex flex-col gap-4 w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg outline-1 outline-gray-300"
            onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = Object.fromEntries(formData.entries());
                console.log(data);
            }}
        >
            <input name="nom" type="text" placeholder="Nom" className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input name='email' type="email" placeholder="Email" className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <textarea name='message' placeholder="Message" className="border rounded p-2 w-full h-24 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600">Envoyer</button>
        </form>
    )
}


// Exercice 5 : centered modal
export function Modal() {

    const [open, setOpen] = useState(false);

    return (
        <div className="flex flex-col items-center">
            <button onClick={() => setOpen(true)} className="bg-green-500 text-white rounded px-4 py-2 hover:bg-green-600">Ouvrir la modale</button>
            <ModalComponent open={open} onClose={() => setOpen(false)} />
        </div>
    )
}

export function ModalComponent({ open, onClose }: { open: boolean; onClose: () => void }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
            <div className="bg-white rounded-lg shadow-lg p-6 z-10">
                <h2 className="text-xl font-medium mb-4">Titre de la modale</h2>
                <p>Contenu de la modale</p>
                <button onClick={onClose} className="mt-4 bg-red-500 text-white rounded px-4 py-2 hover:bg-red-600">Fermer</button>
            </div>
        </div>
    );
}