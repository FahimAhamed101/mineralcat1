import Contact from "../components/contact-us/Contact";

export default function Page() {
  return (
    <div>
      <h1 className="font-bold text-2xl lg:text-[48px] bg-linear-to-r from-[#A52B1A] to-[#EF5634] text-white text-center py-8">
        Privacy Policy
      </h1>

      <div className="px-10 py-10">
        <p>At PrepMyPTE.com ("we", "us", or "our"), your privacy is important to us.</p>
        <p>
          This Privacy Policy explains how we collect, use, store, and protect your
          personal information when you use our platform and related services.
        </p>
        <p>
          By using PrepMyPTE.com, you consent to the practices described below.
        </p>
        <p className="font-bold mt-10">1. Information We Collect</p>
        <p>We collect the following types of data when you use our Platform:</p>
        <p>a. Account Information</p>
        <p>Full name, email address, and password</p>
        <p>Country of residence and language preference</p>
        <p>Subscription details (plan type, AI credits, mock tests)</p>
        <p>b. Payment Information</p>
        <p>Processed securely through third-party payment gateways</p>
        <p>We do not store full credit card numbers or banking data on our servers</p>
        <p>c. Usage Data</p>
        <p>Activities within the platform (tests taken, AI scores, feedback viewed)</p>
        <p>Device information (browser type, operating system, IP address)</p>
        <p>Cookies and analytics data for site performance and improvements</p>
        <p>d. AI Interaction Data</p>
        <p>Responses you submit for scoring</p>
        <p>Audio or written inputs used for automated evaluation</p>
        <p>Metadata such as task type and submission time</p>
        <p>
          These data are processed by trusted third-party AI providers solely to deliver
          the scoring service.
        </p>
        <p>e. Coaching or Support Data</p>
        <p>If you contact our support or book a coaching session, we may collect:</p>
        <p>Chat or email correspondence</p>
        <p>Scheduling and communication details with assigned coaches</p>

        <p className="font-bold mt-10">2. How We Use Your Information</p>
        <p>We use your personal data to:</p>
        <p>- Create and manage your account</p>
        <p>- Deliver AI-powered scoring and feedback</p>
        <p>- Process payments and manage subscriptions</p>
        <p>- Improve our services, features, and performance</p>
        <p>- Communicate important updates or offers (optional)</p>
        <p>- Provide technical and customer support</p>
        <p>- Prevent fraud, abuse, or misuse of the platform</p>
        <p>
          We do not sell, rent, or trade your data to third parties for marketing purposes.
        </p>

        <p className="font-bold mt-10">3. Legal Basis for Processing</p>
        <p>We process personal data based on:</p>
        <p>- Performance of a contract (providing access to purchased features)</p>
        <p>- Legitimate interest (service improvement, fraud prevention)</p>
        <p>- User consent (cookies, newsletters, or optional data sharing)</p>

        <h1 className="font-bold mt-10">4. Data Retention</h1>
        <p>
          Your account and data remain active as long as you hold AI credits or choose
          to keep your account open.
        </p>
        <p>You may delete your account at any time by contacting contact@prepmypte.com.</p>
        <p>
          After deletion, essential transaction records may be retained for legal and
          accounting purposes for up to 5 years.
        </p>

        <h1 className="font-bold mt-10">5. Cookies and Tracking Technologies</h1>
        <p>We use cookies and similar technologies to:</p>
        <p>- Maintain login sessions</p>
        <p>- Analyze site usage (Google Analytics, internal metrics)</p>
        <p>- Improve user experience and content relevance</p>
        <p>
          You can disable cookies in your browser settings, but some site functions may
          not work properly.
        </p>

        <h1 className="font-bold mt-10">6. Data Sharing and Third-Party Services</h1>
        <p>We may share limited data with trusted partners strictly for service delivery:</p>
        <p>- Payment processors (to handle transactions securely)</p>
        <p>- AI evaluation partners (for automated scoring and analysis)</p>
        <p>- Email and analytics providers (for notifications and performance tracking)</p>
        <p>
          All partners comply with privacy and data-protection standards equivalent to
          GDPR or PIPEDA.
        </p>

        <h1 className="font-bold mt-10">7. International Data Transfers</h1>
        <p>
          Your data may be processed on servers located in other countries (including
          the EU, Canada, or the USA).
        </p>
        <p>
          We ensure such transfers comply with applicable legal safeguards such as
          Standard Contractual Clauses or equivalent agreements.
        </p>

        <h1 className="font-bold mt-10">8. Security of Your Data</h1>
        <p>We use industry-standard security measures, including:</p>
        <p>- Encrypted HTTPS connections</p>
        <p>- Secure password hashing</p>
        <p>- Access control and monitoring</p>
        <p>- Regular backups and software updates</p>
        <p>
          While we take strong precautions, no system is completely immune to security
          risks. You share data at your own discretion.
        </p>

        <h1 className="font-bold mt-10">9. Children's Privacy</h1>
        <p>PrepMyPTE.com is not directed at children under 16 years old.</p>
        <p>
          If we learn that we have collected data from a minor without consent, we will
          delete it immediately.
        </p>

        <h1 className="font-bold mt-10">10. Emails and Notifications</h1>
        <p>
          We may send you transactional or service-related emails (e.g., payment
          confirmations, test reports).
        </p>
        <p>
          You can unsubscribe from promotional emails at any time using the unsubscribe
          link or by contacting support.
        </p>

        <h1 className="font-bold mt-10">11. Third-Party Links</h1>
        <p>Our website may contain links to third-party websites.</p>
        <p>
          We are not responsible for their privacy practices and encourage you to review
          their policies before sharing any information.
        </p>

        <h1 className="font-bold mt-10">12. Changes to This Policy</h1>
        <p>We may update this Privacy Policy periodically.</p>
        <p>
          Significant changes will be communicated via email or a notice on our website.
        </p>
      </div>
      <Contact />
    </div>
  );
}
