"use client";

import Link from "next/link";
import { getLocalStorage, setLocalStorage } from "@/utils/storage-helper";
import { useState, useEffect } from "react";

export default function CookieBanner() {
  const [analyticsCookieConsent, setAnalyticsCookieConsent] = useState<boolean | null>(null);
  const [storedCookie, setStoredCookie] = useState<null | object> (null);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    const storedCookieConsent = getLocalStorage("consentMode", null);
    setStoredCookie(storedCookieConsent);
  }, []);

  useEffect(() => {
    if (storedCookie) {
        setShowBanner(false);
    }
  }, [storedCookie]);

  useEffect(() => {

    if (analyticsCookieConsent === null && storedCookie === null) {
      return;
    }
    
    const newValue = analyticsCookieConsent ? "granted" : "denied";

    const cookieData = {
      analytics_storage: newValue,
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    }

    window.gtag("consent", "update", cookieData);

    setLocalStorage("consentMode", cookieData);
    setStoredCookie(cookieData);
  }, [analyticsCookieConsent]);

  return (
    <div
      className={`my-10 mx-auto max-w-max md:max-w-screen-sm
                  fixed bottom-0 left-0 right-0 
                  flex px-3 md:px-4 py-3 justify-between items-center flex-col sm:flex-row gap-4  
                  bg-white rounded-lg shadow z-50
                  ${storedCookie !== null ? "hidden" : "flex"}`}
    >
      <div className="text-center">
          <p>
            We use <span className="font-bold">cookies</span> on
            our site.
          </p>
      </div>

      <div className="flex gap-2">
        <p
          className="px-5 py-2 cursor-pointer hover:text-primary-color"
          onClick={() => setAnalyticsCookieConsent(false)}
        >
          Decline
        </p>
        <button
          className="bg-primary-color px-5 py-2 rounded-lg text-white hover:bg-primary-color-light"
          onClick={() => setAnalyticsCookieConsent(true)}
        >
          Allow Cookies
        </button>
      </div>
    </div>
  );
}
