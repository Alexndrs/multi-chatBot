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
    console.log('Sending verification email to:', to, 'with code:', code, "process.env.MAIL", process.env.MAIL);

    const mailOptions = {
        from: `"chatbotHub" <${process.env.MAIL}>`,
        to,
        subject: 'Verify your email address',
        html: `
            <h2>Welcome ${name} 👋</h2>
            <p>Thank you for signing up. To activate your account, use the following verification code:</p>
            <h3 style="color: #4CAF50;">${code}</h3>
            <p>Copy and paste this code into the application to complete the verification.</p>
            <p>If you didn't create an account, please ignore this message.</p>
            <p>See you soon on ChatbotHub!</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Failed to send verification email');
    }
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
