import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaTools, FaHeadset, FaClipboardList, FaAmbulance, FaTimes,
  FaCertificate, FaTrophy, FaClock, FaTag, FaShieldAlt, FaWrench,
  FaArrowRight, FaChevronRight, FaPhone, FaCheckCircle,
  FaUsers, FaStar, FaMapMarkerAlt, FaThumbsUp, FaHandshake
} from 'react-icons/fa';
import { serviceService } from '../services/api';
import { useCategoryFilter } from '../context/CategoryFilterContext';
import ServiceModal from '../components/ServiceModal';
import CategorySidebar from '../components/CategorySidebar';
import Footer from '../components/Footer';
import '../styles/ServicesPage.css';

const MAIN_SERVICES = [
  {
    icon: <FaTools />,
    title: 'Installation & Setup',
    description: 'Professional on-site installation and full configuration of your security systems with minimal downtime and guaranteed performance.',
    img: 'https://res.cloudinary.com/dfitjwwws/image/upload/v1771697329/Install_nr4hg1.png',
    color: '#667eea',
    gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
    features: ['Site survey & planning', 'Professional installation', 'System testing & handover', 'Post-install walkthrough'],
  },
  {
    icon: <FaClipboardList />,
    title: 'AMC & Maintenance',
    description: 'Annual Maintenance Contracts ensuring peak performance of your systems through regular inspections and emergency breakdown support.',
    img: 'https://res.cloudinary.com/dfitjwwws/image/upload/v1771697310/AMC_tphu7z.png',
    color: '#43e97b',
    gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)',
    features: ['Scheduled inspections', 'Preventive maintenance', 'Emergency support', 'Performance reports'],
  },
  {
    icon: <FaHeadset />,
    title: 'Technical Support & Expert Consultation',
    description: 'Expert consultation and round-the-clock technical support to resolve issues quickly and keep your systems always online.',
    img: 'https://res.cloudinary.com/dfitjwwws/image/upload/v1771697295/Technical_wdw9m2.png',
    color: '#f093fb',
    gradient: 'linear-gradient(135deg, #f093fb, #f5576c)',
    features: ['Free site consultation', 'Remote diagnostics', '24/7 helpdesk', 'Custom security plan'],
  },
];

const WHY_CHOOSE = [
  { icon: <FaCertificate />, title: 'Expert Technicians', desc: 'Certified professionals with years of industry experience' },
  { icon: <FaTrophy />, title: 'Quality Guaranteed', desc: 'High standards of quality in every service we provide' },
  { icon: <FaClock />, title: 'On-Time Service', desc: 'We respect your time and always deliver on schedule' },
  { icon: <FaTag />, title: 'Affordable Pricing', desc: 'Competitive rates without compromising on quality' },
  { icon: <FaShieldAlt />, title: 'Warranty Support', desc: 'Comprehensive warranty coverage for all our services' },
  { icon: <FaWrench />, title: 'Custom Solutions', desc: 'Tailored services designed for your specific requirements' },
];

const PROCESS_STEPS = [
  { num: '01', icon: <FaPhone />, title: 'Contact Us', desc: 'Reach out via call, WhatsApp or our contact form for an initial discussion.' },
  { num: '02', icon: <FaMapMarkerAlt />, title: 'Site Survey', desc: 'Our experts visit your site to assess requirements and recommend the best solution.' },
  { num: '03', icon: <FaHandshake />, title: 'Proposal & Agreement', desc: 'We provide a detailed quote and sign off on the service agreement.' },
  { num: '04', icon: <FaThumbsUp />, title: 'Installation & Handover', desc: 'Professional installation followed by full testing and user walkthrough.' },
];

const STATS = [
  { num: '500+', label: 'Projects Completed' },
  { num: '15+', label: 'Years Experience' },
  { num: '1000+', label: 'Happy Clients' },
  { num: '24/7', label: 'Support Available' },
];

const ServicesPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [dbServices, setDbServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failedImages, setFailedImages] = useState({});
  const { isSidebarOpen, closeSidebar } = useCategoryFilter();

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    try {
      const data = await serviceService.getAllServices();
      setDbServices(Array.isArray(data) ? data : data.data || []);
    } catch { setDbServices([]); }
    finally { setLoading(false); }
  };

  const handleServiceClick = (service) => {
    setSelectedService(service);
    setModalOpen(true);
  };

  const serviceImages = {
    'Installation & Setup': 'https://res.cloudinary.com/dfitjwwws/image/upload/v1771697329/Install_nr4hg1.png',
    'AMC & Maintenance': 'https://res.cloudinary.com/dfitjwwws/image/upload/v1771697310/AMC_tphu7z.png',
    'Technical Support & Expert Consultation': 'https://res.cloudinary.com/dfitjwwws/image/upload/v1771697295/Technical_wdw9m2.png',
  };

  const getServiceImage = (title, index) =>
    serviceImages[title] || MAIN_SERVICES[index % MAIN_SERVICES.length]?.img;

  const displayServices = dbServices.length > 0
    ? dbServices.map((s, i) => ({
        icon: MAIN_SERVICES[i]?.icon || <FaTools />,
        title: s.name,
        description: s.description,
        img: getServiceImage(s.name, i),
        color: MAIN_SERVICES[i]?.color || '#667eea',
        gradient: MAIN_SERVICES[i]?.gradient || 'linear-gradient(135deg, #667eea, #764ba2)',
        features: MAIN_SERVICES[i]?.features || [],
        raw: s,
      }))
    : MAIN_SERVICES.map(s => ({ ...s, raw: s }));

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

      <main className="sp-page">

        {/*  Hero  */}
        <section className="sp-hero">
          <div className="sp-hero-inner">
            <span className="sp-hero-badge">Professional Services</span>
            <h1>Security Services You Can Trust</h1>
            <p>End-to-end installation, maintenance & support for all your security and automation needs — delivered by certified professionals.</p>
            <div className="sp-hero-actions">
              <Link to="/contact" className="sp-hero-btn sp-hero-btn--primary">Get Free Consultation <FaArrowRight /></Link>
              <Link to="/products" className="sp-hero-btn sp-hero-btn--outline">Browse Products <FaChevronRight /></Link>
            </div>
          </div>
          <div className="sp-stats-bar">
            <div className="sp-container">
              <div className="sp-stats-grid">
                {STATS.map((s, i) => (
                  <div key={i} className="sp-stat">
                    <span className="sp-stat-num">{s.num}</span>
                    <span className="sp-stat-label">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/*  What We Offer  */}
        <section className="sp-services-section">
          <div className="sp-container">
            <div className="sp-section-head">
              <h2>Our Core Services</h2>
              <p>From initial setup to ongoing support — we cover every aspect of your security ecosystem.</p>
            </div>
            {loading ? (
              <div className="sp-loading"><div className="sp-spinner" /><p>Loading services</p></div>
            ) : (
              <div className="sp-services-grid">
                {displayServices.map((s, i) => (
                  <div key={i} className="sp-service-card" onClick={() => handleServiceClick(s.raw)} style={{ cursor: 'pointer' }}>
                    <div className="sp-card-img-clip">
                      <img
                        src={s.img}
                        alt={s.title}
                        className="sp-card-img"
                        onError={e => { e.target.onerror = null; e.target.src = ''; }}
                      />
                      <div className="sp-card-overlay" style={{ background: `${s.color}44` }} />
                      <div className="sp-card-num">0{i + 1}</div>
                    </div>
                    <div className="sp-card-icon" style={{ background: s.gradient }}>{s.icon}</div>
                    <div className="sp-card-body">
                      <h3>{s.title}</h3>
                      <p>{s.description}</p>
                      {s.features.length > 0 && (
                        <ul className="sp-card-features">
                          {s.features.map((f, fi) => (
                            <li key={fi}><FaCheckCircle className="sp-check" style={{ color: s.color }} /> {f}</li>
                          ))}
                        </ul>
                      )}
                      <span className="sp-card-link" style={{ color: s.color }}>View Details <FaChevronRight /></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/*  How We Work  */}
        <section className="sp-process-section">
          <div className="sp-container">
            <div className="sp-section-head sp-section-head--light">
              <h2>How We Work</h2>
              <p>A simple, transparent process from first contact to final handover.</p>
            </div>
            <div className="sp-process-grid">
              {PROCESS_STEPS.map((step, i) => (
                <div key={i} className="sp-process-step">
                  <div className="sp-process-icon">{step.icon}</div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                  {i < PROCESS_STEPS.length - 1 && <div className="sp-process-arrow"><FaArrowRight /></div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/*  Why Choose Us  */}
        <section className="sp-why-section">
          <div className="sp-container">
            <div className="sp-section-head">
              <h2>Why Our Services Stand Out</h2>
              <p>We combine expertise, reliability and transparency to deliver the best service experience.</p>
            </div>
            <div className="sp-why-grid">
              {WHY_CHOOSE.map((item, i) => (
                <div key={i} className="sp-why-card">
                  <div className="sp-why-icon">{item.icon}</div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/*  CTA Banner  */}
        <section className="sp-cta-section">
          <div className="sp-container">
            <div className="sp-cta-inner">
              <div className="sp-cta-text">
                <h2>Need a Custom Service Plan?</h2>
                <p>Talk to our experts for a free site survey and personalised recommendation.</p>
              </div>
              <div className="sp-cta-actions">
                <Link to="/contact" className="sp-cta-btn sp-cta-btn--primary">Schedule Consultation <FaArrowRight /></Link>
                <Link to="/products" className="sp-cta-btn sp-cta-btn--outline">View Products</Link>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>

      <ServiceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedService?.name || selectedService?.title || 'Service Details'}
        message={selectedService?.description || ''}
      />
    </>
  );
};

export default ServicesPage;
