
'use server';
/**
 * @fileOverview A generic flow for sending email via Zeptomail.
 *
 * - sendMail - A function that sends an email.
 * - SendMailInput - The input type for the sendMail function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { SendMailClient } from 'zeptomail';

const SendMailSchema = z.object({
  to: z.string().email().describe('The email address of the recipient.'),
  subject: z.string().describe('The subject of the email.'),
  htmlBody: z.string().describe('The HTML content of the email.'),
});

export type SendMailInput = z.infer<typeof SendMailSchema>;

export async function sendMail(
  input: SendMailInput
): Promise<{ success: boolean; message: string }> {
  return sendMailFlow(input);
}

const sendMailFlow = ai.defineFlow(
  {
    name: 'sendMailFlow',
    inputSchema: SendMailSchema,
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  },
  async (input) => {
    const url = 'api.zeptomail.com/';
    const token = process.env.ZOHO_ZEPTOMAIL_TOKEN;

    if (!token) {
      const errorMessage =
        'Zeptomail token not found in environment variables. Cannot send email.';
      console.error(errorMessage);
      return {
        success: false,
        message: `Server configuration error: ${errorMessage}`,
      };
    }

    const client = new SendMailClient({ url, token });

    try {
      await client.sendMail({
        bounce_address: 'bounces@uvumbuzihub.com',
        from: {
          address: 'support@uvumbuzihub.com',
          name: 'Uvumbuzi Digital Hub',
        },
        to: [
          {
            email_address: {
              address: input.to,
              name: input.to,
            },
          },
        ],
        subject: input.subject,
        htmlbody: input.htmlBody,
      });
      return { success: true, message: 'Email sent successfully.' };
    } catch (error: any) {
      console.error('Zeptomail API Error:', error.message);
      return {
        success: false,
        message: `Failed to send email. Reason: ${error.message}`,
      };
    }
  }
);
