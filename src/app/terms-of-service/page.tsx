
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function TermsOfServicePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 py-12 md:py-16">
        <div className="container max-w-4xl mx-auto prose lg:prose-xl dark:prose-invert">
          <h1 className="font-headline">Terms of Service</h1>
          <p className="text-sm text-muted-foreground">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          
          <h2>1. Agreement to Terms</h2>
          <p>
            By accessing or using the Uvumbuzi Digital Hub website and its services ("Services"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the Services.
          </p>

          <h2>2. User Accounts</h2>
          <p>
            You are responsible for safeguarding your account information, including your password, and for any activities or actions under your account. You agree to notify us immediately of any unauthorized use of your account. You must provide accurate and complete information when creating an account.
          </p>
          
          <h2>3. Tutor Interaction and Disclaimer</h2>
          <p>
            Our platform lists profiles of tutors who have applied and been approved by our administrators. However, this approval is based on the information provided by the tutor and does not constitute a full background check or endorsement.
          </p>
          <ul>
            <li><strong>No Prepayment:</strong> You are strongly advised NOT to pay any tutor for services in advance. Uvumbuzi Digital Hub is not a payment processor and is not responsible for any financial transactions between students and tutors.</li>
            <li><strong>Independent Contractors:</strong> Tutors are independent contractors and not employees or agents of Uvumbuzi Digital Hub.</li>
            <li><strong>Disclaimer of Liability:</strong> You engage with tutors at your own risk. Uvumbuzi Digital Hub is not responsible or liable for the conduct of any user, either online or offline. We are not liable for any claims, injuries, damages, or losses arising from your interactions with tutors or other users of the platform. All interactions and arrangements made are strictly between you and the tutor.</li>
          </ul>

          <h2>4. User Conduct</h2>
          <p>
            You agree not to use the Services to:
          </p>
          <ul>
            <li>Post or transmit any content that is unlawful, harmful, defamatory, or obscene.</li>
            <li>Violate the privacy or intellectual property rights of others.</li>
            <li>Use the platform for any commercial solicitation not expressly permitted by us.</li>
            <li>Impersonate any person or entity.</li>
          </ul>

          <h2>5. Intellectual Property</h2>
          <p>
            The Services and their original content (excluding content provided by users), features, and functionality are and will remain the exclusive property of Uvumbuzi Digital Hub. Our course content, branding, and materials are protected by copyright and other laws.
          </p>
          
          <h2>6. Termination</h2>
          <p>
            We may terminate or suspend your account and bar access to the Services immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </p>
          
          <h2>7. Limitation of Liability</h2>
          <p>
            In no event shall Uvumbuzi Digital Hub, nor its directors, employees, partners, or agents, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Services; (ii) any conduct or content of any third party on the Services; (iii) any content obtained from the Services; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory.
          </p>
          
          <h2>8. Governing Law</h2>
          <p>
            These Terms shall be governed and construed in accordance with the laws of Kenya, without regard to its conflict of law provisions.
          </p>

          <h2>9. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
          </p>

        </div>
      </main>
      <Footer />
    </div>
  );
}
