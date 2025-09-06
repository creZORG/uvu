
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 py-12 md:py-16">
        <div className="container max-w-4xl mx-auto prose lg:prose-xl dark:prose-invert">
          <h1 className="font-headline">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          
          <h2>1. Introduction</h2>
          <p>
            Welcome to Uvumbuzi Digital Hub ("we," "our," "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services. By using our services, you agree to the collection and use of information in accordance with this policy.
          </p>

          <h2>2. Information We Collect</h2>
          <p>We may collect personal information that you provide to us directly, such as:</p>
          <ul>
            <li><strong>Personal Identification Information:</strong> Name, email address, phone number, date of birth, location, national ID (for users 18+).</li>
            <li><strong>Profile Information:</strong> Educational background, areas of interest, profile photo URL (for tutors), qualifications, and bio.</li>
            <li><strong>Parent/Guardian Information:</strong> For users under 18, we collect the parent or guardian's name and phone number.</li>
            <li><strong>Usage Data:</strong> Course progress, exam submissions, and book borrowing/request history.</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, operate, and maintain our services.</li>
            <li>Create and manage your account.</li>
            <li>Process your transactions and requests (e.g., course enrollment, book borrowing).</li>
            <li>Communicate with you, including sending certificates, notifications, and updates.</li>
            <li>Improve our website, services, and user experience.</li>
            <li>Verify tutor applications and display approved tutor profiles.</li>
            <li>Ensure the safety and security of our platform.</li>
          </ul>

          <h2>4. Sharing Your Information</h2>
          <p>We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties except in the following situations:</p>
          <ul>
            <li><strong>Tutor Profiles:</strong> If you are an approved tutor, certain information from your profile (name, photo, bio, subjects) will be publicly visible to students. Your phone number will only be shown to users who explicitly request to view it.</li>
            <li><strong>Service Providers:</strong> We may share your information with third-party vendors and service providers that perform services for us (e.g., email delivery via Zeptomail).</li>
            <li><strong>Legal Requirements:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities.</li>
          </ul>

          <h2>5. Data Security</h2>
          <p>
            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
          </p>

          <h2>6. Your Data Rights</h2>
          <p>
            You have the right to access, update, or delete your personal information at any time through your profile page or by contacting us. Please note that we may need to retain certain information for recordkeeping purposes or to complete transactions.
          </p>

          <h2>7. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
          </p>

          <h2>8. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us through the information provided on our <a href="/contact">Contact Page</a>.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
