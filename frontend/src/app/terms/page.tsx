"use client";

import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#f5f5f7] to-[#e8e8ed] dark:from-[#2d2d2f] dark:to-[#1d1d1f] py-16 px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-5xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-4">
            Terms &amp; Conditions
          </h1>
          <p className="text-lg text-[#6e6e73] dark:text-[#a1a1a6]">
            Last updated: June 27, 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-6">
        <div className="mx-auto max-w-3xl space-y-10">

          {/* 1. Acceptance */}
          <div>
            <h2 className="text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-[#6e6e73] dark:text-[#a1a1a6] leading-relaxed">
              By accessing or using BWAI (Buy With AI) (&quot;the Service&quot;), you agree to be bound by these Terms and Conditions (&quot;Terms&quot;). If you do not agree to these Terms, you may not access or use the Service. We reserve the right to modify these Terms at any time. Continued use of the Service after changes constitutes acceptance of the modified Terms.
            </p>
          </div>

          {/* 2. Description of Service */}
          <div>
            <h2 className="text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-4">
              2. Description of Service
            </h2>
            <p className="text-[#6e6e73] dark:text-[#a1a1a6] leading-relaxed mb-3">
              BWAI is an AI-powered stock research assistant that provides:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[#6e6e73] dark:text-[#a1a1a6]">
              <li>Multi-agent stock analysis using multiple AI models</li>
              <li>Bull/bear research synthesis and balanced conclusions</li>
              <li>Real-time market data from public sources</li>
              <li>AI-powered hidden gem stock discovery (Potential Stocks)</li>
              <li>Personal watchlists and portfolio tracking</li>
              <li>Member points and level progression system</li>
            </ul>
          </div>

          {/* 3. User Accounts */}
          <div>
            <h2 className="text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-4">
              3. User Accounts
            </h2>
            <p className="text-[#6e6e73] dark:text-[#a1a1a6] leading-relaxed mb-3">
              To access certain features, you must create an account. You agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[#6e6e73] dark:text-[#a1a1a6]">
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your password and account</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>
            <p className="text-[#6e6e73] dark:text-[#a1a1a6] leading-relaxed mt-3">
              We reserve the right to suspend or terminate accounts that violate these Terms or engage in abusive behavior.
            </p>
          </div>

          {/* 4. Points & Membership */}
          <div>
            <h2 className="text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-4">
              4. Points &amp; Membership
            </h2>
            <p className="text-[#6e6e73] dark:text-[#a1a1a6] leading-relaxed mb-3">
              The Service includes a points-based membership system:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[#6e6e73] dark:text-[#a1a1a6]">
              <li>Points can be earned through activities such as watching advertisements or purchased directly</li>
              <li>Membership levels (Entry, Bronze, Silver, Gold, Platinum, Diamond, Master) are determined by total points accumulated</li>
              <li>Certain features, such as Potential Stocks discovery, require a minimum of 500 points (Diamond level or above)</li>
              <li>Points have no cash value and cannot be exchanged for currency</li>
              <li>We reserve the right to adjust point values, level thresholds, and feature access requirements</li>
            </ul>
          </div>

          {/* 5. AI-Generated Content Disclaimer */}
          <div>
            <h2 className="text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-4">
              5. AI-Generated Content Disclaimer
            </h2>
            <div className="rounded-2xl bg-[#ff9500]/5 border border-[#ff9500]/20 p-6 mb-4">
              <p className="text-[#1d1d1f] dark:text-[#f5f5f7] font-medium leading-relaxed">
                ⚠️ Important: BWAI provides AI-generated analysis for informational and educational purposes only. It does not constitute financial advice.
              </p>
            </div>
            <ul className="list-disc list-inside space-y-2 text-[#6e6e73] dark:text-[#a1a1a6]">
              <li>All research outputs are generated by artificial intelligence models and may contain errors, inaccuracies, or biases</li>
              <li>AI agent scores, recommendations, and analyses are not guarantees of future performance</li>
              <li>Past performance and AI predictions do not indicate future results</li>
              <li>You should always conduct your own research and consult a licensed financial advisor before making investment decisions</li>
              <li>Stock prices and market data may be delayed or inaccurate</li>
            </ul>
          </div>

          {/* 6. Acceptable Use */}
          <div>
            <h2 className="text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-4">
              6. Acceptable Use
            </h2>
            <p className="text-[#6e6e73] dark:text-[#a1a1a6] leading-relaxed mb-3">
              You agree not to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[#6e6e73] dark:text-[#a1a1a6]">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Use automated tools to scrape, crawl, or extract data from the Service</li>
              <li>Redistribute or resell AI-generated content without permission</li>
              <li>Impersonate another person or misrepresent your identity</li>
              <li>Interfere with the proper functioning of the Service</li>
            </ul>
          </div>

          {/* 7. Intellectual Property */}
          <div>
            <h2 className="text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-4">
              7. Intellectual Property
            </h2>
            <p className="text-[#6e6e73] dark:text-[#a1a1a6] leading-relaxed">
              The Service, including its design, code, logos, and AI models, is owned by BWAI and protected by intellectual property laws. AI-generated research outputs are provided for your personal use. You may not copy, modify, distribute, or create derivative works from the Service without explicit permission.
            </p>
          </div>

          {/* 8. Limitation of Liability */}
          <div>
            <h2 className="text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-4">
              8. Limitation of Liability
            </h2>
            <p className="text-[#6e6e73] dark:text-[#a1a1a6] leading-relaxed">
              To the maximum extent permitted by law, BWAI and its affiliates shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising from your use of the Service, including but not limited to financial losses from investment decisions based on AI-generated analysis. The Service is provided &quot;as is&quot; without warranties of any kind.
            </p>
          </div>

          {/* 9. Privacy */}
          <div>
            <h2 className="text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-4">
              9. Privacy
            </h2>
            <p className="text-[#6e6e73] dark:text-[#a1a1a6] leading-relaxed">
              Your use of the Service is also governed by our privacy practices. We collect and process personal data (username, email, avatar) to provide the Service. We do not sell your personal information to third parties. By using the Service, you consent to the collection and processing of your data as described in these Terms.
            </p>
          </div>

          {/* 10. Third-Party Services */}
          <div>
            <h2 className="text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-4">
              10. Third-Party Services
            </h2>
            <p className="text-[#6e6e73] dark:text-[#a1a1a6] leading-relaxed">
              The Service integrates with third-party APIs including Yahoo Finance for market data and various AI model providers for analysis. We are not responsible for the availability, accuracy, or policies of these third-party services. Your use of third-party services is subject to their respective terms.
            </p>
          </div>

          {/* 11. Modifications to Service */}
          <div>
            <h2 className="text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-4">
              11. Modifications to Service
            </h2>
            <p className="text-[#6e6e73] dark:text-[#a1a1a6] leading-relaxed">
              We reserve the right to modify, suspend, or discontinue any part of the Service at any time without prior notice. This includes changes to features, point systems, membership levels, and AI agent configurations. We shall not be liable to you or any third party for any modification, suspension, or discontinuation of the Service.
            </p>
          </div>

          {/* 12. Governing Law */}
          <div>
            <h2 className="text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-4">
              12. Governing Law
            </h2>
            <p className="text-[#6e6e73] dark:text-[#a1a1a6] leading-relaxed">
              These Terms shall be governed by and construed in accordance with applicable laws. Any disputes arising from these Terms or the Service shall be resolved through good faith negotiation. If unresolved, disputes shall be submitted to binding arbitration.
            </p>
          </div>

          {/* 13. Contact */}
          <div>
            <h2 className="text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-4">
              13. Contact Information
            </h2>
            <p className="text-[#6e6e73] dark:text-[#a1a1a6] leading-relaxed">
              If you have questions about these Terms, please contact us through the Service or visit our{" "}
              <Link href="/" className="text-[#0071e3] hover:text-[#0077ed] transition-colors">
                homepage
              </Link>.
            </p>
          </div>

          {/* Back link */}
          <div className="pt-6 border-t border-[#d2d2d7] dark:border-[#38383a]">
            <Link
              href="/"
              className="text-[#0071e3] hover:text-[#0077ed] text-sm font-medium transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
