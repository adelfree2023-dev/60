"use client";

import { useState } from "react";
import { z } from "zod";

// Landing-#01: Home Page Hero with email capture
export default function HomePage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const emailSchema = z.string().email("Please enter a valid email");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      alert("Please enter a valid email");
      return;
    }

    // Submit to API (Landing-#01)
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error("Failed to submit lead:", error);
    }
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Build Your Store in Minutes
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              The most advanced multi-tenant e-commerce platform. Launch your online store in under 60 seconds.
            </p>
            
            {submitted ? (
              <div className="bg-green-500/20 border border-green-400 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-xl font-semibold">Thank you for signing up!</p>
                <p className="mt-2">Check your email for next steps.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="flex gap-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 px-6 py-4 rounded-lg text-gray-900 text-lg"
                  />
                  <button
                    type="submit"
                    className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition"
                  >
                    Start Free
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need to Succeed
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              title="Lightning Fast"
              description="Your store loads in under 1.5 seconds. SEO optimized and mobile-ready."
            />
            <FeatureCard
              title="AI-Powered"
              description="Generate product descriptions automatically. AI image enhancement included."
            />
            <FeatureCard
              title="Enterprise Security"
              description="Bank-level encryption, GDPR compliance, and 99.99% uptime."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Simple, Transparent Pricing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              name="Basic"
              price="$29"
              features={["Up to 100 products", "Standard support", "Basic analytics"]}
            />
            <PricingCard
              name="Pro"
              price="$79"
              features={["Up to 5,000 products", "Priority support", "AI features", "Bulk import"]}
              highlighted
            />
            <PricingCard
              name="Enterprise"
              price="$299"
              features={["Unlimited products", "Dedicated support", "Custom domain", "API access"]}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-gray-50 p-8 rounded-xl">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function PricingCard({
  name,
  price,
  features,
  highlighted = false,
}: {
  name: string;
  price: string;
  features: string[];
  highlighted?: boolean;
}) {
  return (
    <div
      className={`p-8 rounded-xl ${
        highlighted
          ? "bg-blue-600 text-white ring-4 ring-blue-300"
          : "bg-white border border-gray-200"
      }`}
    >
      <h3 className="text-xl font-semibold mb-2">{name}</h3>
      <div className="text-4xl font-bold mb-6">
        {price}
        <span className="text-sm font-normal">/month</span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2">
            <svg
              className={`w-5 h-5 ${highlighted ? "text-blue-300" : "text-green-500"}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      <button
        className={`w-full py-3 rounded-lg font-semibold transition ${
          highlighted
            ? "bg-white text-blue-600 hover:bg-blue-50"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        Get Started
      </button>
    </div>
  );
}
