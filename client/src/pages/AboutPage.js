import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaUsers, FaAward, FaGlobe } from 'react-icons/fa';
import '../styles/AboutPage.css';

const AboutPage = () => {
  const values = [
    {
      icon: FaAward,
      title: 'Excellence',
      description: 'We deliver premium quality solutions with attention to detail'
    },
    {
      icon: FaUsers,
      title: 'Customer Focus',
      description: 'Your satisfaction is our top priority and we go the extra mile'
    },
    {
      icon: FaGlobe,
      title: 'Innovation',
      description: 'Constantly evolving with latest technology and best practices'
    }
  ];

  const achievements = [
    { number: '500+', label: 'Satisfied Clients' },
    { number: '1000+', label: 'Projects Completed' },
    { number: '15+', label: 'Years Experience' },
    { number: '50+', label: 'Expert Team Members' }
  ];

  return (
    <main className="about-page">
      {/* Header */}
      <section className="about-header">
        <div className="container">
          <h1>About EIRS Technology</h1>
          <p>Leading Provider of Security & Automation Solutions</p>
        </div>
      </section>

      {/* Company Overview */}
      <section className="company-overview">
        <div className="container">
          <div className="overview-grid">
            <div className="overview-content">
              <h2>Who We Are</h2>
              <p>
                EIRS Technology is a leading provider of integrated security and automation solutions for homes and businesses. 
                With over 15 years of experience, we've established ourselves as a trusted partner for comprehensive security needs.
              </p>
              <p>
                We specialize in CCTV systems, IoT solutions, biometric devices, and smart automation systems that provide peace of mind 
                and operational efficiency.
              </p>
              <Link to="/contact" className="btn btn-primary">Get in Touch</Link>
            </div>
            <div className="overview-image">
              <div className="placeholder-image">
                <img src="https://via.placeholder.com/400x300?text=About+Us" alt="About EIRS" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="values-section">
        <div className="container">
          <h2>Our Core Values</h2>
          <div className="values-grid">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div key={index} className="value-card">
                  <div className="value-icon">
                    <IconComponent size={40} />
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
      <section className="achievements-section">
        <div className="container">
          <h2>Our Achievements</h2>
          <div className="achievements-grid">
            {achievements.map((achievement, index) => (
              <div key={index} className="achievement-card">
                <h3 className="achievement-number">{achievement.number}</h3>
                <p className="achievement-label">{achievement.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-choose-section">
        <div className="container">
          <h2>Why Choose EIRS Technology?</h2>
          <div className="benefits-grid">
            <div className="benefit-item">
              <FaCheckCircle className="check-icon" />
              <h3>Professional Team</h3>
              <p>Certified and experienced professionals dedicated to your security</p>
            </div>
            <div className="benefit-item">
              <FaCheckCircle className="check-icon" />
              <h3>Latest Technology</h3>
              <p>Always using cutting-edge equipment and modern solutions</p>
            </div>
            <div className="benefit-item">
              <FaCheckCircle className="check-icon" />
              <h3>24/7 Support</h3>
              <p>Round-the-clock customer support for your peace of mind</p>
            </div>
            <div className="benefit-item">
              <FaCheckCircle className="check-icon" />
              <h3>Warranty & Service</h3>
              <p>Comprehensive warranty and regular maintenance services</p>
            </div>
            <div className="benefit-item">
              <FaCheckCircle className="check-icon" />
              <h3>Competitive Pricing</h3>
              <p>Quality solutions at affordable and transparent pricing</p>
            </div>
            <div className="benefit-item">
              <FaCheckCircle className="check-icon" />
              <h3>Custom Solutions</h3>
              <p>Tailored solutions designed for your specific needs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Secure Your Property?</h2>
          <p>Contact us today for a free consultation and quote</p>
          <Link to="/contact" className="btn btn-primary btn-large">Contact Us Now</Link>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;
