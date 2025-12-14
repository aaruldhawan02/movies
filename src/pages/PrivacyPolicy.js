import React from 'react';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-policy">
      <div className="privacy-container">
        <h1>Privacy Policy for Onion - Movie Rankings</h1>
        
        <div className="effective-date">
          <strong>Effective Date:</strong> December 14, 2025
        </div>

        <section>
          <h2>Information We Collect</h2>
          <p>When you use Onion, we collect the following information:</p>
          <ul>
            <li><strong>Account Information:</strong> Email address, username, and authentication data when you create an account</li>
            <li><strong>Movie Rankings:</strong> Your personal movie rankings, ratings, and watch dates</li>
            <li><strong>Social Data:</strong> Friend connections, friend requests, and shared rankings</li>
            <li><strong>Usage Data:</strong> App interactions and preferences to improve your experience</li>
          </ul>
        </section>

        <section>
          <h2>How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Provide and maintain the movie ranking service</li>
            <li>Enable social features like friend connections and ranking sharing</li>
            <li>Calculate personalized movie ratings based on your rankings</li>
            <li>Send notifications about friend requests and app updates</li>
            <li>Improve app functionality and user experience</li>
          </ul>
        </section>

        <section>
          <h2>Data Storage and Security</h2>
          <p>Your data is stored securely using Firebase, Google's cloud platform:</p>
          <ul>
            <li>All data is encrypted in transit and at rest</li>
            <li>We use industry-standard security measures to protect your information</li>
            <li>Your movie rankings and personal data are private by default</li>
            <li>You control what information you share with friends</li>
          </ul>
        </section>

        <section>
          <h2>Data Sources</h2>
          <p>Movie information is sourced from:</p>
          <ul>
            <li><strong>The Movie Database (TMDB):</strong> Movie details, posters, ratings, and metadata</li>
            <li>All movie data displayed is publicly available information</li>
            <li>We do not modify or alter the movie information from these sources</li>
          </ul>
        </section>

        <section>
          <h2>Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul>
            <li><strong>Firebase (Google):</strong> Authentication, database, and cloud services</li>
            <li><strong>The Movie Database (TMDB):</strong> Movie information and images</li>
            <li><strong>Google Sign-In:</strong> Optional authentication method</li>
          </ul>
          <p>These services have their own privacy policies and data handling practices.</p>
        </section>

        <section>
          <h2>Data Sharing</h2>
          <p>We do not sell or rent your personal information. We only share data:</p>
          <ul>
            <li>With friends you explicitly connect with in the app</li>
            <li>When required by law or to protect our rights</li>
            <li>With service providers (Firebase) to operate the app</li>
          </ul>
        </section>

        <section>
          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access and download your data</li>
            <li>Delete your account and all associated data</li>
            <li>Control what information you share with friends</li>
            <li>Opt out of notifications</li>
            <li>Request corrections to your data</li>
          </ul>
        </section>

        <section>
          <h2>Children's Privacy</h2>
          <p>Onion is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will delete it immediately.</p>
        </section>

        <section>
          <h2>International Users</h2>
          <p>Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this privacy policy.</p>
        </section>

        <section>
          <h2>Changes to Privacy Policy</h2>
          <p>We may update this privacy policy from time to time. We will notify you of any material changes through the app or by email. Your continued use of Onion after changes constitutes acceptance of the updated policy.</p>
        </section>

        <div className="contact-section">
          <h2>Contact Information</h2>
          <p>For questions about this privacy policy, data requests, or to delete your account, please contact:</p>
          <p><strong>Email:</strong> aaruldhawan02@gmail.com</p>
          <p><strong>Response Time:</strong> We aim to respond within 48 hours</p>
        </div>

        <div className="last-updated">
          Last updated: December 14, 2024
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
