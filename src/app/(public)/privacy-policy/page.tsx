import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How HexaNovaUpdates collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "May 5, 2025";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <nav className="text-xs text-muted-foreground mb-8 flex items-center gap-1.5">
        <Link href="/" className="hover:text-foreground transition-colors font-medium">Home</Link>
        <span>›</span>
        <span className="text-foreground">Privacy Policy</span>
      </nav>

      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-3">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
      </div>

      <div className="prose-content text-foreground space-y-8">

        <section>
          <h2>1. Introduction</h2>
          <p>
            Welcome to <strong>HexaNovaUpdates</strong> (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
          </p>
          <p>
            Please read this policy carefully. If you disagree with its terms, please discontinue use of our site.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          <h3>Information You Provide</h3>
          <ul>
            <li><strong>Newsletter subscriptions:</strong> email address when you subscribe to our newsletter.</li>
            <li><strong>Comments:</strong> name, email address, and comment content when you post a comment.</li>
            <li><strong>Contact forms:</strong> any information you voluntarily submit.</li>
          </ul>
          <h3>Information Collected Automatically</h3>
          <ul>
            <li><strong>Usage data:</strong> pages visited, time spent, referring URLs, browser type, device type, and IP address (anonymised).</li>
            <li><strong>Cookies:</strong> see our <Link href="/cookie-policy" className="text-brand hover:underline">Cookie Policy</Link> for full details.</li>
            <li><strong>Log data:</strong> server logs capturing access timestamps and error events.</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Deliver and personalise content on our website.</li>
            <li>Send newsletter emails you have opted into (you can unsubscribe at any time).</li>
            <li>Moderate and publish comments you submit.</li>
            <li>Analyse traffic and usage patterns to improve our service.</li>
            <li>Display relevant advertising via Google AdSense.</li>
            <li>Detect and prevent fraud or abuse.</li>
            <li>Comply with applicable laws and regulations.</li>
          </ul>
        </section>

        <section>
          <h2>4. AI-Generated Content</h2>
          <p>
            HexaNovaUpdates uses artificial intelligence tools to assist with drafting and optimising articles. AI-assisted articles are labelled with an &ldquo;AI-Assisted Content&rdquo; badge. We review content for accuracy but cannot guarantee the completeness or timeliness of all information. AI content is based on publicly available trends and news sources.
          </p>
        </section>

        <section>
          <h2>5. Advertising &amp; Third-Party Services</h2>
          <p>We work with third-party partners who may collect data on our site:</p>
          <ul>
            <li><strong>Google AdSense:</strong> serves personalised ads based on your browsing history. Google&rsquo;s privacy policy governs this data: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">policies.google.com/privacy</a>.</li>
            <li><strong>Google Analytics:</strong> collects anonymised usage statistics. You can opt out via the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">Google Analytics Opt-out Browser Add-on</a>.</li>
            <li><strong>Google Tag Manager:</strong> manages third-party scripts in a controlled manner.</li>
          </ul>
          <p>
            These services may set cookies and collect information in accordance with their own privacy policies.
          </p>
        </section>

        <section>
          <h2>6. Cookies</h2>
          <p>
            We use cookies and similar tracking technologies. For a full breakdown of the cookies we use and how to manage them, please see our <Link href="/cookie-policy" className="text-brand hover:underline">Cookie Policy</Link>.
          </p>
        </section>

        <section>
          <h2>7. Data Sharing &amp; Disclosure</h2>
          <p>We do not sell your personal data. We may share data with:</p>
          <ul>
            <li><strong>Service providers:</strong> hosting, analytics, and email delivery providers who act under our instructions.</li>
            <li><strong>Legal requirements:</strong> if required by law, court order, or governmental authority.</li>
            <li><strong>Business transfers:</strong> in the event of a merger or acquisition, subject to the same privacy obligations.</li>
          </ul>
        </section>

        <section>
          <h2>8. Data Retention</h2>
          <p>
            We retain personal data only as long as necessary for the purposes described above or as required by law. Newsletter subscribers&rsquo; data is retained until they unsubscribe. Comment data is retained as long as the comment is published.
          </p>
        </section>

        <section>
          <h2>9. Your Rights</h2>
          <p>Depending on your jurisdiction, you may have rights to:</p>
          <ul>
            <li>Access the personal data we hold about you.</li>
            <li>Request correction of inaccurate data.</li>
            <li>Request deletion of your data (&ldquo;right to be forgotten&rdquo;).</li>
            <li>Object to or restrict certain processing.</li>
            <li>Data portability (receiving your data in a machine-readable format).</li>
            <li>Withdraw consent at any time where processing is based on consent.</li>
          </ul>
          <p>
            To exercise any of these rights, please contact us at the email listed in the Contact section below.
          </p>
        </section>

        <section>
          <h2>10. Children&rsquo;s Privacy</h2>
          <p>
            Our website is not directed to children under 13 years of age. We do not knowingly collect personal information from children. If you believe we have inadvertently collected such information, please contact us so we can promptly delete it.
          </p>
        </section>

        <section>
          <h2>11. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the &ldquo;Last updated&rdquo; date at the top of this page. Continued use of our site after changes constitutes acceptance of the revised policy.
          </p>
        </section>

        <section>
          <h2>12. Contact Us</h2>
          <p>
            If you have questions or concerns about this Privacy Policy or our data practices, please contact us through our website.
          </p>
        </section>

        <div className="pt-6 border-t border-border text-sm text-muted-foreground flex flex-wrap gap-4">
          <Link href="/terms-of-service" className="hover:text-brand transition-colors">Terms of Service</Link>
          <Link href="/cookie-policy" className="hover:text-brand transition-colors">Cookie Policy</Link>
        </div>
      </div>
    </div>
  );
}
