export default function ClearBooksNW() {
  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        .cbnw-page {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          line-height: 1.6;
          color: #1a1a2e;
          background: #ffffff;
        }
        
        .cbnw-page * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        .cbnw-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }
        
        .cbnw-header {
          padding: 20px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .cbnw-logo {
          font-size: 24px;
          font-weight: 700;
          color: #0f4c81;
          text-decoration: none;
        }
        
        .cbnw-logo span {
          color: #00a8e8;
        }
        
        .cbnw-hero {
          padding: 80px 0 60px;
          background: linear-gradient(135deg, #0f4c81 0%, #1a5f9e 100%);
          color: white;
        }
        
        .cbnw-hero h1 {
          font-size: 48px;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 24px;
        }
        
        .cbnw-hero h1 span {
          color: #00d4ff;
        }
        
        .cbnw-hero-subtitle {
          font-size: 20px;
          opacity: 0.95;
          margin-bottom: 32px;
          max-width: 600px;
        }
        
        .cbnw-hero-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #00d4ff;
          color: #0f4c81;
          padding: 16px 32px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 16px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .cbnw-hero-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 212, 255, 0.3);
        }
        
        .cbnw-trust-bar {
          padding: 40px 0;
          background: #f8fafc;
          text-align: center;
        }
        
        .cbnw-trust-bar p {
          color: #64748b;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 20px;
        }
        
        .cbnw-trust-stats {
          display: flex;
          justify-content: center;
          gap: 60px;
          flex-wrap: wrap;
        }
        
        .cbnw-stat {
          text-align: center;
        }
        
        .cbnw-stat-number {
          font-size: 36px;
          font-weight: 700;
          color: #0f4c81;
        }
        
        .cbnw-stat-label {
          color: #64748b;
          font-size: 14px;
        }
        
        .cbnw-problem-solution {
          padding: 80px 0;
        }
        
        .cbnw-section-title {
          font-size: 36px;
          font-weight: 700;
          text-align: center;
          margin-bottom: 16px;
        }
        
        .cbnw-section-subtitle {
          text-align: center;
          color: #64748b;
          font-size: 18px;
          margin-bottom: 60px;
        }
        
        .cbnw-pain-points {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
          margin-bottom: 60px;
        }
        
        .cbnw-pain-point {
          background: #fef2f2;
          border-left: 4px solid #ef4444;
          padding: 24px;
          border-radius: 8px;
        }
        
        .cbnw-pain-point h3 {
          color: #991b1b;
          font-size: 16px;
          margin-bottom: 8px;
        }
        
        .cbnw-pain-point p {
          color: #7f1d1d;
          font-size: 14px;
        }
        
        .cbnw-solution-box {
          background: #f0fdf4;
          border: 2px solid #22c55e;
          padding: 40px;
          border-radius: 12px;
          text-align: center;
        }
        
        .cbnw-solution-box h3 {
          color: #166534;
          font-size: 24px;
          margin-bottom: 16px;
        }
        
        .cbnw-solution-box p {
          color: #15803d;
          font-size: 16px;
          max-width: 700px;
          margin: 0 auto;
        }
        
        .cbnw-differentiators {
          padding: 80px 0;
          background: #f8fafc;
        }
        
        .cbnw-diff-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 32px;
          margin-top: 60px;
        }
        
        .cbnw-diff-card {
          background: white;
          padding: 32px;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        
        .cbnw-diff-icon {
          width: 48px;
          height: 48px;
          background: #0f4c81;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin-bottom: 20px;
        }
        
        .cbnw-diff-card h3 {
          font-size: 20px;
          margin-bottom: 12px;
        }
        
        .cbnw-diff-card p {
          color: #64748b;
          font-size: 15px;
        }
        
        .cbnw-services {
          padding: 80px 0;
        }
        
        .cbnw-services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
          margin-top: 60px;
        }
        
        .cbnw-service-card {
          background: white;
          border: 1px solid #e5e7eb;
          padding: 32px;
          border-radius: 12px;
          transition: box-shadow 0.2s;
        }
        
        .cbnw-service-card:hover {
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
        }
        
        .cbnw-service-card h3 {
          font-size: 18px;
          margin-bottom: 12px;
          color: #0f4c81;
        }
        
        .cbnw-service-card p {
          color: #64748b;
          font-size: 14px;
        }
        
        .cbnw-cta-section {
          padding: 80px 0;
          background: linear-gradient(135deg, #0f4c81 0%, #1a5f9e 100%);
          color: white;
          text-align: center;
        }
        
        .cbnw-cta-section h2 {
          font-size: 36px;
          margin-bottom: 16px;
        }
        
        .cbnw-cta-section > .cbnw-container > p {
          font-size: 18px;
          opacity: 0.9;
          margin-bottom: 40px;
        }
        
        .cbnw-form-container {
          max-width: 500px;
          margin: 0 auto;
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
        }
        
        .cbnw-form-group {
          margin-bottom: 20px;
          text-align: left;
        }
        
        .cbnw-form-group label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 6px;
        }
        
        .cbnw-form-group input,
        .cbnw-form-group textarea {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 16px;
          font-family: inherit;
          color: #1a1a2e;
        }
        
        .cbnw-form-group input:focus,
        .cbnw-form-group textarea:focus {
          outline: none;
          border-color: #0f4c81;
          box-shadow: 0 0 0 3px rgba(15, 76, 129, 0.1);
        }
        
        .cbnw-form-group textarea {
          resize: vertical;
          min-height: 100px;
        }
        
        .cbnw-submit-btn {
          width: 100%;
          background: #0f4c81;
          color: white;
          padding: 16px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .cbnw-submit-btn:hover {
          background: #1a5f9e;
        }
        
        .cbnw-footer {
          padding: 40px 0;
          background: #0f172a;
          color: #94a3b8;
          text-align: center;
        }
        
        .cbnw-footer p {
          font-size: 14px;
        }
        
        @media (max-width: 768px) {
          .cbnw-hero h1 {
            font-size: 36px;
          }
          
          .cbnw-section-title {
            font-size: 28px;
          }
          
          .cbnw-trust-stats {
            gap: 30px;
          }
          
          .cbnw-form-container {
            padding: 24px;
          }
        }
      `}</style>
      
      <div className="cbnw-page">
        {/* Header */}
        <header className="cbnw-header">
          <div className="cbnw-container">
            <a href="#" className="cbnw-logo">Clearbooks <span>NW</span></a>
          </div>
        </header>

        {/* Hero */}
        <section className="cbnw-hero">
          <div className="cbnw-container">
            <h1>Bookkeeping Built for <span>IT & MSPs</span></h1>
            <p className="cbnw-hero-subtitle">We don&apos;t just balance your books—we understand your technology. 40 years of combined expertise in bookkeeping and IT solutions.</p>
            <a href="#consultation" className="cbnw-hero-cta">Schedule Free Consultation →</a>
          </div>
        </section>

        {/* Trust Bar */}
        <section className="cbnw-trust-bar">
          <div className="cbnw-container">
            <p>Trusted Expertise</p>
            <div className="cbnw-trust-stats">
              <div className="cbnw-stat">
                <div className="cbnw-stat-number">40+</div>
                <div className="cbnw-stat-label">Years Combined Experience</div>
              </div>
              <div className="cbnw-stat">
                <div className="cbnw-stat-number">IT</div>
                <div className="cbnw-stat-label">Industry Specialists</div>
              </div>
              <div className="cbnw-stat">
                <div className="cbnw-stat-number">MSP</div>
                <div className="cbnw-stat-label">Service Provider Focus</div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem/Solution */}
        <section className="cbnw-problem-solution">
          <div className="cbnw-container">
            <h2 className="cbnw-section-title">Why Tech Companies Struggle</h2>
            <p className="cbnw-section-subtitle">We know where IT businesses fail financially—because we&apos;ve been in your world</p>
            
            <div className="cbnw-pain-points">
              <div className="cbnw-pain-point">
                <h3>⚠️ Reactive Bookkeeping</h3>
                <p>Waiting until tax season to discover cash flow problems</p>
              </div>
              <div className="cbnw-pain-point">
                <h3>⚠️ Missed Tax Savings</h3>
                <p>Not capturing R&amp;D credits, equipment depreciation, and tech-specific deductions</p>
              </div>
              <div className="cbnw-pain-point">
                <h3>⚠️ Generic Advice</h3>
                <p>Bookkeepers who don&apos;t understand recurring revenue, project billing, or SaaS metrics</p>
              </div>
              <div className="cbnw-pain-point">
                <h3>⚠️ Scalability Blindspots</h3>
                <p>Not seeing the financial patterns that predict growth or trouble</p>
              </div>
            </div>
            
            <div className="cbnw-solution-box">
              <h3>✓ The Clearbooks NW Difference</h3>
              <p>We combine deep bookkeeping expertise with real-world IT and MSP sales experience. We understand your business models—from managed services contracts to project-based work—so we catch what generic bookkeepers miss.</p>
            </div>
          </div>
        </section>

        {/* Differentiators */}
        <section className="cbnw-differentiators">
          <div className="cbnw-container">
            <h2 className="cbnw-section-title">Why Work With Us</h2>
            <p className="cbnw-section-subtitle">Bookkeepers who actually speak your language</p>
            
            <div className="cbnw-diff-grid">
              <div className="cbnw-diff-card">
                <div className="cbnw-diff-icon">💡</div>
                <h3>We Know IT Financials</h3>
                <p>We&apos;ve sold for MSPs and worked in IT solutions. We understand MRR, project profitability, and how to structure your books for tech business success.</p>
              </div>
              <div className="cbnw-diff-card">
                <div className="cbnw-diff-icon">🎯</div>
                <h3>Proactive, Not Reactive</h3>
                <p>Monthly financial reviews that spot trends before they become problems. We flag issues when they matter, not at year-end.</p>
              </div>
              <div className="cbnw-diff-card">
                <div className="cbnw-diff-icon">💰</div>
                <h3>Tax Optimization</h3>
                <p>We know every deduction available to tech companies—from home office setups to software subscriptions to equipment depreciation.</p>
              </div>
              <div className="cbnw-diff-card">
                <div className="cbnw-diff-icon">🌐</div>
                <h3>Remote-First</h3>
                <p>Work with us from anywhere. Cloud-based systems, secure document sharing, and video meetings. In-person available upon request in the Pacific Northwest.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="cbnw-services">
          <div className="cbnw-container">
            <h2 className="cbnw-section-title">Services for Tech Companies</h2>
            <p className="cbnw-section-subtitle">Focused on what IT and MSP businesses actually need</p>
            
            <div className="cbnw-services-grid">
              <div className="cbnw-service-card">
                <h3>📊 Monthly Bookkeeping</h3>
                <p>Clean, accurate books delivered monthly with insights tailored to recurring revenue and project-based businesses.</p>
              </div>
              <div className="cbnw-service-card">
                <h3>🧹 Cleanup &amp; Catch-Up</h3>
                <p>Behind on your books? We&apos;ll get you current and establish systems that keep you there.</p>
              </div>
              <div className="cbnw-service-card">
                <h3>📈 Financial Reporting</h3>
                <p>Custom dashboards and reports that show the metrics IT business owners actually care about.</p>
              </div>
              <div className="cbnw-service-card">
                <h3>💵 Payroll Services</h3>
                <p>Accurate payroll processing for your team, including contractor 1099 management.</p>
              </div>
              <div className="cbnw-service-card">
                <h3>🎯 Tax Preparation</h3>
                <p>Strategic tax planning and filing that maximizes deductions specific to tech businesses.</p>
              </div>
              <div className="cbnw-service-card">
                <h3>📋 Advisory Services</h3>
                <p>Fractional CFO-level guidance to help you make smart financial decisions as you scale.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA / Form */}
        <section className="cbnw-cta-section" id="consultation">
          <div className="cbnw-container">
            <h2>Ready to Get Your Books Clear?</h2>
            <p>Schedule a free consultation. We&apos;ll review your current situation and show you where you can improve.</p>
            
            <div className="cbnw-form-container">
              <form id="leadForm">
                <div className="cbnw-form-group">
                  <label htmlFor="name">Full Name</label>
                  <input type="text" id="name" name="name" required placeholder="Your name" />
                </div>
                <div className="cbnw-form-group">
                  <label htmlFor="company">Company Name</label>
                  <input type="text" id="company" name="company" required placeholder="Your company" />
                </div>
                <div className="cbnw-form-group">
                  <label htmlFor="email">Email Address</label>
                  <input type="email" id="email" name="email" required placeholder="you@company.com" />
                </div>
                <div className="cbnw-form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input type="tel" id="phone" name="phone" placeholder="(555) 123-4567" />
                </div>
                <div className="cbnw-form-group">
                  <label htmlFor="message">What bookkeeping challenges are you facing?</label>
                  <textarea id="message" name="message" placeholder="Tell us about your current situation..."></textarea>
                </div>
                <button type="submit" className="cbnw-submit-btn">Request Free Consultation</button>
              </form>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="cbnw-footer">
          <div className="cbnw-container">
            <p>© 2026 Clearbooks NW. Bookkeeping services for IT companies and MSPs.</p>
            <p style={{marginTop: '8px', fontSize: '12px'}}>Remote-first • Pacific Northwest • Serving tech businesses nationwide</p>
          </div>
        </footer>
      </div>
    </>
  );
}
