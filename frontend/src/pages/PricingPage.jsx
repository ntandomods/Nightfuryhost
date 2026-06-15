import React from 'react';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    coins: '100 coins',
    hosts: '1 host',
    features: ['1 bot instance', '100 starter coins', 'Community support'],
    cta: 'Get Started',
    highlight: false,
  },
  {
    name: 'Starter',
    price: '$4.99',
    period: '/month',
    coins: '500 coins',
    hosts: '3 hosts',
    features: ['3 bot instances', '500 coins/month', 'Email support', 'Basic analytics'],
    cta: 'Choose Starter',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$19.99',
    period: '/month',
    coins: '2,000 coins',
    hosts: '10 hosts',
    features: ['10 bot instances', '2,000 coins/month', 'Priority support', 'Advanced analytics', 'Backups'],
    cta: 'Choose Pro',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: '$49.99',
    period: '/month',
    coins: 'Unlimited',
    hosts: 'Unlimited',
    features: ['Unlimited hosts', 'Unlimited coins', 'Dedicated support', 'Custom integrations', 'SLA'],
    cta: 'Contact Us',
    highlight: false,
  },
];

export const PricingPage = () => (
  <div className="min-h-screen py-20 text-white">
    <div className="max-w-6xl mx-auto px-4">
      <h1 className="text-4xl font-extrabold text-center mb-3">Simple Pricing</h1>
      <p className="text-center text-gray-400 mb-14">Start for free. Scale as you grow.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`rounded-2xl p-6 flex flex-col ${
              p.highlight
                ? 'bg-purple-600 border-2 border-purple-400 shadow-2xl scale-105'
                : 'bg-white/5 border border-white/10'
            }`}
          >
            {p.highlight && (
              <span className="text-xs font-semibold bg-white text-purple-600 px-3 py-0.5 rounded-full self-start mb-3">
                Most Popular
              </span>
            )}
            <h2 className="text-xl font-bold">{p.name}</h2>
            <div className="mt-2 mb-4">
              <span className="text-4xl font-extrabold">{p.price}</span>
              <span className="text-gray-300 text-sm">{p.period}</span>
            </div>
            <ul className="space-y-2 text-sm text-gray-200 flex-1">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link
              to="/register"
              className={`mt-6 block text-center py-2.5 rounded-xl font-semibold text-sm transition ${
                p.highlight
                  ? 'bg-white text-purple-600 hover:bg-gray-100'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {p.cta}
            </Link>
          </div>
        ))}
      </div>
    </div>
  </div>
);
