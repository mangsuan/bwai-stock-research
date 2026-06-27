"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Form submission is simulated for now
    setSubmitted(true);
  }

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#f5f5f7] to-[#e8e8ed] dark:from-[#2d2d2f] dark:to-[#1d1d1f] py-16 px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-5xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-[#6e6e73] dark:text-[#a1a1a6]">
            Have questions, feedback, or need help? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-6">
        <div className="mx-auto max-w-3xl">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Contact Info Cards */}
            <div className="rounded-2xl border border-[#d2d2d7] dark:border-[#48484a] bg-white dark:bg-[#2d2d2f] p-6 text-center card-hover">
              <div className="w-12 h-12 rounded-xl bg-[#0071e3]/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📧</span>
              </div>
              <h3 className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">Email</h3>
              <p className="text-sm text-[#6e6e73] dark:text-[#a1a1a6]">support@bwai.com</p>
            </div>
            <div className="rounded-2xl border border-[#d2d2d7] dark:border-[#48484a] bg-white dark:bg-[#2d2d2f] p-6 text-center card-hover">
              <div className="w-12 h-12 rounded-xl bg-[#34c759]/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⏰</span>
              </div>
              <h3 className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">Response Time</h3>
              <p className="text-sm text-[#6e6e73] dark:text-[#a1a1a6]">Within 24 hours</p>
            </div>
            <div className="rounded-2xl border border-[#d2d2d7] dark:border-[#48484a] bg-white dark:bg-[#2d2d2f] p-6 text-center card-hover">
              <div className="w-12 h-12 rounded-xl bg-[#ff9500]/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">Support</h3>
              <p className="text-sm text-[#6e6e73] dark:text-[#a1a1a6]">General & Technical</p>
            </div>
          </div>

          {/* Contact Form */}
          {submitted ? (
            <div className="rounded-2xl border border-[#34c759]/30 bg-[#34c759]/5 p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[#34c759]/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <h2 className="text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
                Message Sent!
              </h2>
              <p className="text-[#6e6e73] dark:text-[#a1a1a6] mb-6">
                Thank you for reaching out. We&apos;ll get back to you within 24 hours.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setName("");
                  setEmail("");
                  setSubject("");
                  setMessage("");
                }}
                className="btn-apple-secondary text-sm !py-2.5 !px-6"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-2xl border border-[#d2d2d7] dark:border-[#48484a] bg-white dark:bg-[#2d2d2f] p-8">
              <h2 className="text-xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-6">
                Send us a message
              </h2>
              <div className="grid md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Your name"
                    className="w-full rounded-xl border border-[#d2d2d7] dark:border-[#48484a] bg-[#fbfbfd] dark:bg-[#1d1d1f] px-4 py-3 text-[#1d1d1f] dark:text-[#f5f5f7] placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                    className="w-full rounded-xl border border-[#d2d2d7] dark:border-[#48484a] bg-[#fbfbfd] dark:bg-[#1d1d1f] px-4 py-3 text-[#1d1d1f] dark:text-[#f5f5f7] placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">
                  Subject
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#d2d2d7] dark:border-[#48484a] bg-[#fbfbfd] dark:bg-[#1d1d1f] px-4 py-3 text-[#1d1d1f] dark:text-[#f5f5f7] focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10 outline-none transition-all"
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="feedback">Feedback &amp; Suggestions</option>
                  <option value="billing">Billing &amp; Points</option>
                  <option value="bug">Bug Report</option>
                  <option value="partnership">Partnership</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={5}
                  placeholder="How can we help you?"
                  className="w-full rounded-xl border border-[#d2d2d7] dark:border-[#48484a] bg-[#fbfbfd] dark:bg-[#1d1d1f] px-4 py-3 text-[#1d1d1f] dark:text-[#f5f5f7] placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10 outline-none transition-all resize-none"
                />
              </div>
              <button
                type="submit"
                className="btn-apple !py-3 !px-8"
              >
                Send Message
              </button>
            </form>
          )}

          {/* FAQ */}
          <div className="mt-12">
            <h2 className="text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-6 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              <div className="rounded-2xl border border-[#d2d2d7] dark:border-[#48484a] bg-white dark:bg-[#2d2d2f] p-6">
                <h3 className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
                  Is BWAI free to use?
                </h3>
                <p className="text-sm text-[#6e6e73] dark:text-[#a1a1a6]">
                  Yes! Basic stock research is free and doesn&apos;t even require an account. Creating an account gives you access to watchlists, profile customization, and the member points system. The Potential Stocks feature requires 500 points.
                </p>
              </div>
              <div className="rounded-2xl border border-[#d2d2d7] dark:border-[#48484a] bg-white dark:bg-[#2d2d2f] p-6">
                <h3 className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
                  How do I earn points?
                </h3>
                <p className="text-sm text-[#6e6e73] dark:text-[#a1a1a6]">
                  You can earn points by watching simulated ads (for demo purposes) or by purchasing points directly. Visit your Profile page to manage your points and see your membership level.
                </p>
              </div>
              <div className="rounded-2xl border border-[#d2d2d7] dark:border-[#48484a] bg-white dark:bg-[#2d2d2f] p-6">
                <h3 className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
                  Is the AI analysis financial advice?
                </h3>
                <p className="text-sm text-[#6e6e73] dark:text-[#a1a1a6]">
                  No. All AI-generated analysis is for informational and educational purposes only. Always do your own research and consult a licensed financial advisor before making investment decisions.
                </p>
              </div>
              <div className="rounded-2xl border border-[#d2d2d7] dark:border-[#48484a] bg-white dark:bg-[#2d2d2f] p-6">
                <h3 className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
                  How often is the data updated?
                </h3>
                <p className="text-sm text-[#6e6e73] dark:text-[#a1a1a6]">
                  Stock quotes are fetched in real-time from Yahoo Finance. Research results are cached for 4 hours to balance freshness and performance. Potential Stocks discovery runs daily.
                </p>
              </div>
            </div>
          </div>

          {/* Back link */}
          <div className="mt-10 pt-6 border-t border-[#d2d2d7] dark:border-[#38383a]">
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
