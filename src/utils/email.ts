import { IUser } from "../models/userModel";

import nodemailer, { TransportOptions } from 'nodemailer';
import nodemailerSendgrid from 'nodemailer-sendgrid';
import pug from 'pug';
import { convert } from 'html-to-text';

export default class Email {
  to: string;
  firstName: string;
  url: string;
  from: string;
  subject?: string;

  /**
   * Constructor for creating a new instance of the class.
   *
   * @param {IUser} user - the user object
   * @param {string} url - the URL
   */
  constructor(user: IUser, url: string) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = process.env.EMAIL_FROM || 'WeCanCode <richard@mobileacademy.io>';
  }

  createNewTransport() {
    // create reusable transporter object using the default SMTP transport
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport(
        nodemailerSendgrid({
          apiKey: process.env.SENDGRID_API_KEY || '',
        }),
      );
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      authMethod: 'LOGIN',
      secure: false, // enable or disable SECURE connection.
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    } as TransportOptions);
  }

  async send(template: string, subject: string) {
    // Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
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
      text: convert(html),
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
};
