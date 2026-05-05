export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms and conditions governing your use of HexaNovaUpdates.",
};

export default function TermsOfServicePage() {
  const lastUpdated = "May 5, 2025";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <nav className="text-xs text-muted-foreground mb-8 flex items-center gap-1.5">
        <Link href="/" className="hover:text-foreground transition-colors font-medium">Home</Link>
        <span>›</span>
        <span className="text-foreground">Terms of Service</span>
      </nav>

      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-3">Terms of Service</h1>
        <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
      </div>

      <div className="prose-content text-foreground space-y-8">

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using <strong>HexaNovaUpdates</strong> (&ldquo;the Site,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree to these Terms, please do not use our Site.
          </p>
        </section>

        <section>
          <h2>2. Description of Service</h2>
          <p>
            HexaNovaUpdates is an AI-powered trending news aggregation and publishing platform. We publish content across technology, celebrity, viral, finance, health, and travel topics. Some articles are drafted or assisted by artificial intelligence tools; these are labelled accordingly.
          </p>
        </section>

        <section>
          <h2>3. Content Accuracy &amp; AI Disclosure</h2>
          <p>
            We strive to publish accurate and timely information; however, we make no warranties regarding the completeness, accuracy, or reliability of any content on the Site, including AI-generated content. AI-assisted articles are clearly marked with an &ldquo;AI-Assisted Content&rdquo; label.
          </p>
          <p>
            Content on this Site is for informational purposes only and should not be relied upon as professional advice (medical, financial, legal, or otherwise). Always consult a qualified professional for decisions in those areas.
          </p>
        </section>

        <section>
          <h2>4. User Conduct</h2>
          <p>By using the Site, you agree not to:</p>
          <ul>
            <li>Post, transmit, or submit any content that is unlawful, harmful, threatening, abusive, defamatory, or otherwise objectionable.</li>
            <li>Impersonate any person or entity or misrepresent your affiliation with any person or entity.</li>
            <li>Scrape, crawl, or use automated tools to extract content from the Site for commercial purposes without our written permission.</li>
            <li>Attempt to gain unauthorised access to any part of the Site or its infrastructure.</li>
            <li>Use the Site to distribute spam, malware, or other harmful content.</li>
          </ul>
        </section>

        <section>
          <h2>5. Comments &amp; User-Submitted Content</h2>
          <p>
            We may allow users to post comments. By submitting a comment, you grant us a non-exclusive, royalty-free, perpetual licence to publish, reproduce, and moderate that content. You are solely responsible for what you post. Comments are subject to our moderation policy and may be removed at our discretion without notice.
          </p>
          <p>
            We do not endorse any user-submitted content and are not liable for any content posted by users.
          </p>
        </section>

        <section>
          <h2>6. Intellectual Property</h2>
          <p>
            All original content, graphics, logos, and design elements on this Site are the property of HexaNovaUpdates or its licensors and are protected by applicable intellectual property laws. You may share individual articles via social media or link to them, provided you credit the source. Republishing full articles without permission is prohibited.
          </p>
          <p>
            Third-party trademarks, brand names, and images remain the property of their respective owners.
          </p>
        </section>

        <section>
          <h2>7. Advertising</h2>
          <p>
            The Site displays advertisements served by third-party networks including Google AdSense. We are not responsible for the content of third-party advertisements. Clicking ads may take you to external websites governed by their own terms and privacy policies.
          </p>
        </section>

        <section>
          <h2>8. External Links</h2>
          <p>
            The Site may contain links to third-party websites. These links are provided for convenience only. We have no control over the content of those sites and accept no responsibility for them or for any loss or damage that may arise from your use of them.
          </p>
        </section>

        <section>
          <h2>9. Disclaimer of Warranties</h2>
          <p>
            The Site is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the Site will be uninterrupted, error-free, or free of viruses.
          </p>
        </section>

        <section>
          <h2>10. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, HexaNovaUpdates and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of, or inability to use, the Site or its content.
          </p>
        </section>

        <section>
          <h2>11. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless HexaNovaUpdates and its operators from any claims, losses, liabilities, damages, costs, or expenses (including reasonable legal fees) arising out of your use of the Site or your violation of these Terms.
          </p>
        </section>

        <section>
          <h2>12. Changes to Terms</h2>
          <p>
            We reserve the right to update or modify these Terms at any time. Changes take effect immediately upon posting. Continued use of the Site after changes are posted constitutes your acceptance of the revised Terms. We encourage you to review these Terms periodically.
          </p>
        </section>

        <section>
          <h2>13. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with applicable laws. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the relevant courts.
          </p>
        </section>

        <section>
          <h2>14. Contact</h2>
          <p>
            If you have any questions about these Terms, please contact us through our website.
          </p>
        </section>

        <div className="pt-6 border-t border-border text-sm text-muted-foreground flex flex-wrap gap-4">
          <Link href="/privacy-policy" className="hover:text-brand transition-colors">Privacy Policy</Link>
          <Link href="/cookie-policy" className="hover:text-brand transition-colors">Cookie Policy</Link>
        </div>
      </div>
    </div>
  );
}
