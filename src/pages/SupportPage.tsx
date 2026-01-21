import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const SupportPage = () => {
  const { user } = useAuth();
  const [clickedInternational, setClickedInternational] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} number copied to clipboard!`);
  };

  const logInternationalClick = async () => {
    if (clickedInternational) return;
    setClickedInternational(true);

    try {
      // Use the new logging endpoint
      await fetch('/api/support/log-click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('schoolos_token')}`
        },
        body: JSON.stringify({
          source: 'international_giving',
          userId: user?.id
        })
      });
    } catch (e) {
      console.error('Failed to log click', e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 flex flex-col items-center">
      {/* Header Section */}
      <div className="max-w-2xl text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 tracking-tight">FamilyPath: Learning Together</h1>
        <p className="text-slate-400 text-lg">
          FamilyPath helps families do one simple thing each day—a hymn, a verse, a book, an activity. If this mission resonates with you, I invite you to partner with us.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">

        {/* Card 1: Family Support */}
        <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-2xl backdrop-blur-sm">
          <h2 className="text-xl font-semibold mb-2">Support our Family</h2>
          <p className="text-sm text-slate-400 mb-6">Direct support for Anthony, Primah, Azie, and Arie as we build this vision.</p>
          <div
            className="bg-slate-900 p-4 rounded-lg mb-4 cursor-pointer hover:bg-slate-900/80 transition-colors group"
            onClick={() => copyToClipboard('+256781888609', 'Family support')}
          >
            <span className="text-xs text-blue-400 font-mono uppercase tracking-widest">Mobile Money (MTN)</span>
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold mt-1">+256 781 888 609</p>
              <span className="text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">(Click to copy)</span>
            </div>
            <p className="text-xs text-slate-500">Primah Ataro Mwesigwa</p>
          </div>
        </div>

        {/* Card 2: Platform Support */}
        <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-2xl backdrop-blur-sm">
          <h2 className="text-xl font-semibold mb-2">Support the Platform</h2>
          <p className="text-sm text-slate-400 mb-6">Funds for server costs, development, and reaching more homeschooling families.</p>
          <div
            className="bg-slate-900 p-4 rounded-lg mb-4 cursor-pointer hover:bg-slate-900/80 transition-colors group"
            onClick={() => copyToClipboard('+256751822500', 'Platform support')}
          >
            <span className="text-xs text-yellow-500 font-mono uppercase tracking-widest">Mobile Money (Airtel)</span>
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold mt-1">+256 751 822 500</p>
              <span className="text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">(Click to copy)</span>
            </div>
            <p className="text-xs text-slate-500">Anthony Mwesigwa</p>
          </div>
        </div>
      </div>

      {/* International Section */}
      <div
        className="mt-12 max-w-3xl w-full bg-blue-900/10 border border-blue-900/30 p-8 rounded-2xl"
        onClick={logInternationalClick}
        onMouseEnter={logInternationalClick} // Log on hover or click as intent
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          🌍 Giving from Outside Uganda
        </h3>
        <p className="text-sm text-slate-400 mb-6">
          You can send support directly to our Mobile Money numbers using apps like
          <strong> Sendwave, WorldRemit, </strong> or <strong> Remitly.</strong>
        </p>
        <div className="space-y-4 text-sm">
          <div className="flex gap-4 items-start">
            <div className="bg-blue-600 px-2 py-1 rounded text-xs font-bold">1</div>
            <p>Download <strong>Sendwave</strong> or <strong>Remitly</strong> (available on App Store/Play Store).</p>
          </div>
          <div className="flex gap-4 items-start">
            <div className="bg-blue-600 px-2 py-1 rounded text-xs font-bold">2</div>
            <p>Select <strong>Uganda</strong> as the destination and <strong>Mobile Money</strong> as the delivery method.</p>
          </div>
          <div className="flex gap-4 items-start">
            <div className="bg-blue-600 px-2 py-1 rounded text-xs font-bold">3</div>
            <p>Enter the recipient's name and number exactly as shown above. Funds arrive instantly.</p>
          </div>
        </div>
      </div>

      <footer className="mt-16 text-slate-500 text-sm italic">
        "Whatever you do, work at it with all your heart, as working for the Lord..." — Colossians 3:23
      </footer>
    </div>
  );
};

export default SupportPage;
