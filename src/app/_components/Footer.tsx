
import React from "react";
import "./components.css";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { FaLinkedinIn } from "react-icons/fa6";
import Link from "next/link";

const Footer = () => {
  const quickLinks = [
    { label: "Topics", href: "/" },
    { label: "Doctors", href: "/" },
    { label: "About", href: "/" },
    { label: "Contact", href: "/" },
  ];

  const socialIcons = [
    { icon: <FaFacebookF />, label: "Facebook", href: "#" },
    { icon: <FaInstagram />, label: "Instagram", href: "#" },
    { icon: <FaLinkedinIn />, label: "LinkedIn", href: "#" },
  ];

  return (
    <footer className="footer-main pt-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-5 ">
          <div className="col-span-2">
            <p>
              At Medoh, we provide precise and reliable answers to all your
              questions about rotator cuff tears and injuries, delivered by
              healthcare professionals through easy-to-understand videos.
            </p>
            <div className="flex gap-3 items-center mt-3">
              {socialIcons.map((item: any, index: any) => (
                <Link
                  key={index}
                  href={item.href}
                  aria-label={item.label}
                  className="footer-icon"
                >
                  {item.icon}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h5 className="mb-4">Quick Links</h5>
            <ul className="list-unstyled flex flex-col gap-2">
              {quickLinks.map((link: any, index: any) => (
                <li key={index}>
                  <Link href={link.href} className="footer-links">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2">
            <h5 className="mb-4">Stay Connected</h5>
            <span className="footer-desc">
              Subscribe to our newsletter for the latest updates, mental health
              tips, and resources.
            </span>
            <div className="email-box mt-2">
              <input
                type="email"
                className="footer-input "
                placeholder="Type your email"
                aria-label="Email address"
              />
              <button className="orange-button">Subscribe</button>
            </div>
          </div>
        </div>
        <div className="bottom-footer">
          <hr className="mt-10 mb-4" />
          <span>© 2025 Medoh for Doctors. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
