import React from 'react';
import './Support.css';

const Support = () => {
  return (
    <div className="support-page">
      <div className="support-container">
        <h1>OnMo - Movie Rankings Support</h1>
        
        <div className="support-intro">
          <p>Need help with OnMo? We're here to assist you with any questions or issues you may have.</p>
        </div>

        <section className="support-section">
          <h2>📧 Contact Support</h2>
          <div className="contact-info">
            <p><strong>Email:</strong> <a href="mailto:aaruldhawan02@gmail.com">aaruldhawan02@gmail.com</a></p>
            <p><strong>Response Time:</strong> We typically respond within 24-48 hours</p>
            <p><strong>Support Hours:</strong> Monday - Friday, 9 AM - 6 PM PST</p>
          </div>
        </section>

        <section className="support-section">
          <h2>❓ Frequently Asked Questions</h2>
          
          <div className="faq-item">
            <h3>How do I rank movies?</h3>
            <p>Add movies from the Browse tab, then compare them head-to-head in the ranking system. Choose which movie you prefer, and OnMo will find the perfect spot in your rankings.</p>
          </div>

          <div className="faq-item">
            <h3>Can I use the app without signing in?</h3>
            <p>Yes! You can browse movies, create rankings, and use all features as a guest. Your data will be saved locally. Sign in to sync across devices and connect with friends.</p>
          </div>

          <div className="faq-item">
            <h3>How do I add friends?</h3>
            <p>Sign in, go to the Friends tab, search for friends by email or username, and send friend requests. Once accepted, you can view each other's movie rankings.</p>
          </div>

          <div className="faq-item">
            <h3>How are personal ratings calculated?</h3>
            <p>Your personal ratings are automatically generated based on where movies rank in your list. Higher-ranked movies get higher ratings, with the system using a smart distribution curve.</p>
          </div>

          <div className="faq-item">
            <h3>Can I edit my watch dates?</h3>
            <p>Yes! Tap on any ranked movie to view details, then tap "Edit" next to the watch date to change when you watched it.</p>
          </div>

          <div className="faq-item">
            <h3>How do I delete my account?</h3>
            <p>Contact us at aaruldhawan02@gmail.com with your account email, and we'll permanently delete your account and all associated data within 48 hours.</p>
          </div>
        </section>

        <section className="support-section">
          <h2>🐛 Report a Bug</h2>
          <p>Found a bug or experiencing issues? Please email us with:</p>
          <ul>
            <li>Description of the problem</li>
            <li>Steps to reproduce the issue</li>
            <li>Your device model and iOS version</li>
            <li>Screenshots (if applicable)</li>
          </ul>
          <p><strong>Email:</strong> <a href="mailto:aaruldhawan02@gmail.com?subject=OnMo Bug Report">aaruldhawan02@gmail.com</a></p>
        </section>

        <section className="support-section">
          <h2>💡 Feature Requests</h2>
          <p>Have an idea to make OnMo better? We'd love to hear it!</p>
          <p><strong>Email:</strong> <a href="mailto:aaruldhawan02@gmail.com?subject=OnMo Feature Request">aaruldhawan02@gmail.com</a></p>
        </section>

        <section className="support-section">
          <h2>🔒 Privacy & Data</h2>
          <p>Questions about your data, privacy, or account?</p>
          <ul>
            <li><a href="/privacy-policy">Privacy Policy</a></li>
            <li>Data deletion requests: <a href="mailto:aaruldhawan02@gmail.com?subject=Data Deletion Request">aaruldhawan02@gmail.com</a></li>
            <li>Account issues: <a href="mailto:aaruldhawan02@gmail.com?subject=Account Support">aaruldhawan02@gmail.com</a></li>
          </ul>
        </section>

        <section className="support-section">
          <h2>📱 Technical Requirements</h2>
          <ul>
            <li><strong>iOS Version:</strong> iOS 15.0 or later</li>
            <li><strong>Internet:</strong> Required for movie data and social features</li>
            <li><strong>Storage:</strong> Minimal storage required for local rankings</li>
          </ul>
        </section>

        <div className="support-footer">
          <p>Still need help? Don't hesitate to reach out!</p>
          <a href="mailto:aaruldhawan02@gmail.com" className="support-button">
            Contact Support
          </a>
        </div>

        <div className="last-updated">
          Last updated: December 14, 2025
        </div>
      </div>
    </div>
  );
};

export default Support;
