import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer id="footer" className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main footer content */}
        <div className="py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 sm:gap-16">
            {/* Logo and tagline */}
            <div className="flex flex-col items-start">
              <div className="mb-6">
                <Image 
                  src="https://storage.googleapis.com/msgsndr/JBLl8rdfV29DRcGjQ7Rl/media/67f5c2c30a6217bf61d1eb90.png"
                  alt="AlexListens Logo"
                  width={180}
                  height={40}
                  className="h-10 w-auto brightness-0 invert"
                />
              </div>
              <p className="text-gray-400 text-lg leading-relaxed">
                Sometimes you just need someone to talk to.
              </p>
            </div>

            {/* Product links */}
            <div className="flex flex-col">
              <h3 className="text-xl font-bold mb-6 text-white">Product</h3>
              <ul className="space-y-4">
                <li>
                  <a 
                    href="https://alexlistens.com/pricing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors text-lg"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a 
                    href="https://alexlistens.com/tos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors text-lg"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a 
                    href="https://alexlistens.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors text-lg"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="flex flex-col">
              <h3 className="text-xl font-bold mb-6 text-white">Support</h3>
              <ul className="space-y-4">
                <li>
                  <a 
                    href="mailto:support@alexlistens.com" 
                    className="text-gray-400 hover:text-white transition-colors text-lg inline-flex items-center"
                  >
                    support@alexlistens.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright bar */}
        <div className="border-t border-gray-800 py-8">
          <p className="text-gray-400 text-center text-lg">
            &copy; {new Date().getFullYear()} AlexListens.com, FranklinAlexander Ventures, LLC and affiliated entities. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;