'use client';

import React from 'react';
import Image from 'next/image';

export default function ErrorScreen({
  errorCode = 'UNKNOWN'
}: {
  errorCode?: string;
}) {
  return (
    <div className="min-h-screen w-full bg-[#1A1A1A] text-[#F0F0F0] flex flex-col items-center justify-center px-6 text-center">
      
      <div className="mb-6">
        <Image
          src="/DARKFEATHER.png"
          alt="System Logo"
          width={80}
          height={80}
          className="opacity-80"
        />
      </div>

      <h1 className="text-3xl font-semibold mb-4">
        KIRIGAMI will return soon
      </h1>

      <p className="text-lg text-gray-300 max-w-xl">
        Our AI systems are currently experiencing a temporary interruption.  
        We’re working on it — please check back shortly.
      </p>

      <div className="mt-6 bg-black/40 px-4 py-2 rounded-md text-sm text-gray-400 border border-gray-700">
        Error: <span className="text-gray-200">{errorCode}</span>
      </div>
    </div>
  );
}
