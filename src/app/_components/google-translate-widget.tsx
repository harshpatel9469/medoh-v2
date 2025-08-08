import { useEffect, useState, useRef } from 'react';
import { GlobeAltIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function GoogleTranslateWidget() {
  const [open, setOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialized) return;
    if (document.getElementById('google-translate-script')) return;
    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(script);

    window.googleTranslateElementInit = function () {
      new window.google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'es,fr,zh-CN,hi', // Spanish, French, Mandarin, Hindi
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
      }, 'google_translate_element');
      setInitialized(true);
    };
  }, [initialized]);

  // Close modal on click outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="fixed z-50 bottom-6 right-6 flex flex-col items-end gap-2">
      {/* Modal overlay for widget */}
      <div
        className={`fixed inset-0 bg-black/30 transition-opacity duration-200 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{zIndex: 60}}
        aria-hidden={!open}
      />
      <div
        ref={widgetRef}
        className={`fixed bottom-24 right-6 bg-white rounded-lg shadow-lg p-4 border border-gray-200 transition-all duration-200 ${open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'} flex flex-col items-end min-w-[200px]`}
        style={{zIndex: 70}}
      >
        <button
          onClick={() => setOpen(false)}
          className="mb-2 text-gray-400 hover:text-gray-700 focus:outline-none"
          aria-label="Close translate"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
        <div id="google_translate_element" />
      </div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-4 py-2 bg-primary-color text-white rounded-full shadow-lg hover:bg-primary-color-light focus:outline-none focus:ring-2 focus:ring-primary-color-dark transition-all"
        aria-label="Translate this page"
        style={{zIndex: 80}}
      >
        <GlobeAltIcon className="w-5 h-5" />
        <span className="font-semibold">Translate</span>
      </button>
    </div>
  );
} 