import 'dotenv/config';
import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL,
        pass: process.env.MAIL_APP_PASSWORD,
    },
});



export async function sendVerificationCodeEmail({ to, name, code }) {
    const link = `${process.env.URL}/verify-email?token=${token}`;

    const mailOptions = {
        from: `"MultiBot" <${process.env.MAIL}>`,
        to,
        subject: 'Vérifie ton adresse e-mail',
        html: `
            <h2>Bienvenue ${name} 👋</h2>
            <p>Merci de t’être inscrit. Clique sur le bouton ci-dessous pour vérifier ton adresse e-mail :</p>
            <a href="${link}" style="padding:10px 20px; background:#4f46e5; color:white; text-decoration:none; border-radius:5px;">Vérifier mon e-mail</a>
            <p>Ou copie-colle ce lien : <br>${link}</p>
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
