import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productService } from '../services/api';
import HeroSection from '../components/HeroSection';
import BrandCarousel from '../components/BrandCarousel';
import ProductCard from '../components/ProductCard';
import CategorySidebar from '../components/CategorySidebar';
import WhatsAppButton from '../components/WhatsAppButton';
import InstagramButton from '../components/InstagramButton';
import FacebookButton from '../components/FacebookButton';
import Footer from '../components/Footer';
import { useCategoryFilter } from '../context/CategoryFilterContext';
import {
  FaShieldAlt, FaTruck, FaHeadset, FaAward, FaChevronRight,
  FaCamera, FaFingerprint, FaHome, FaFire, FaRobot, FaServer,
  FaPhone, FaWrench, FaTimes, FaArrowRight, FaStar, FaQuoteLeft,
  FaCheckCircle, FaLock, FaTools, FaClock, FaEnvelope, FaLeaf,
  FaBolt, FaTag
} from 'react-icons/fa';
import '../styles/HomePage_New.css';

const OFFER_TICKERS = [
  ' Free Expert Consultation on All Security Projects',
  ' Pan-India Shipping Available',
  ' Professional Installation Included with CCTV Packages',
  ' Genuine Products with Manufacturer Warranty',
  ' 24/7 After-Sales Support',
];

const CATEGORY_LINKS = [
  { icon: <FaCamera />, label: 'CCTV Cameras', query: 'CCTV Cameras', color: '#667eea', bg: '#667eea' },
  { icon: <FaServer />, label: 'CCTV Components', query: 'CCTV Components', color: '#764ba2', bg: '#764ba2' },
  { icon: <FaFingerprint />, label: 'Biometric', query: 'Biometric Devices', color: '#f093fb', bg: '#f093fb' },
  { icon: <FaPhone />, label: 'Intercom', query: 'Intercom System', color: '#4facfe', bg: '#4facfe' },
  { icon: <FaHome />, label: 'Home Security', query: 'Home & Office Security', color: '#43e97b', bg: '#43e97b' },
  { icon: <FaFire />, label: 'Fire Alarm', query: 'Fire Alarm Systems', color: '#fa709a', bg: '#fa709a' },
  { icon: <FaRobot />, label: 'Automation', query: 'Automation Systems', color: '#f6d365', bg: '#f6d365' },
  { icon: <FaWrench />, label: 'IoT Solutions', query: 'IoT Solutions', color: '#a18cd1', bg: '#a18cd1' },
  { icon: <FaBolt />, label: 'Networking', query: 'Networking Device', color: '#00b4d8', bg: '#00b4d8' },
];

const TRUST_BADGES = [
  { icon: <FaShieldAlt />, title: '7+ Years Experience', sub: 'Industry trusted experts', color: '#667eea' },
  { icon: <FaTruck />, title: 'Fast Delivery', sub: 'Pan India shipping', color: '#43e97b' },
  { icon: <FaHeadset />, title: '24/7 Support', sub: 'Always here for you', color: '#f093fb' },
  { icon: <FaAward />, title: 'Genuine Products', sub: '100% authentic brands', color: '#f6d365' },
];

const SERVICE_CARDS = [
  {
    icon: <FaWrench />,
    title: 'Installation & Setup',
    desc: 'Professional on-site installation and full configuration of your security systems with minimal downtime.',
    img: 'https://res.cloudinary.com/dfitjwwws/image/upload/v1771697329/Install_nr4hg1.png',
    color: '#667eea',
    gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
    features: ['Site survey & planning', 'Professional installation', 'System testing & handover', 'Post-install walkthrough'],
  },
  {
    icon: <FaShieldAlt />,
    title: 'AMC & Maintenance',
    desc: 'Annual Maintenance Contracts ensuring peak performance through regular inspections and emergency support.',
    img: 'https://res.cloudinary.com/dfitjwwws/image/upload/v1771697310/AMC_tphu7z.png',
    color: '#43e97b',
    gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)',
    features: ['Scheduled inspections', 'Preventive maintenance', 'Emergency support', 'Performance reports'],
  },
  {
    icon: <FaHeadset />,
    title: 'Technical Support & Expert Consultation',
    desc: 'Expert consultation and round-the-clock technical support to resolve issues and keep your systems online.',
    img: 'https://res.cloudinary.com/dfitjwwws/image/upload/v1771697295/Technical_wdw9m2.png',
    color: '#f093fb',
    gradient: 'linear-gradient(135deg, #f093fb, #f5576c)',
    features: ['Free site consultation', 'Remote diagnostics', '24/7 helpdesk', 'Custom security plan'],
  },
];

const WHY_US = [
  { icon: <FaLock />, title: 'Certified Security Experts', desc: 'Our team holds industry certifications and undergoes regular training on the latest technology.' },
  { icon: <FaClock />, title: '7+ Years Track Record', desc: 'Thousands of successful deployments across residential, commercial and enterprise segments.' },
  { icon: <FaTools />, title: 'End-to-End Solutions', desc: 'Site survey, supply, installation, AMC and 24/7 support — all under one roof.' },
  { icon: <FaLeaf />, title: 'Scalable & Future-Ready', desc: 'Systems designed to grow with your business from a single camera to enterprise-grade networks.' },
];

const TESTIMONIALS = [
  { name: 'Rajesh Kumar', role: 'Business Owner, Lucknow', text: 'Exceptional service! EIRS installed a complete CCTV system at our commercial complex. Professional team, clean installation, and excellent after-sales support.', rating: 5 },
  { name: 'Priya Sharma', role: 'Homeowner, Kanpur', text: 'Happy with the biometric and intercom setup. The team was punctual, explained everything clearly and the system works flawlessly. Highly recommended!', rating: 5 },
  { name: 'Amit Singh', role: 'IT Manager, Lucknow', text: 'We signed up for the AMC package and it is worth every rupee. Quick response times, genuine parts and transparent pricing. EIRS is our go-to security partner.', rating: 5 },
];

const HOW_IT_WORKS = [
  { step: '01', icon: <FaPhone />, title: 'Contact Us', desc: 'Reach out via phone, WhatsApp or our website form for a free initial consultation.' },
  { step: '02', icon: <FaCheckCircle />, title: 'Free Site Survey', desc: 'Our expert visits your premises to assess requirements and recommend the best solution.' },
  { step: '03', icon: <FaTag />, title: 'Custom Quotation', desc: 'Receive a transparent, detailed proposal with no hidden charges or surprise costs.' },
  { step: '04', icon: <FaTools />, title: 'Installation & Handover', desc: 'Our certified team installs, tests and hands over your fully operational security system.' },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [selectedIPCameraResolutions, setSelectedIPCameraResolutions] = useState(new Set());
  const [selectedNVRChannels, setSelectedNVRChannels] = useState(new Set());
  const [selectedPOESwitches, setSelectedPOESwitches] = useState(new Set());
  const [sortBy, setSortBy] = useState('newest');
  const [email, setEmail] = useState('');
  const [newsletterMsg, setNewsletterMsg] = useState('');
  const { isSidebarOpen, closeSidebar } = useCategoryFilter();

  useEffect(() => {
    fetchAdminProducts();
    fetchFeaturedProducts();

    // Refresh when the tab becomes visible after an admin update
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' &&
          localStorage.getItem('products_dirty') === 'true') {
        fetchAdminProducts();
        fetchFeaturedProducts();
      }
    };
    // Refresh when another tab sets the dirty flag
    const handleStorage = (e) => {
      if (e.key === 'products_dirty' && e.newValue === 'true') {
        fetchAdminProducts();
        fetchFeaturedProducts();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('storage', handleStorage);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('storage', handleStorage);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterAndSortProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, selectedCategories, selectedPrice, selectedIPCameraResolutions, selectedNVRChannels, selectedPOESwitches, sortBy]);

  const fetchAdminProducts = async () => {
    try {
      const data = await productService.getAllProducts();
      const arr = Array.isArray(data) ? data : data.data || [];
      setProducts(arr);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  };

  const fetchFeaturedProducts = async () => {
    try {
      const data = await productService.getFeaturedProducts();
      setFeaturedProducts(Array.isArray(data) ? data : []);
    } catch {
      setFeaturedProducts([]);
    }
  };

  const filterAndSortProducts = useCallback(() => {
    let filtered = [...products];
    if (selectedCategories.size > 0) {
      filtered = filtered.filter(p =>
        Array.from(selectedCategories).some(cat =>
          p.category?.toLowerCase().includes(cat.toLowerCase()) ||
          p.subcategory?.toLowerCase().includes(cat.toLowerCase())
        )
      );
    }
    if (selectedPrice !== 'all') {
      filtered = filtered.filter(p => {
        const price = p.price || 0;
        switch (selectedPrice) {
          case '0-5000': return price <= 5000;
          case '5000-10000': return price > 5000 && price <= 10000;
          case '10000-25000': return price > 10000 && price <= 25000;
          case '25000-50000': return price > 25000 && price <= 50000;
          case '50000-100000': return price > 50000 && price <= 100000;
          case '100000+': return price > 100000;
          default: return true;
        }
      });
    }
    if (sortBy === 'price-low') filtered.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-high') filtered.sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating') filtered.sort((a, b) => b.rating - a.rating);
    setFilteredProducts(filtered);
  }, [products, selectedCategories, selectedPrice, selectedIPCameraResolutions, selectedNVRChannels, selectedPOESwitches, sortBy]);

  const handleCategorySelect = (category) => {
    const next = new Set(selectedCategories);
    next.has(category) ? next.delete(category) : next.add(category);
    setSelectedCategories(next);
  };

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (email) {
      setNewsletterMsg('Thank you for subscribing! We will keep you updated.');
      setEmail('');
      setTimeout(() => setNewsletterMsg(''), 5000);
    }
  };

  return (
    <div className="home-page">

      {/*  Offer Ticker  */}
      <div className="hp-offer-ticker">
        <div className="hp-ticker-track">
          {[...OFFER_TICKERS, ...OFFER_TICKERS].map((t, i) => (
            <span key={i} className="hp-ticker-item">{t}</span>
          ))}
        </div>
      </div>

      {/*  Hero  */}
      <HeroSection />

      {/*  Trust Bar  */}
      <div className="hp-trust-bar">
        <div className="hp-container">
          <div className="hp-trust-grid">
            {TRUST_BADGES.map((b, i) => (
              <div key={i} className="hp-trust-item">
                <span className="hp-trust-icon" style={{ background: `${b.color}18`, color: b.color }}>{b.icon}</span>
                <div>
                  <p className="hp-trust-title">{b.title}</p>
                  <p className="hp-trust-sub">{b.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/*  Shop by Category  */}
      <section className="hp-categories-section">
        <div className="hp-container">
          <div className="hp-section-heading">
            <div className="hp-section-heading-left">
              <h2>Shop by Category</h2>
            </div>
            <Link to="/products" className="hp-view-all-link">View All <FaArrowRight /></Link>
          </div>
          <div className="hp-categories-grid">
            {CATEGORY_LINKS.map((cat, i) => (
              <Link key={i} to={`/products?category=${encodeURIComponent(cat.query)}`} className="hp-cat-card">
                <div className="hp-cat-icon-wrap" style={{ background: `${cat.color}15` }}>
                  <div className="hp-cat-icon" style={{ color: cat.color }}>{cat.icon}</div>
                </div>
                <span className="hp-cat-label">{cat.label}</span>
                <FaChevronRight className="hp-cat-arrow" style={{ color: cat.color }} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/*  Sidebar  */}
      <div className={`left-sidebar-filters ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Categories & Filters</h3>
          <button className="close-sidebar-btn" onClick={closeSidebar}><FaTimes /></button>
        </div>
        <CategorySidebar
          onCategorySelect={handleCategorySelect}
          onPriceRangeChange={setSelectedPrice}
          onIPCameraResolutionChange={setSelectedIPCameraResolutions}
          onNVRChannelChange={setSelectedNVRChannels}
          onPOESwitchChange={setSelectedPOESwitches}
        />
      </div>
      {isSidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}

      {/*  Best Selling Products  */}
      <section className="hp-products-section">
        <div className="hp-container">
          <div className="hp-section-heading">
            <div className="hp-section-heading-left">
              <h2>Top Products</h2>
            </div>
            <Link to="/products" className="hp-view-all-link">View All <FaArrowRight /></Link>
          </div>
          {loading ? (
            <div className="hp-loading">
              <div className="hp-spinner" />
              <p>Loading products</p>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="hp-products-grid">
              {featuredProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : filteredProducts.slice(0, 15).length > 0 ? (
            <div className="hp-products-grid">
              {filteredProducts.slice(0, 15).map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="hp-no-products">
              <p>No products available at the moment. Check back soon!</p>
            </div>
          )}
          <div className="hp-products-cta">
            <Link to="/products" className="hp-explore-btn">Explore All Products <FaArrowRight /></Link>
          </div>
        </div>
      </section>

      {/*  Promo Banner  */}
      <section className="hp-promo-banner">
        <div className="hp-container">
          <div className="hp-promo-inner">
            <div className="hp-promo-text">
              <span className="hp-promo-badge"><FaBolt /> Special Offer</span>
              <h2>Complete Security Solutions for Your Home & Business</h2>
              <p>Professional installation included with all CCTV packages. Book a free site survey today — zero obligation.</p>
              <div className="hp-promo-actions">
                <Link to="/products" className="hp-promo-btn hp-promo-btn--primary">Shop Now <FaArrowRight /></Link>
                <Link to="/contact" className="hp-promo-btn hp-promo-btn--outline">Get Free Consultation</Link>
              </div>
            </div>
            <div className="hp-promo-stats">
              <div className="hp-stat"><span className="hp-stat-num">500+</span><span className="hp-stat-label">Projects Done</span></div>
              <div className="hp-stat"><span className="hp-stat-num">15+</span><span className="hp-stat-label">Years Experience</span></div>
              <div className="hp-stat"><span className="hp-stat-num">5000+</span><span className="hp-stat-label">Happy Clients</span></div>
              <div className="hp-stat"><span className="hp-stat-num">98%</span><span className="hp-stat-label">Satisfaction</span></div>
            </div>
          </div>
        </div>
      </section>

      {/*  Services Section  */}
      <section className="hp-services-section">
        <div className="hp-container">
          <div className="hp-svc-header">
            <div className="hp-svc-header-left">
              <h2>What We Offer</h2>
              <p>End-to-end security & automation — consultation, installation and lifetime support.</p>
            </div>
            <Link to="/services" className="hp-view-all-link">View All Services <FaArrowRight /></Link>
          </div>
          <div className="hp-services-grid">
            {SERVICE_CARDS.map((s, i) => (
              <div key={i} className="hp-service-card">
                <div className="hp-service-img-wrap">
                  <div className="hp-service-img-clip">
                    <img src={s.img} alt={s.title} className="hp-service-img" />
                    <div className="hp-service-img-overlay" style={{ background: `${s.color}55` }} />
                    <div className="hp-service-number">0{i + 1}</div>
                  </div>
                  <div className="hp-service-icon-circle" style={{ background: s.gradient }}>{s.icon}</div>
                </div>
                <div className="hp-service-body">
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                  <ul className="hp-service-features">
                    {s.features.map((f, fi) => (
                      <li key={fi}><span style={{ color: s.color }}></span> {f}</li>
                    ))}
                  </ul>
                  <Link to="/services" className="hp-service-link" style={{ color: s.color }}>Learn more <FaChevronRight /></Link>
                </div>
              </div>
            ))}
          </div>
          <div className="hp-svc-bottom-cta">
            <div className="hp-svc-cta-item">
              <FaPhone className="hp-svc-cta-icon" />
              <div>
                <p className="hp-svc-cta-label">Need help choosing?</p>
                <p className="hp-svc-cta-val">Call us for a free consultation</p>
              </div>
            </div>
            <Link to="/contact" className="hp-svc-contact-btn">Get Free Consultation <FaArrowRight /></Link>
          </div>
        </div>
      </section>

      {/*  How It Works  */}
      <section className="hp-how-section">
        <div className="hp-container">
          <div className="hp-section-heading hp-section-heading--center">
            <h2>How It Works</h2>
            <p>Getting your security system up and running is simple with EIRS Technology.</p>
          </div>
          <div className="hp-how-grid">
            {HOW_IT_WORKS.map((h, i) => (
              <div key={i} className="hp-how-card">
                <div className="hp-how-icon">{h.icon}</div>
                <h3>{h.title}</h3>
                <p>{h.desc}</p>
                {i < HOW_IT_WORKS.length - 1 && <div className="hp-how-arrow"><FaArrowRight /></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/*  Why Choose Us  */}
      <section className="hp-why-section">
        <div className="hp-container">
          <div className="hp-why-inner">
            <div className="hp-why-left">
              <h2>Why Choose EIRS Technology?</h2>
              <p>We are more than a product supplier — we are your long-term security partner, committed to protecting what matters most to you.</p>
              <Link to="/about" className="hp-why-btn">Learn About Us <FaArrowRight /></Link>
            </div>
            <div className="hp-why-grid">
              {WHY_US.map((w, i) => (
                <div key={i} className="hp-why-card">
                  <div className="hp-why-icon">{w.icon}</div>
                  <h3>{w.title}</h3>
                  <p>{w.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/*  Testimonials  */}
      <section className="hp-testimonials-section">
        <div className="hp-container">
          <div className="hp-section-heading hp-section-heading--center">
            <h2>What Our Customers Say</h2>
            <p>Trusted by thousands of homes and businesses across India.</p>
          </div>
          <div className="hp-testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="hp-testi-card">
                <FaQuoteLeft className="hp-testi-quote" />
                <div className="hp-testi-stars">
                  {[...Array(t.rating)].map((_, si) => <FaStar key={si} />)}
                </div>
                <p className="hp-testi-text">{t.text}</p>
                <div className="hp-testi-author">
                  <div className="hp-testi-avatar">{t.name.charAt(0)}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/*  Who We Are  */}
      <section className="hp-about-section">
        <div className="hp-container">
          <div className="hp-about-inner">
            <div className="hp-about-text">
              <h2>Who We Are</h2>
              <p>With over <strong>7 years of proven expertise</strong>, EIRS Technology is a leading provider of integrated security and automation solutions — delivering end-to-end systems tailored to modern needs.</p>
              <Link to="/about" className="hp-about-btn">Read Our Story <FaArrowRight /></Link>
            </div>
            <div className="hp-about-highlights">
              <div className="hp-highlight"><FaShieldAlt /> <span>Trusted Security Partner</span></div>
              <div className="hp-highlight"><FaAward /> <span>Certified Professionals</span></div>
              <div className="hp-highlight"><FaHeadset /> <span>Post-Sale Support</span></div>
              <div className="hp-highlight"><FaTruck /> <span>Pan-India Delivery</span></div>
            </div>
          </div>
        </div>
      </section>

      {/*  Newsletter  */}
      <section className="hp-newsletter-section">
        <div className="hp-container">
          <div className="hp-newsletter-inner">
            <div className="hp-newsletter-text">
              <span className="hp-section-badge hp-section-badge--light">Stay Updated</span>
              <h2>Get Security Tips & Exclusive Offers</h2>
              <p>Subscribe to our newsletter and be the first to know about new products, promotions and expert security tips.</p>
            </div>
            <form className="hp-newsletter-form" onSubmit={handleNewsletter}>
              {newsletterMsg ? (
                <div className="hp-newsletter-success"><FaCheckCircle /> {newsletterMsg}</div>
              ) : (
                <>
                  <div className="hp-newsletter-input-wrap">
                    <FaEnvelope className="hp-newsletter-icon" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                  <button type="submit" className="hp-newsletter-btn">Subscribe <FaArrowRight /></button>
                </>
              )}
            </form>
          </div>
        </div>
      </section>

      {/*  Brands  */}
      <div className="hp-brands-section">
        <div className="hp-container">
        </div>
        <BrandCarousel />
      </div>

      <Footer />
      <WhatsAppButton />
      <InstagramButton />
      <FacebookButton />
    </div>
  );
};

export default HomePage;
