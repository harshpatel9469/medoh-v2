'use client'

import React from 'react'

export default function AIChatComingSoon() {
  
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-semibold mb-8 text-center">Hi Michael, how can we help you?</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* AI Option */}
        <div className="border-2 border-orange-400 rounded-xl p-4 w-full sm:w-64 shadow hover:shadow-md transition">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>🌀</span>
            <span>Immediate</span>
          </div>
          <h2 className="font-semibold text-lg">Ask your Superpower AI</h2>
          <p className="text-sm text-gray-500 mt-1">Simple questions, advice and analysis</p>
        </div>

        {/* Care Team Option */}
        <div className="bg-gray-100 rounded-xl p-4 w-full sm:w-64 shadow">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span className="flex -space-x-2">
              <img className="w-6 h-6 rounded-full border-2 border-white" src="https://randomuser.me/api/portraits/women/44.jpg" alt="Care team" />
              <img className="w-6 h-6 rounded-full border-2 border-white" src="https://randomuser.me/api/portraits/women/45.jpg" alt="Care team" />
            </span>
            <span>&lt;24h on weekdays</span>
          </div>
          <h2 className="font-semibold text-lg">Ask your care team</h2>
          <p className="text-sm text-gray-500 mt-1">Complex topics and appointments</p>
        </div>
      </div>

      {/* Chat Input Placeholder */}
      <div className="w-full sm:w-[500px] bg-gray-100 rounded-full px-4 py-3 mb-4 text-gray-400 text-sm text-center">
        💬 AI Chat Coming Soon...
      </div>

      {/* Suggestion Buttons (Disabled for now) */}
      <div className="flex gap-2 flex-wrap justify-center">
        {['Supplement recommendations', 'Analyse data', 'Help me understand'].map((text) => (
          <button
            key={text}
            disabled
            className="bg-gray-100 text-gray-400 cursor-not-allowed px-4 py-2 rounded-full text-sm"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  )
}
