
'use server';
/**
 * @fileOverview A flow for sending a certificate email via Zeptomail.
 *
 * - sendCertificateEmail - A function that sends the email.
 * - SendCertificateEmailInput - The input type for the sendCertificateEmail function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { sendMail } from './send-mail-flow';

const SendCertificateEmailSchema = z.object({
  studentName: z.string().describe('The name of the student.'),
  studentEmail: z.string().email().describe('The email address of the student.'),
  certificateUrl: z.string().url().describe('The URL to the certificate.'),
});

export type SendCertificateEmailInput = z.infer<
  typeof SendCertificateEmailSchema
>;

export async function sendCertificateEmail(
  input: SendCertificateEmailInput
): Promise<{ success: boolean; message: string }> {
  const subject = 'Your Uvumbuzi Digital Hub Certificate is Here!';
  const htmlBody = `
      <div>
        <h2>Congratulations, ${input.studentName}!</h2>
        <p>
          We are delighted to inform you that you have successfully passed the General Coding Course final exam.
        </p>
        <p>
          Your hard work and dedication have paid off. You can view and download your official certificate by clicking the link below:
        </p>
        <p>
          <a href="${input.certificateUrl}" target="_blank" style="padding: 10px 15px; background-color: #90EE90; color: black; text-decoration: none; border-radius: 5px;">
            View Your Certificate
          </a>
        </p>
        <p>
          We wish you the best in your future endeavors and hope you continue to build on the skills you've learned.
        </p>
        <br />
        <p>Sincerely,</p>
        <p>The Uvumbuzi Community Network Team</p>
      </div>
    `;

  return sendMail({
    to: input.studentEmail,
    subject: subject,
    htmlBody: htmlBody,
  });
}
