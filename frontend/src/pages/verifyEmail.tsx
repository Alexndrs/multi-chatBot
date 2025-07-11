import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { serverUrl } from '../api';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) return setStatus('error');

        fetch(`${serverUrl}/user/verify-email?token=${token}`)
            .then(res => {
                if (!res.ok) throw new Error();
                return res.text(); // ou res.json() si tu veux + d'infos
            })
            .then(() => setStatus('success'))
            .catch(() => setStatus('error'));
    }, [searchParams]);

    if (status === 'pending') return <p className="text-white">⏳ Vérification en cours...</p>;
    if (status === 'success') return (
        <div className="text-center text-white">
            <h2 className="text-lime-300 text-xl font-bold mb-4">✅ Adresse vérifiée !</h2>
            <p className="text-gray-300">Tu peux maintenant te connecter.</p>
            <a href="/" className="text-lime-400 underline mt-4 inline-block">Retour à la connexion</a>
        </div>
    );
    return (
        <div className="text-center text-red-400">
            <h2 className="text-xl font-bold mb-4">❌ Erreur de vérification</h2>
            <p>Le lien est invalide ou a expiré.</p>
        </div>
    );
};

export default VerifyEmail;
