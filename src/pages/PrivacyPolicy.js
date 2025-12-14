import React from 'react';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-policy">
      <div className="privacy-container">
        <h1>Privacy Policy for Onion's Movie Ratings</h1>
        
        <div className="effective-date">
          <strong>Effective Date:</strong> December 14, 2025
        </div>

        <section>
          <h2>Information We Collect</h2>
          <p>This app does not collect, store, or transmit any personal information from users.</p>
        </section>

        <section>
          <h2>Data Sources</h2>
          <p>Our app displays movie information from the following sources:</p>
          <ul>
            <li>Movie ratings are sourced from Rotten Tomatoes</li>
            <li>Movie posters are sourced from The Movie Database (TMDB)</li>
            <li>All movie data displayed is publicly available information</li>
          </ul>
        </section>

        <section>
          <h2>Data Storage</h2>
          <p>All movie data is stored locally on your device. No personal data is collected or transmitted to external servers.</p>
        </section>

        <section>
          <h2>Third-Party Services</h2>
          <p>This app displays content sourced from:</p>
          <ul>
            <li>Rotten Tomatoes (for movie ratings)</li>
            <li>The Movie Database (TMDB) (for movie posters and information)</li>
          </ul>
          <p>We do not share any user data with these services as we do not collect user data.</p>
        </section>

        <section>
          <h2>Analytics and Tracking</h2>
          <p>This app does not use any analytics, tracking, or advertising services.</p>
        </section>

        <section>
          <h2>Children's Privacy</h2>
          <p>This app does not collect any information from users of any age, including children under 13.</p>
        </section>

        <section>
          <h2>Changes to Privacy Policy</h2>
          <p>We may update this privacy policy from time to time. Users will be notified of any changes through app updates. Continued use of the app after changes constitutes acceptance of the updated policy.</p>
        </section>

        <div className="contact-section">
          <h2>Contact Information</h2>
          <p>For questions about this privacy policy or the app, please contact:</p>
          <p><strong>Email:</strong> aaruldhawan02@gmail.com</p>
        </div>

        <div className="last-updated">
          Last updated: December 14, 2024
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
