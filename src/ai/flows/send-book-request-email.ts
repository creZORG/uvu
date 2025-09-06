
'use server';
/**
 * @fileOverview A flow for sending a book borrowing request confirmation email.
 *
 * - sendBookRequestEmail - A function that sends the email.
 * - SendBookRequestEmailInput - The input type for the sendBookRequestEmail function.
 */

import { z } from 'genkit';
import { sendMail } from './send-mail-flow';

const SendBookRequestEmailSchema = z.object({
  studentName: z.string().describe('The name of the student.'),
  studentEmail: z.string().email().describe('The email address of the student.'),
  bookTitle: z.string().describe('The title of the book being requested.'),
});

export type SendBookRequestEmailInput = z.infer<
  typeof SendBookRequestEmailSchema
>;

export async function sendBookRequestEmail(
  input: SendBookRequestEmailInput
): Promise<{ success: boolean; message: string }> {
  const subject = `Your Book Request for "${input.bookTitle}" has been received!`;
  const htmlBody = `
      <div>
        <h2>Hello, ${input.studentName}!</h2>
        <p>
          We have successfully received your request to borrow the book: <strong>${input.bookTitle}</strong>.
        </p>
        <p>
          Our library team is now processing your request. We will contact you shortly on the phone number you provided to confirm the delivery details and any applicable fees.
        </p>
        <p>
          Thank you for using the Uvumbuzi Digital Library. Happy reading!
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

    