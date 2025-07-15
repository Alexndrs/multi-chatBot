import 'dotenv/config';
import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL,
        pass: process.env.MAIL_APP_PASSWORD,
    },
});



export async function sendVerificationEmail({ to, name, code }) {

    const mailOptions = {
        from: `"chatbotHub" <${process.env.MAIL}>`,
        to,
        subject: 'Vérifie ton adresse e-mail',
        html: `
            <h2>Bienvenue ${name} 👋</h2>
            <p>Merci de t’être inscrit. Pour activer ton compte, utilise le code de vérification suivant :</p>
            <h3 style="color: #4CAF50;">${code}</h3>
            <p>Copie-colle ce code dans l’application pour terminer la vérification.</p>
            <p>Si tu n’as pas créé de compte, ignore ce message.</p>
            <p>À bientôt sur ChatbotHub !</p>
        `
    };

    await transporter.sendMail(mailOptions);
}



// const mailOptions = {
//     from: 'chatbot.bridge@gmail.com',
//     to: 'alexandred56700@gmail.com',
//     subject: 'Test de mail automatique',
//     text: 'Hello world 👋',
// };

// transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//         return console.log('Erreur d’envoi :', error);
//     }
//     console.log('Email envoyé : ' + info.response);
// });
