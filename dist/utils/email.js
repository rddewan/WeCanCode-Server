"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const nodemailer_sendgrid_1 = __importDefault(require("nodemailer-sendgrid"));
const pug_1 = __importDefault(require("pug"));
const html_to_text_1 = require("html-to-text");
class Email {
    /**
     * Constructor for creating a new instance of the class.
     *
     * @param {IUser} user - the user object
     * @param {string} url - the URL
     */
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = process.env.EMAIL_FROM || 'WeCanCode <richard@mobileacademy.io>';
    }
    createNewTransport() {
        // create reusable transporter object using the default SMTP transport
        if (process.env.NODE_ENV === 'production') {
            return nodemailer_1.default.createTransport((0, nodemailer_sendgrid_1.default)({
                apiKey: process.env.SENDGRID_API_KEY || '',
            }));
        }
        return nodemailer_1.default.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            authMethod: 'LOGIN',
            secure: false, // enable or disable SECURE connection.
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }
    async send(template, subject) {
        // Render HTML based on a pug template
        const html = pug_1.default.renderFile(`${__dirname}/../views/email/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject: this.subject,
        });
        // define email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: (0, html_to_text_1.convert)(html),
        };
        // create a transport and send email
        await this.createNewTransport().sendMail(mailOptions);
    }
    async sendWelcomeEmail() {
        await this.send('welcome', 'Welcome to the Natours Family!');
    }
    async sendPasswordResetEmail() {
        await this.send('passwordReset', 'Your password reset token (valid for only 10 minutes)!');
    }
}
exports.default = Email;
;
//# sourceMappingURL=email.js.map