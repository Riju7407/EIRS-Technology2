import React from 'react';
import { Link } from 'react-router-dom';
import { FaLightbulb, FaRocket, FaAward, FaShieldAlt, FaUsers, FaLock, FaChartLine } from 'react-icons/fa';
import '../styles/AboutPage.css';

const AboutPage = () => {
  const coreValues = [
    {
      icon: FaShieldAlt,
      title: 'Security First',
      description: 'Your safety and data protection are our top priorities in everything we do.'
    },
    {
      icon: FaLightbulb,
      title: 'Innovation',
      description: 'We constantly evolve with latest technology to serve you better.'
    },
    {
      icon: FaUsers,
      title: 'Customer Focused',
      description: 'Your satisfaction and success is the measure of our excellence.'
    },
    {
      icon: FaAward,
      title: 'Quality Excellence',
      description: 'We deliver premium solutions with meticulous attention to detail.'
    }
  ];

  const achievements = [
    { number: '15+', label: 'Years of Experience', icon: '🏆' },
    { number: '5000+', label: 'Satisfied Clients', icon: '😊' },
    { number: '25000+', label: 'Projects Completed', icon: '✅' },
    { number: '98%', label: 'Client Satisfaction', icon: '⭐' }
  ];

  const timeline = [
    {
      year: '2009',
      title: 'Company Founded',
      description: 'Started with a vision to revolutionize the security and automation industry.'
    },
    {
      year: '2015',
      title: 'Expansion Phase',
      description: 'Expanded services to enterprise clients and introduced IoT solutions.'
    },
    {
      year: '2020',
      title: 'Digital Innovation',
      description: 'Launched AI-powered analytics and cloud-based monitoring systems.'
    },
    {
      year: '2024',
      title: 'Industry Leadership',
      description: 'Recognized as a trusted leader in integrated security solutions.'
    }
  ];

  const services = [
    { title: 'CCTV & Surveillance', emoji: '📹' },
    { title: 'IoT Solutions', emoji: '🌐' },
    { title: 'Biometric Systems', emoji: '🔐' },
    { title: 'Smart Automation', emoji: '🤖' },
    { title: 'Network Security', emoji: '🛡️' },
    { title: 'System Integration', emoji: '⚙️' }
  ];

  const whyChooseUs = [
    {
      icon: FaLock,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with 99.9% uptime guarantee'
    },
    {
      icon: FaChartLine,
      title: 'Scalable Solutions',
      description: 'Grow your business with solutions that scale with you'
    },
    {
      icon: FaAward,
      title: 'Certified Experts',
      description: 'Team of certified professionals with industry expertise'
    },
    {
      icon: FaRocket,
      title: 'Fast Deployment',
      description: 'Quick implementation without disrupting your operations'
    }
  ];

  return (
    <main className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="hero-content">
          <h1>About EIRS Technology</h1>
          <p>Transforming Security into Smart Solutions</p>
          <div className="hero-cta">
            <Link to="/contact" className="btn btn-primary">Get in Touch</Link>
          </div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="company-overview">
        <div className="container">
          <h2>Who We Are</h2>
          <p className="overview-text">
            EIRS Technology is a leading provider of integrated security and automation solutions for businesses and individuals. With over 15 years of proven expertise, we deliver cutting-edge security systems tailored to meet unique challenges and opportunities in today's digital world.
          </p>
          <div className="overview-grid">
            <div className="overview-card">
              <h3>Our Mission</h3>
              <p>To empower businesses with innovative security solutions that protect assets, enable growth, and provide peace of mind.</p>
            </div>
            <div className="overview-card">
              <h3>Our Vision</h3>
              <p>To be the most trusted and innovative security partner, recognized for excellence, reliability, and customer success.</p>
            </div>
            <div className="overview-card">
              <h3>Our Promise</h3>
              <p>Delivering world-class solutions backed by expert support, continuous innovation, and unwavering commitment to your success.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="core-values">
        <div className="container">
          <h2>Our Core Values</h2>
          <div className="values-grid">
            {coreValues.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div key={index} className="value-card">
                  <div className="value-icon">
                    <IconComponent size={45} />
                  </div>
                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="achievements">
        <div className="container">
          <h2>Our Impact</h2>
          <div className="achievements-grid">
            {achievements.map((item, index) => (
              <div key={index} className="achievement-item">
                <div className="achievement-emoji">{item.icon}</div>
                <h3>{item.number}</h3>
                <p>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="timeline-section">
        <div className="container">
          <h2>Our Journey</h2>
          <div className="timeline-grid">
            {timeline.map((item, index) => (
              <div key={index} className="timeline-card">
                <div className="timeline-year">{item.year}</div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="services-overview">
        <div className="container">
          <h2>What We Offer</h2>
          <p className="section-subtitle">Comprehensive security and automation solutions</p>
          <div className="services-grid">
            {services.map((service, index) => (
              <div key={index} className="service-card">
                <div className="service-emoji">{service.emoji}</div>
                <h3>{service.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-choose-us">
        <div className="container">
          <h2>Why Choose EIRS?</h2>
          <div className="why-grid">
            {whyChooseUs.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div key={index} className="why-card">
                  <div className="why-icon">
                    <IconComponent size={40} />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <div className="container">
          <h2>Ready to Secure Your Future?</h2>
          <p>Let our experts create a custom solution for your security needs</p>
          <div className="cta-buttons">
            <Link to="/contact" className="btn btn-primary btn-large">Schedule Consultation</Link>
            <Link to="/services" className="btn btn-secondary btn-large">Explore Services</Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;
