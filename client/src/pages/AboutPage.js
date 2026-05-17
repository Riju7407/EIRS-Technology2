import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaLightbulb, FaRocket, FaAward, FaShieldAlt, FaUsers, FaLock,
  FaChartLine, FaTimes, FaBriefcase, FaClock, FaCheckCircle,
  FaArrowRight, FaChevronRight, FaCamera, FaFingerprint, FaWifi,
  FaRobot, FaCogs, FaServer, FaPhone, FaEnvelope, FaMapMarkerAlt,
  FaHandshake, FaLeaf, FaStar, FaThumbsUp
} from 'react-icons/fa';
import { useCategoryFilter } from '../context/CategoryFilterContext';
import CategorySidebar from '../components/CategorySidebar';
import Footer from '../components/Footer';
import '../styles/AboutPage.css';

const STATS = [
  { num: '7+', label: 'Years Experience' },
  { num: '5000+', label: 'Happy Clients' },
  { num: '500+', label: 'Projects Done' },
  { num: '98%', label: 'Satisfaction Rate' },
];

const CORE_VALUES = [
  { icon: <FaShieldAlt />, title: 'Security First', desc: 'Your safety and data protection are our top priorities in everything we design and deliver.', color: '#667eea' },
  { icon: <FaLightbulb />, title: 'Innovation', desc: 'We constantly evolve with the latest technology to give you smarter, future-ready solutions.', color: '#43e97b' },
  { icon: <FaUsers />, title: 'Customer Focused', desc: 'Your satisfaction is the measure of our excellence — we build relationships, not just systems.', color: '#f093fb' },
  { icon: <FaAward />, title: 'Quality Excellence', desc: 'Premium solutions with meticulous attention to detail, backed by industry certifications.', color: '#f6d365' },
];

const TIMELINE = [
  { year: '2019', title: 'Founded', desc: 'EIRS Technology was established with a vision to transform the security and automation landscape.' },
  { year: '2023', title: 'First Milestone', desc: 'Completed 500+ installations across residential and commercial segments.' },
  { year: '2024', title: 'Expansion', desc: 'Expanded to enterprise clients and launched AMC & annual maintenance services.' },
  { year: '2025', title: 'Digital Leap', desc: 'Introduced IoT integration, cloud-based monitoring and AI-powered analytics.' },
  { year: '2026', title: 'Industry Leader', desc: 'Recognized as a trusted leader in integrated security and automation solutions.' },
];

const EXPERTISE = [
  { icon: <FaCamera />, label: 'CCTV & Surveillance', color: '#667eea' },
  { icon: <FaFingerprint />, label: 'Biometric Systems', color: '#764ba2' },
  { icon: <FaLock />, label: 'Access Control', color: '#f093fb' },
  { icon: <FaWifi />, label: 'Network Security', color: '#4facfe' },
  { icon: <FaRobot />, label: 'Smart Automation', color: '#43e97b' },
  { icon: <FaServer />, label: 'CCTV Components', color: '#fa709a' },
  { icon: <FaCogs />, label: 'System Integration', color: '#f6d365' },
  { icon: <FaBriefcase />, label: 'AMC & Support', color: '#a18cd1' },
];

const WHY_US = [
  { icon: <FaClock />, title: '7+ Years Experience', desc: 'Proven track record with thousands of successful deployments across industries.' },
  { icon: <FaHandshake />, title: 'Trusted Partner', desc: 'Long-term relationships built on transparency, reliability and accountability.' },
  { icon: <FaCheckCircle />, title: 'End-to-End Service', desc: 'From site survey to installation, maintenance and 24/7 after-sales support.' },
  { icon: <FaStar />, title: 'Certified Professionals', desc: 'Our engineers hold industry certifications and undergo regular training.' },
  { icon: <FaChartLine />, title: 'Scalable Solutions', desc: 'Designed to grow with your business — residential to enterprise-grade.' },
  { icon: <FaThumbsUp />, title: 'After-Sales Care', desc: 'Dedicated support team with quick response times and AMC packages.' },
];

const AboutPage = () => {
  const { isSidebarOpen, closeSidebar } = useCategoryFilter();

  return (
    <>
      {/* Sidebar */}
      <div className={`left-sidebar-filters ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Categories & Filters</h3>
          <button className="close-sidebar-btn" onClick={closeSidebar}><FaTimes /></button>
        </div>
        <CategorySidebar />
      </div>
      {isSidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}

      <main className="ab-page">

        {/*  Hero  */}
        <section className="ab-hero">
          <div className="ab-hero-inner">
            <span className="ab-hero-badge">About EIRS Technology</span>
            <h1>Securing What Matters Most — Since 2019</h1>
            <p>We are a leading provider of integrated security and automation solutions, trusted by thousands of homes and businesses across India for over 7 years.</p>
            <div className="ab-hero-actions">
              <Link to="/contact" className="ab-hero-btn ab-hero-btn--primary">Get in Touch <FaArrowRight /></Link>
              <Link to="/services" className="ab-hero-btn ab-hero-btn--outline">Our Services <FaChevronRight /></Link>
            </div>
          </div>
          <div className="ab-stats-bar">
            <div className="ab-container">
              <div className="ab-stats-grid">
                {STATS.map((s, i) => (
                  <div key={i} className="ab-stat">
                    <span className="ab-stat-num">{s.num}</span>
                    <span className="ab-stat-label">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/*  Who We Are  */}
        <section className="ab-story-section">
          <div className="ab-container">
            <div className="ab-story-grid">
              <div className="ab-story-text">
                <span className="ab-section-badge">Our Story</span>
                <h2>Who We Are</h2>
                <p>EIRS Technology is a premier provider of security and automation solutions, founded with the mission to protect people, property and data using cutting-edge technology.</p>
                <p>With over <strong>7 years of hands-on experience</strong>, we have built a comprehensive ecosystem of CCTV, biometric, intercom, fire alarm, and IoT-based systems — all backed by a team of certified professionals.</p>
                <div className="ab-story-pills">
                  <span className="ab-pill"> Residential & Commercial</span>
                  <span className="ab-pill"> Pan-India Coverage</span>
                  <span className="ab-pill"> End-to-End Security</span>
                </div>
              </div>
              <div className="ab-mission-vision">
                <div className="ab-mv-card ab-mv-card--mission">
                  <div className="ab-mv-icon"><FaRocket /></div>
                  <h3>Our Mission</h3>
                  <p>To empower homes and businesses with innovative security solutions that protect assets, enable growth and provide complete peace of mind.</p>
                </div>
                <div className="ab-mv-card ab-mv-card--vision">
                  <div className="ab-mv-icon"><FaLeaf /></div>
                  <h3>Our Vision</h3>
                  <p>To be the most trusted and innovative security partner — recognized for excellence, reliability and measurable client success.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/*  Core Values  */}
        <section className="ab-values-section">
          <div className="ab-container">
            <div className="ab-section-head">
              <span className="ab-section-badge">What We Stand For</span>
              <h2>Our Core Values</h2>
              <p>The principles that guide every decision, installation and client interaction we make.</p>
            </div>
            <div className="ab-values-grid">
              {CORE_VALUES.map((v, i) => (
                <div key={i} className="ab-value-card">
                  <div className="ab-value-icon" style={{ background: `${v.color}18`, color: v.color }}>{v.icon}</div>
                  <h3>{v.title}</h3>
                  <p>{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/*  Journey / Timeline  */}
        <section className="ab-timeline-section">
          <div className="ab-container">
            <div className="ab-section-head ab-section-head--light">
              <span className="ab-section-badge ab-section-badge--light">Our Journey</span>
              <h2>Milestones That Shaped Us</h2>
              <p>From a small startup to an industry leader — here is how we grew.</p>
            </div>
            <div className="ab-timeline">
              {TIMELINE.map((t, i) => (
                <div key={i} className={`ab-tl-item ${i % 2 === 0 ? 'ab-tl-item--left' : 'ab-tl-item--right'}`}>
                  <div className="ab-tl-dot" />
                  <div className="ab-tl-card">
                    <span className="ab-tl-year">{t.year}</span>
                    <h3>{t.title}</h3>
                    <p>{t.desc}</p>
                  </div>
                </div>
              ))}
              <div className="ab-tl-line" />
            </div>
          </div>
        </section>

        {/*  Expertise  */}
        <section className="ab-expertise-section">
          <div className="ab-container">
            <div className="ab-section-head">
              <span className="ab-section-badge">What We Do</span>
              <h2>Areas of Expertise</h2>
              <p>Comprehensive coverage across every segment of modern security and automation.</p>
            </div>
            <div className="ab-expertise-grid">
              {EXPERTISE.map((e, i) => (
                <div key={i} className="ab-expertise-card">
                  <div className="ab-expertise-icon" style={{ background: `${e.color}18`, color: e.color }}>{e.icon}</div>
                  <span>{e.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/*  Why Choose Us  */}
        <section className="ab-why-section">
          <div className="ab-container">
            <div className="ab-section-head ab-section-head--light">
              <h2>Why Choose EIRS Technology</h2>
              <p>What sets us apart from the rest — consistency, expertise and genuine care.</p>
            </div>
            <div className="ab-why-grid">
              {WHY_US.map((w, i) => (
                <div key={i} className="ab-why-card">
                  <div className="ab-why-icon">{w.icon}</div>
                  <h3>{w.title}</h3>
                  <p>{w.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/*  CTA Banner  */}
        <section className="ab-cta-section">
          <div className="ab-container">
            <div className="ab-cta-inner">
              <div className="ab-cta-text">
                <h2>Ready to Secure Your Future?</h2>
                <p>Let our certified experts design a custom security plan tailored to your needs — completely free of charge.</p>
              </div>
              <div className="ab-cta-actions">
                <Link to="/contact" className="ab-cta-btn ab-cta-btn--primary">Schedule Free Consultation <FaArrowRight /></Link>
                <Link to="/services" className="ab-cta-btn ab-cta-btn--outline">Explore Services</Link>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
};

export default AboutPage;
