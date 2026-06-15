import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const features = [
  { icon: '🤖', title: 'Multi-Host Management', desc: 'Run unlimited WhatsApp bot instances from one dashboard.' },
  { icon: '💰', title: 'Coin System', desc: 'Flexible in-app currency for hassle-free payments.' },
  { icon: '📊', title: 'Real-time Analytics', desc: 'Live status, uptime, and performance metrics.' },
  { icon: '🚀', title: 'One-Click Deploy', desc: 'Deploy to Render.com instantly — no server knowledge needed.' },
];

export const HomePage = () => (
  <div className="text-white">
    {/* Hero */}
    <section className="max-w-5xl mx-auto px-4 pt-24 pb-16 text-center">
      <motion.h1
        className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Host Your <span className="text-purple-400">NightFury Bot</span>
        <br />Like a Pro
      </motion.h1>
      <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
        Professional multi-host platform with one-click Render deployment, real-time monitoring, and an advanced coin system.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to="/register"
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-semibold text-lg transition"
        >
          Get Started Free
        </Link>
        <Link
          to="/pricing"
          className="border border-white/20 hover:border-purple-400 text-white px-8 py-3 rounded-xl font-semibold text-lg transition"
        >
          View Pricing
        </Link>
      </div>
    </section>

    {/* Features */}
    <section className="max-w-5xl mx-auto px-4 pb-24 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {features.map((f) => (
        <motion.div
          key={f.title}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-4xl mb-3">{f.icon}</div>
          <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
          <p className="text-sm text-gray-400">{f.desc}</p>
        </motion.div>
      ))}
    </section>
  </div>
);
