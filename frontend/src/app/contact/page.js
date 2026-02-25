'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ContactSupportPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would call an API
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-purple-600 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-5xl mb-4">📬</div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Contact Support</h1>
          <p className="text-purple-100 text-base sm:text-lg">
            We typically respond within 24 hours.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {submitted ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for reaching out. Our support team will get back to you within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
              >
                Send Another
              </button>
              <Link
                href="/dashboard"
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="text-2xl mb-2">📧</div>
                <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                <p className="text-sm text-gray-500">support@familytracker.app</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="text-2xl mb-2">🕐</div>
                <h3 className="font-semibold text-gray-900 mb-1">Response Time</h3>
                <p className="text-sm text-gray-500">Usually within 24 hours</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="text-2xl mb-2">📚</div>
                <h3 className="font-semibold text-gray-900 mb-1">Self Help</h3>
                <Link href="/help" className="text-sm text-purple-600 hover:underline">
                  Visit Help Center →
                </Link>
                <br />
                <Link href="/faqs" className="text-sm text-purple-600 hover:underline">
                  Browse FAQs →
                </Link>
              </div>
            </div>

            {/* Form */}
            <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    required
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Describe your issue or question..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/dashboard" className="text-purple-600 hover:underline text-sm">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
