import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How HexaNovaUpdates uses cookies and how you can manage them.",
};

export default function CookiePolicyPage() {
  const lastUpdated = "May 5, 2025";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <nav className="text-xs text-muted-foreground mb-8 flex items-center gap-1.5">
        <Link href="/" className="hover:text-foreground transition-colors font-medium">Home</Link>
        <span>›</span>
        <span className="text-foreground">Cookie Policy</span>
      </nav>

      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-3">Cookie Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
      </div>

      <div className="prose-content text-foreground space-y-8">

        <section>
          <h2>1. What Are Cookies?</h2>
          <p>
            Cookies are small text files stored on your device (computer, tablet, or smartphone) when you visit a website. They are widely used to make websites work, remember your preferences, and provide information to site owners.
          </p>
        </section>

        <section>
          <h2>2. How We Use Cookies</h2>
          <p>
            <strong>HexaNovaUpdates</strong> uses cookies to improve your experience, analyse how the Site is used, and deliver relevant advertising. Below is a breakdown of the cookies we use.
          </p>
        </section>

        <section>
          <h2>3. Types of Cookies We Use</h2>

          <h3>3.1 Strictly Necessary Cookies</h3>
          <p>
            These cookies are essential for the website to function and cannot be switched off. They include:
          </p>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Cookie</th>
                  <th>Purpose</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>cookie_consent</code></td>
                  <td>Remembers whether you have accepted or dismissed the cookie banner</td>
                  <td>1 year</td>
                </tr>
                <tr>
                  <td>Session cookies</td>
                  <td>Maintain your session while browsing the Site</td>
                  <td>Session</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>3.2 Analytics Cookies</h3>
          <p>
            These cookies help us understand how visitors interact with the Site so we can improve it. Data is anonymised and aggregated.
          </p>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Cookie</th>
                  <th>Provider</th>
                  <th>Purpose</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>_ga</code></td>
                  <td>Google Analytics</td>
                  <td>Distinguishes unique users</td>
                  <td>2 years</td>
                </tr>
                <tr>
                  <td><code>_ga_*</code></td>
                  <td>Google Analytics</td>
                  <td>Stores session state</td>
                  <td>2 years</td>
                </tr>
                <tr>
                  <td><code>_gid</code></td>
                  <td>Google Analytics</td>
                  <td>Distinguishes users (shorter-lived)</td>
                  <td>24 hours</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>3.3 Advertising Cookies</h3>
          <p>
            These cookies are set by Google AdSense to deliver personalised advertisements based on your interests across the web.
          </p>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Cookie</th>
                  <th>Provider</th>
                  <th>Purpose</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>NID</code></td>
                  <td>Google</td>
                  <td>Stores user preferences for personalised ads</td>
                  <td>6 months</td>
                </tr>
                <tr>
                  <td><code>DSID</code></td>
                  <td>Google</td>
                  <td>Identifies signed-in Google users</td>
                  <td>2 weeks</td>
                </tr>
                <tr>
                  <td><code>IDE</code></td>
                  <td>Google / DoubleClick</td>
                  <td>Tracks ad clicks and conversions</td>
                  <td>13 months</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Google&rsquo;s use of advertising cookies is governed by its own{" "}
            <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
              advertising policies
            </a>
            . You can opt out of personalised ads via{" "}
            <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
              Google Ad Settings
            </a>
            .
          </p>
        </section>

        <section>
          <h2>4. Third-Party Cookies</h2>
          <p>
            In addition to our own cookies, third-party services embedded on our site (such as Google Analytics, Google AdSense, and Google Tag Manager) may also set cookies. We do not control these cookies. Please refer to the relevant third-party privacy policies for details.
          </p>
        </section>

        <section>
          <h2>5. Managing Cookies</h2>
          <p>You have several options to control or delete cookies:</p>

          <h3>Browser Settings</h3>
          <p>
            Most browsers allow you to refuse or delete cookies via their settings. Please be aware that restricting cookies may affect the functionality of this and other websites you visit. Guidance for common browsers:
          </p>
          <ul>
            <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">Google Chrome</a></li>
            <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">Mozilla Firefox</a></li>
            <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">Apple Safari</a></li>
            <li><a href="https://support.microsoft.com/en-us/windows/manage-cookies-in-microsoft-edge" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">Microsoft Edge</a></li>
          </ul>

          <h3>Opt-Out Tools</h3>
          <ul>
            <li>
              <strong>Google Analytics:</strong>{" "}
              <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                Google Analytics Opt-out Browser Add-on
              </a>
            </li>
            <li>
              <strong>Google Personalised Ads:</strong>{" "}
              <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                Google Ad Settings
              </a>
            </li>
            <li>
              <strong>Industry opt-out:</strong>{" "}
              <a href="https://www.youronlinechoices.com/" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                Your Online Choices (EU)
              </a>{" "}
              or{" "}
              <a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                AboutAds.info (US)
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2>6. Cookie Consent</h2>
          <p>
            When you first visit our Site, a cookie consent banner is displayed. By clicking &ldquo;Accept,&rdquo; you consent to our use of analytics and advertising cookies as described in this policy. Strictly necessary cookies are always active. You may withdraw consent at any time by clearing your browser cookies and refreshing the page.
          </p>
        </section>

        <section>
          <h2>7. Changes to This Policy</h2>
          <p>
            We may update this Cookie Policy as technologies or legal requirements change. Updates will be posted on this page with a revised &ldquo;Last updated&rdquo; date.
          </p>
        </section>

        <section>
          <h2>8. Contact Us</h2>
          <p>
            If you have questions about our use of cookies, please contact us through our website.
          </p>
        </section>

        <div className="pt-6 border-t border-border text-sm text-muted-foreground flex flex-wrap gap-4">
          <Link href="/privacy-policy" className="hover:text-brand transition-colors">Privacy Policy</Link>
          <Link href="/terms-of-service" className="hover:text-brand transition-colors">Terms of Service</Link>
        </div>
      </div>
    </div>
  );
}
