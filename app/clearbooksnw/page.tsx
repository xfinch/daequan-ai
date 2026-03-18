export default function ClearBooksNW() {
  return (
    <div dangerouslySetInnerHTML={{ __html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Clearbooks NW | Bookkeeping for IT & MSPs</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: #1a1a2e;
            background: #ffffff;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        header { padding: 20px 0; border-bottom: 1px solid #e5e7eb; }
        .logo { font-size: 24px; font-weight: 700; color: #0f4c81; text-decoration: none; }
        .logo span { color: #00a8e8; }
        .hero {
            padding: 80px 0 60px;
            background: linear-gradient(135deg, #0f4c81 0%, #1a5f9e 100%);
            color: white;
        }
        .hero h1 { font-size: 48px; font-weight: 700; line-height: 1.2; margin-bottom: 24px; }
        .hero h1 span { color: #00d4ff; }
        .hero-subtitle { font-size: 20px; opacity: 0.95; margin-bottom: 32px; max-width: 600px; }
        .hero-cta {
            display: inline-flex; align-items: center; gap: 8px;
            background: #00d4ff; color: #0f4c81;
            padding: 16px 32px; border-radius: 8px;
            text-decoration: none; font-weight: 600; font-size: 16px;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .hero-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0, 212, 255, 0.3); }
        .trust-bar { padding: 40px 0; background: #f8fafc; text-align: center; }
        .trust-bar p { color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; }
        .trust-stats { display: flex; justify-content: center; gap: 60px; flex-wrap: wrap; }
        .stat { text-align: center; }
        .stat-number { font-size: 36px; font-weight: 700; color: #0f4c81; }
        .stat-label { color: #64748b; font-size: 14px; }
        .problem-solution { padding: 80px 0; }
        .section-title { font-size: 36px; font-weight: 700; text-align: center; margin-bottom: 16px; }
        .section-subtitle { text-align: center; color: #64748b; font-size: 18px; margin-bottom: 60px; }
        .pain-points { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-bottom: 60px; }
        .pain-point { background: #fef2f2; border-left: 4px solid #ef4444; padding: 24px; border-radius: 8px; }
        .pain-point h3 { color: #991b1b; font-size: 16px; margin-bottom: 8px; }
        .pain-point p { color: #7f1d1d; font-size: 14px; }
        .solution-box { background: #f0fdf4; border: 2px solid #22c55e; padding: 40px; border-radius: 12px; text-align: center; }
        .solution-box h3 { color: #166534; font-size: 24px; margin-bottom: 16px; }
        .solution-box p { color: #15803d; font-size: 16px; max-width: 700px; margin: 0 auto; }
        .differentiators { padding: 80px 0; background: #f8fafc; }
        .diff-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 32px; margin-top: 60px; }
        .diff-card { background: white; padding: 32px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .diff-icon { width: 48px; height: 48px; background: #0f4c81; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 20px; }
        .diff-card h3 { font-size: 20px; margin-bottom: 12px; }
        .diff-card p { color: #64748b; font-size: 15px; }
        .services { padding: 80px 0; }
        .services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px; margin-top: 60px; }
        .service-card { background: white; border: 1px solid #e5e7eb; padding: 32px; border-radius: 12px; transition: box-shadow 0.2s; }
        .service-card:hover { box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08); }
        .service-card h3 { font-size: 18px; margin-bottom: 12px; color: #0f4c81; }
        .service-card p { color: #64748b; font-size: 14px; }
        .cta-section { padding: 80px 0; background: linear-gradient(135deg, #0f4c81 0%, #1a5f9e 100%); color: white; text-align: center; }
        .cta-section h2 { font-size: 36px; margin-bottom: 16px; }
        .cta-section p { font-size: 18px; opacity: 0.9; margin-bottom: 40px; }
        .form-container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2); }
        .form-group { margin-bottom: 20px; text-align: left; }
        .form-group label { display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 6px; }
        .form-group input, .form-group textarea { width: 100%; padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 16px; font-family: inherit; }
        .form-group input:focus, .form-group textarea:focus { outline: none; border-color: #0f4c81; box-shadow: 0 0 0 3px rgba(15, 76, 129, 0.1); }
        .form-group textarea { resize: vertical; min-height: 100px; }
        .submit-btn { width: 100%; background: #0f4c81; color: white; padding: 16px; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
        .submit-btn:hover { background: #1a5f9e; }
        footer { padding: 40px 0; background: #0f172a; color: #94a3b8; text-align: center; }
        footer p { font-size: 14px; }
        @media (max-width: 768px) {
            .hero h1 { font-size: 36px; }
            .section-title { font-size: 28px; }
            .trust-stats { gap: 30px; }
            .form-container { padding: 24px; }
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <a href="#" class="logo">Clearbooks <span>NW</span></a>
        </div>
    </header>

    <section class="hero">
        <div class="container">
            <h1>Bookkeeping Built for <span>IT & MSPs</span></h1>
            <p class="hero-subtitle">We don't just balance your books—we understand your technology. 40 years of combined expertise in bookkeeping and IT solutions.</p>
            <a href="#consultation" class="hero-cta">Schedule Free Consultation →</a>
        </div>
    </section>

    <section class="trust-bar">
        <div class="container">
            <p>Trusted Expertise</p>
            <div class="trust-stats">
                <div class="stat"><div class="stat-number">40+</div><div class="stat-label">Years Combined Experience</div></div>
                <div class="stat"><div class="stat-number">IT</div><div class="stat-label">Industry Specialists</div></div>
                <div class="stat"><div class="stat-number">MSP</div><div class="stat-label">Service Provider Focus</div></div>
            </div>
        </div>
    </section>

    <section class="problem-solution">
        <div class="container">
            <h2 class="section-title">Why Tech Companies Struggle</h2>
            <p class="section-subtitle">We know where IT businesses fail financially—because we've been in your world</p>
            <div class="pain-points">
                <div class="pain-point"><h3>⚠️ Reactive Bookkeeping</h3><p>Waiting until tax season to discover cash flow problems</p></div>
                <div class="pain-point"><h3>⚠️ Missed Tax Savings</h3><p>Not capturing R&D credits, equipment depreciation, and tech-specific deductions</p></div>
                <div class="pain-point"><h3>⚠️ Generic Advice</h3><p>Bookkeepers who don't understand recurring revenue, project billing, or SaaS metrics</p></div>
                <div class="pain-point"><h3>⚠️ Scalability Blindspots</h3><p>Not seeing the financial patterns that predict growth or trouble</p></div>
            </div>
            <div class="solution-box">
                <h3>✓ The Clearbooks NW Difference</h3>
                <p>We combine deep bookkeeping expertise with real-world IT and MSP sales experience. We understand your business models—from managed services contracts to project-based work—so we catch what generic bookkeepers miss.</p>
            </div>
        </div>
    </section>

    <section class="differentiators">
        <div class="container">
            <h2 class="section-title">Why Work With Us</h2>
            <p class="section-subtitle">Bookkeepers who actually speak your language</p>
            <div class="diff-grid">
                <div class="diff-card"><div class="diff-icon">💡</div><h3>We Know IT Financials</h3><p>We've sold for MSPs and worked in IT solutions. We understand MRR, project profitability, and how to structure your books for tech business success.</p></div>
                <div class="diff-card"><div class="diff-icon">🎯</div><h3>Proactive, Not Reactive</h3><p>Monthly financial reviews that spot trends before they become problems. We flag issues when they matter, not at year-end.</p></div>
                <div class="diff-card"><div class="diff-icon">💰</div><h3>Tax Optimization</h3><p>We know every deduction available to tech companies—from home office setups to software subscriptions to equipment depreciation.</p></div>
                <div class="diff-card"><div class="diff-icon">🌐</div><h3>Remote-First</h3><p>Work with us from anywhere. Cloud-based systems, secure document sharing, and video meetings. In-person available upon request in the Pacific Northwest.</p></div>
            </div>
        </div>
    </section>

    <section class="services">
        <div class="container">
            <h2 class="section-title">Services for Tech Companies</h2>
            <p class="section-subtitle">Focused on what IT and MSP businesses actually need</p>
            <div class="services-grid">
                <div class="service-card"><h3>📊 Monthly Bookkeeping</h3><p>Clean, accurate books delivered monthly with insights tailored to recurring revenue and project-based businesses.</p></div>
                <div class="service-card"><h3>🧹 Cleanup & Catch-Up</h3><p>Behind on your books? We'll get you current and establish systems that keep you there.</p></div>
                <div class="service-card"><h3>📈 Financial Reporting</h3><p>Custom dashboards and reports that show the metrics IT business owners actually care about.</p></div>
                <div class="service-card"><h3>💵 Payroll Services</h3><p>Accurate payroll processing for your team, including contractor 1099 management.</p></div>
                <div class="service-card"><h3>🎯 Tax Preparation</h3><p>Strategic tax planning and filing that maximizes deductions specific to tech businesses.</p></div>
                <div class="service-card"><h3>📋 Advisory Services</h3><p>Fractional CFO-level guidance to help you make smart financial decisions as you scale.</p></div>
            </div>
        </div>
    </section>

    <section class="cta-section" id="consultation">
        <div class="container">
            <h2>Ready to Get Your Books Clear?</h2>
            <p>Schedule a free consultation. We'll review your current situation and show you where you can improve.</p>
            <div class="form-container">
                <form id="leadForm" action="https://hooks.zapier.com/hooks/catch/YOUR_GHL_WEBHOOK_URL" method="POST">
                    <div class="form-group"><label for="name">Full Name</label><input type="text" id="name" name="name" required placeholder="Your name"></div>
                    <div class="form-group"><label for="company">Company Name</label><input type="text" id="company" name="company" required placeholder="Your company"></div>
                    <div class="form-group"><label for="email">Email Address</label><input type="email" id="email" name="email" required placeholder="you@company.com"></div>
                    <div class="form-group"><label for="phone">Phone Number</label><input type="tel" id="phone" name="phone" placeholder="(555) 123-4567"></div>
                    <div class="form-group"><label for="message">What bookkeeping challenges are you facing?</label><textarea id="message" name="message" placeholder="Tell us about your current situation..."></textarea></div>
                    <button type="submit" class="submit-btn">Request Free Consultation</button>
                </form>
            </div>
        </div>
    </section>

    <footer>
        <div class="container">
            <p>© 2026 Clearbooks NW. Bookkeeping services for IT companies and MSPs.</p>
            <p style="margin-top: 8px; font-size: 12px;">Remote-first • Pacific Northwest • Serving tech businesses nationwide</p>
        </div>
    </footer>

    <script>
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
            });
        });
        document.getElementById('leadForm').addEventListener('submit', function(e) {
            e.preventDefault();
            this.innerHTML = '<div style="text-align: center; padding: 40px;"><div style="font-size: 48px; margin-bottom: 20px;">✓</div><h3 style="color: #166534; margin-bottom: 12px;">Thank You!</h3><p style="color: #64748b;">We have received your request and will be in touch within 24 hours.</p></div>';
        });
    </script>
</body>
</html>
    `}} />
  );
}
