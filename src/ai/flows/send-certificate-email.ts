'use server';
/**
 * @fileOverview A flow for sending a certificate email via Zeptomail.
 *
 * - sendCertificateEmail - A function that sends the email.
 * - SendCertificateEmailInput - The input type for the sendCertificateEmail function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { SendMailClient } from 'zeptomail';

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
  return sendCertificateEmailFlow(input);
}

const sendCertificateEmailFlow = ai.defineFlow(
  {
    name: 'sendCertificateEmailFlow',
    inputSchema: SendCertificateEmailSchema,
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  },
  async (input) => {
    const url = 'api.zeptomail.com/';
    const token = process.env.ZOHO_ZEPTOMAIL_TOKEN;

    if (!token) {
      console.error('Zeptomail token not found in environment variables.');
      return {
        success: false,
        message: 'Server configuration error: Missing email token.',
      };
    }

    const client = new SendMailClient({ url, token });

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

    try {
      await client.sendMail({
        from: {
          address: 'certificates@uvumbuzihub.com',
          name: 'Uvumbuzi Digital Hub',
        },
        to: [
          {
            email_address: {
              address: input.studentEmail,
              name: input.studentName,
            },
          },
        ],
        subject: 'Your Uvumbuzi Digital Hub Certificate is Here!',
        htmlbody: htmlBody,
      });
      return { success: true, message: 'Email sent successfully.' };
    } catch (error) {
      console.error('Zeptomail error:', error);
      return {
        success: false,
        message: `Failed to send email. Reason: ${error}`,
      };
    }
  }
);
