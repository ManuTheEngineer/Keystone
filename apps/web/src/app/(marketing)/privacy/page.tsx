import Link from "next/link";
import { KeystoneIcon } from "@/components/icons/KeystoneIcon";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2">
            <KeystoneIcon size={24} className="text-earth" />
            <span
              className="text-[15px] font-semibold text-earth tracking-tight"
              style={{ fontFamily: "var(--font-body)" }}
            >
              KEYSTONE
            </span>
          </Link>
          <Link
            href="/terms"
            className="text-[13px] text-muted hover:text-earth transition-colors"
          >
            Terms of Service
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1
          className="text-[32px] text-earth mb-2"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Privacy Policy
        </h1>
        <p className="text-[13px] text-muted mb-10">Last updated: March 16, 2026</p>

        <div className="space-y-8 text-[13px] text-foreground leading-relaxed">
          <section>
            <h2
              className="text-[20px] text-earth mb-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              1. Information We Collect
            </h2>
            <p className="mb-3">
              When you use Keystone, we collect the following types of information:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Account information:</strong> Your name, email address, and password when you create an account.
              </li>
              <li>
                <strong>Project data:</strong> Construction project details you enter, including budgets, schedules, contacts, daily logs, and documents.
              </li>
              <li>
                <strong>Photos:</strong> Images you upload for project documentation, including any metadata such as timestamps and geolocation data embedded in the files.
              </li>
              <li>
                <strong>Usage data:</strong> Information about how you interact with the platform, including pages visited, features used, and session duration.
              </li>
              <li>
                <strong>Device information:</strong> Browser type, operating system, and device identifiers used to access the service.
              </li>
            </ul>
          </section>

          <section>
            <h2
              className="text-[20px] text-earth mb-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              2. How We Use Your Information
            </h2>
            <p className="mb-3">We use the information we collect to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Provide, maintain, and improve the Keystone platform and its features.</li>
              <li>Process your project data and generate reports, documents, and analytics.</li>
              <li>Power AI-assisted features such as budget analysis, schedule recommendations, and construction guidance.</li>
              <li>Send you service-related notifications, such as project milestone reminders and security alerts.</li>
              <li>Respond to your support requests and communicate with you about your account.</li>
              <li>Analyze usage patterns to improve the platform and develop new features.</li>
            </ul>
          </section>

          <section>
            <h2
              className="text-[20px] text-earth mb-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              3. How We Store Your Data
            </h2>
            <p className="mb-3">
              Your data is stored using Firebase, a cloud infrastructure service provided by Google. All data is encrypted in transit using TLS (Transport Layer Security). We implement industry-standard security measures to protect your information from unauthorized access, alteration, or destruction.
            </p>
            <p>
              Photos and documents are stored in secure cloud storage with access controls that ensure only you and authorized team members can view your project files.
            </p>
          </section>

          <section>
            <h2
              className="text-[20px] text-earth mb-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              4. Third-Party Services
            </h2>
            <p className="mb-3">
              We share data with the following third-party services to operate the platform:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Firebase (Google):</strong> Authentication, database, and file storage infrastructure.
              </li>
              <li>
                <strong>Anthropic:</strong> AI features are powered by the Claude API. Project context may be sent to Anthropic to generate construction guidance, budget analysis, and other AI-assisted features. Anthropic does not use your data to train their models.
              </li>
              <li>
                <strong>Vercel:</strong> Web application hosting and delivery.
              </li>
            </ul>
            <p className="mt-3">
              We do not sell your personal information to any third party. We do not share your data with advertisers.
            </p>
          </section>

          <section>
            <h2
              className="text-[20px] text-earth mb-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              5. Your Rights
            </h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Access your data:</strong> You can view all your project data within the platform at any time.
              </li>
              <li>
                <strong>Export your data:</strong> You can export your profile and project data in JSON format from the Settings page.
              </li>
              <li>
                <strong>Delete your data:</strong> You can delete your account and all associated data from the Settings page. Deletion is permanent and cannot be undone.
              </li>
              <li>
                <strong>Correct your data:</strong> You can update your profile information and project data at any time through the platform.
              </li>
            </ul>
          </section>

          <section>
            <h2
              className="text-[20px] text-earth mb-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              6. Cookies and Tracking
            </h2>
            <p>
              Keystone uses essential cookies to maintain your authentication session and remember your preferences. We do not use third-party advertising or tracking cookies. Analytics data is collected in aggregate to understand usage patterns and improve the service.
            </p>
          </section>

          <section>
            <h2
              className="text-[20px] text-earth mb-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              7. Data Retention
            </h2>
            <p>
              We retain your data for as long as your account is active. If you delete your account, all associated data is permanently removed from our systems within 30 days. Backups containing your data may persist for up to 90 days before being purged.
            </p>
          </section>

          <section>
            <h2
              className="text-[20px] text-earth mb-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              8. Changes to This Policy
            </h2>
            <p>
              We may update this privacy policy from time to time. If we make significant changes, we will notify you through the platform or by email. Your continued use of Keystone after changes are posted constitutes your acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2
              className="text-[20px] text-earth mb-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              9. Contact Us
            </h2>
            <p>
              If you have questions about this privacy policy or how we handle your data, contact us at{" "}
              <a
                href="mailto:privacy@keystone.build"
                className="text-clay underline hover:text-earth transition-colors"
              >
                privacy@keystone.build
              </a>.
            </p>
          </section>
        </div>

        {/* Footer nav */}
        <div className="mt-12 pt-8 border-t border-border flex items-center justify-between">
          <Link
            href="/"
            className="text-[13px] text-muted hover:text-earth transition-colors"
          >
            Back to home
          </Link>
          <Link
            href="/terms"
            className="text-[13px] text-muted hover:text-earth transition-colors"
          >
            Terms of Service
          </Link>
        </div>
      </main>
    </div>
  );
}
