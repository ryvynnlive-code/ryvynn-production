'use client';

import { useEffect } from 'react';
import { useGeolocation } from '@/contexts/GeolocationContext';
import { useI18n } from '@/contexts/I18nContext';

export default function CrisisPage() {
  const { location, requestLocation } = useGeolocation();
  const { tf } = useI18n();

  useEffect(() => {
    if (!location.detected) {
      requestLocation();
    }
  }, [location.detected, requestLocation]);

  const nationalResources = [
    {
      name: '988 Suicide & Crisis Lifeline',
      contact: 'Call or Text 988',
      description: '24/7 crisis support, free, confidential',
      url: 'https://988lifeline.org',
    },
    {
      name: 'Crisis Text Line',
      contact: 'Text HELLO to 741741',
      description: 'Text-based crisis support, 24/7',
      url: 'https://crisistextline.org',
    },
    {
      name: 'Veterans Crisis Line',
      contact: 'Call 988 then press 1',
      description: 'Support for veterans and their families',
      url: 'https://veteranscrisisline.net',
    },
    {
      name: 'Trevor Project (LGBTQ+ Youth)',
      contact: 'Call 1-866-488-7386',
      description: 'Crisis support for LGBTQ+ young people',
      url: 'https://thetrevorproject.org',
    },
    {
      name: 'SAMHSA National Helpline',
      contact: 'Call 1-800-662-4357',
      description: 'Substance abuse and mental health support',
      url: 'https://samhsa.gov/find-help/national-helpline',
    },
  ];

  const internationalResources = [
    { country: 'Canada', contact: 'Talk Suicide: 1-833-456-4566', },
    { country: 'UK', contact: 'Samaritans: 116 123', },
    { country: 'Australia', contact: 'Lifeline: 13 11 14', },
    { country: 'International', contact: 'iasp.info/resources/Crisis_Centres', },
  ];

  return (
    <main className="min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Emergency Banner */}
        <div className="bg-red-900 border border-red-700 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <span className="text-4xl">🆘</span>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                In Immediate Danger?
              </h2>
              <p className="text-red-100 mb-4">
                If you or someone else is in immediate physical danger, call emergency services (911 in US) NOW.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="tel:988"
                  className="px-6 py-3 bg-white text-red-900 rounded-lg font-bold hover:bg-gray-100 inline-block"
                >
                  📞 Call 988
                </a>
                <a
                  href="sms:741741&body=HELLO"
                  className="px-6 py-3 bg-red-700 text-white rounded-lg font-bold hover:bg-red-600 inline-block"
                >
                  💬 Text 741741
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Location Banner */}
        {location.detected && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 mb-8">
            <div className="text-sm text-gray-400">
              📍 Resources for: {location.city}, {location.region}, {location.country}
            </div>
          </div>
        )}

        {/* National Resources */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-ryvynn-cyan mb-6">
            {location.countryCode === 'US' ? 'National Resources (US)' : 'US Crisis Resources'}
          </h2>
          
          <div className="space-y-4">
            {nationalResources.map((resource) => (
              <div
                key={resource.name}
                className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-ryvynn-cyan transition-colors"
              >
                <h3 className="text-xl font-bold text-white mb-2">{resource.name}</h3>
                <p className="text-ryvynn-cyan font-mono mb-2">{resource.contact}</p>
                <p className="text-gray-400 mb-3">{resource.description}</p>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-ryvynn-purple hover:underline"
                >
                  Visit Website →
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* International Resources */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-ryvynn-purple mb-6">
            International Crisis Lines
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {internationalResources.map((resource) => (
              <div
                key={resource.country}
                className="bg-gray-900/50 border border-gray-800 rounded-lg p-4"
              >
                <h3 className="font-bold text-white mb-1">{resource.country}</h3>
                <p className="text-sm text-gray-400">{resource.contact}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy Note */}
        <div className="bg-ryvynn-cyan/10 border border-ryvynn-cyan/30 rounded-lg p-6">
          <h3 className="font-bold text-ryvynn-cyan mb-2">🔐 Your Privacy</h3>
          <p className="text-sm text-gray-400">
            RYVYNN does not track which crisis resources you access. Your location is used only to show relevant local resources and is never stored on our servers.
          </p>
        </div>
      </div>
    </main>
  );
}
