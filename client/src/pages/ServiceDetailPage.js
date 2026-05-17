import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { serviceService } from '../services/api';
import paymentService from '../services/paymentService';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import '../styles/ServicesPage.css';

const SERVICE_IMAGE_MAP = {
	'Installation & Setup': 'https://res.cloudinary.com/dfitjwwws/image/upload/v1771697329/Install_nr4hg1.png',
	'AMC & Maintenance': 'https://res.cloudinary.com/dfitjwwws/image/upload/v1771697310/AMC_tphu7z.png',
	'Technical Support & Expert Consultation': 'https://res.cloudinary.com/dfitjwwws/image/upload/v1771697295/Technical_wdw9m2.png',
};

const toDateInputValue = (date) => {
	if (!date) return '';
	try {
		return new Date(date).toISOString().slice(0, 10);
	} catch {
		return '';
	}
};

const ServiceDetailPage = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const location = useLocation();
	const { isLoggedIn, user } = useAuth();

	const [loading, setLoading] = useState(true);
	const [service, setService] = useState(null);
	const [error, setError] = useState('');
	const [showBookingForm, setShowBookingForm] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [success, setSuccess] = useState('');
	const [form, setForm] = useState({
		customerName: user?.name || '',
		phoneNumber: user?.phoneNumber || '',
		email: user?.email || '',
		address: user?.address || '',
		preferredDate: '',
		notes: '',
	});

	// scroll to hash target once service has loaded
	useEffect(() => {
		if (!loading && service && location?.hash) {
			const id = location.hash.replace('#', '');
			setTimeout(() => {
				const el = document.getElementById(id);
				if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}, 120);
		}
	}, [loading, service, location]);
	useEffect(() => {
		let isMounted = true;
		const loadService = async () => {
			try {
				setLoading(true);
				setError('');
				const response = await serviceService.getServiceById(id);
				const svc = response?.data || response;
				if (isMounted) {
					setService(svc);
					setForm((prev) => ({
						...prev,
						preferredDate: prev.preferredDate || toDateInputValue(svc?.preferredDate),
					}));
				}
			} catch (fetchError) {
				if (isMounted) setError(fetchError?.message || fetchError?.response?.data?.message || 'Unable to load service details');
			} finally {
				if (isMounted) setLoading(false);
			}
		};
		loadService();
		return () => { isMounted = false; };
	}, [id]);

	useEffect(() => {
		setForm((prev) => ({
			...prev,
			customerName: prev.customerName || user?.name || '',
			phoneNumber: prev.phoneNumber || user?.phoneNumber || '',
			email: prev.email || user?.email || '',
			address: prev.address || user?.address || '',
		}));
	}, [user]);

	const displayPrice = useMemo(() => {
		const p = Number(service?.price);
		return Number.isFinite(p) && p > 0 ? p : null;
	}, [service]);

	const availableDates = useMemo(() => {
		if (!service) return [];
		if (Array.isArray(service.availableDates)) return service.availableDates;
		if (service.availableDates) return [service.availableDates];
		return [];
	}, [service]);

	const imageUrl = useMemo(() => {
		if (!service) return '';
		return service.image || SERVICE_IMAGE_MAP[service.name] || '';
	}, [service]);

	const overviewText = useMemo(() => {
		return service?.longDescription || service?.overview || service?.description || 'This service is tailored to deliver a premium experience with proven results.';
	}, [service]);

	const serviceTags = useMemo(() => {
		const tags = [];
		if (service?.category) tags.push(service.category);
		if (service?.type) tags.push(service.type);
		if (service?.level) tags.push(service.level);
		return tags;
	}, [service]);

	const detailHighlights = useMemo(() => [
		{ label: 'Price', value: displayPrice ? `₹${displayPrice}` : 'On Request' },
		{ label: 'Schedule', value: availableDates.length ? `${availableDates.length} available` : 'Flexible' },
		{ label: 'Duration', value: service?.duration || 'Flexible' },
		{ label: 'Expertise', value: service?.expertise || service?.level || 'Certified Team' },
	], [displayPrice, availableDates.length, service]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleBookClick = () => {
		setError('');
		setSuccess('');
		if (!isLoggedIn) {
			navigate('/signin');
			return;
		}
		setShowBookingForm(true);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setSuccess('');

		if (!isLoggedIn) {
			navigate('/signin');
			return;
		}

		if (!service?._id) {
			setError('Booking is unavailable for this service right now.');
			return;
		}

		if (!form.customerName || !form.phoneNumber || !form.address) {
			setError('Please fill name, phone number and address.');
			return;
		}

		if (!displayPrice) {
			setError('This service does not have a valid price for online payment.');
			return;
		}

		setSubmitting(true);
		try {
			const bookingResp = await serviceService.createBooking({
				serviceId: service._id,
				customerName: form.customerName,
				phoneNumber: form.phoneNumber,
				email: form.email,
				address: form.address,
				preferredDate: form.preferredDate || null,
				notes: form.notes,
			});

			const booking = bookingResp?.data || bookingResp;
			const bookingId = booking?._id || bookingResp?.data?._id;
			if (!bookingId) throw new Error('Booking created but booking ID is missing.');

			const scriptOk = await paymentService.loadRazorpayScript();
			if (!scriptOk) throw new Error('Failed to load payment gateway. Please try again.');

			const orderResp = await paymentService.createServiceBookingOrder({ bookingId });
			if (!orderResp?.success) throw new Error(orderResp?.message || 'Unable to start payment');

			const { key, orderId, amount, currency } = orderResp;
			if (!key || !orderId || !amount) throw new Error('Payment gateway did not return required order details');

			const options = {
				key,
				amount,
				currency: currency || 'INR',
				name: 'EIRS Technology',
				description: `Service Booking - ${service?.name || 'Service'}`,
				order_id: orderId,
				prefill: {
					name: form.customerName,
					email: form.email,
					contact: form.phoneNumber,
				},
				notes: {
					bookingId,
					serviceId: service._id,
				},
				handler: async (response) => {
					try {
						const verifyResp = await paymentService.verifyServiceBookingPayment({
							bookingId,
							razorpay_order_id: response.razorpay_order_id,
							razorpay_payment_id: response.razorpay_payment_id,
							razorpay_signature: response.razorpay_signature,
						});

						if (verifyResp?.success) {
							setSuccess('Payment successful. Your service booking is confirmed.');
							setShowBookingForm(false);
							setForm((prev) => ({ ...prev, notes: '' }));
						} else {
							setError(verifyResp?.message || 'Payment verification failed.');
						}
					} catch (verificationError) {
						setError(verificationError?.message || 'Payment verification failed.');
					}
				},
				modal: {
					ondismiss: async () => {
						// User dismissed the payment modal — remove pending booking to avoid storing failed records
						try {
							if (bookingId) await serviceService.deleteBooking(bookingId);
						} catch (err) {
							console.error('Failed to delete booking on modal dismiss:', err);
						}
						navigate('/');
					},
				},
			};

			const rzp = new window.Razorpay(options);
			rzp.on('payment.failed', async (response) => {
				// If payment failed, delete the pending booking to avoid storing failed entries
				try {
					if (bookingId) {
						await serviceService.deleteBooking(bookingId);
					}
				} catch (delErr) {
					console.error('Failed to delete booking after payment failure:', delErr);
				}
				setError('Payment failed: ' + (response.error?.description || 'Unknown reason'));
				setSubmitting(false);
			});
			rzp.open();
		} catch (submitError) {
			setError(submitError?.message || submitError?.response?.data?.message || 'Unable to book service. Please try again.');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<>
			<main className="sp-page">
				<section className="sp-services-section sp-service-detail-hero">
					<div className="sp-container">
						<div className="sp-service-detail-breadcrumb">
							<button className="sp-hero-btn sp-hero-btn--outline" onClick={() => navigate('/services')}>
								<FaArrowLeft /> Back to Services
							</button>
							<Link to="/services" className="sp-hero-btn sp-hero-btn--outline">Browse all services</Link>
						</div>

						{loading ? (
							<div className="sp-loading"><div className="sp-spinner" /><p>Loading service details</p></div>
						) : error ? (
							<div className="sp-booking-alert sp-booking-alert--error">{error}</div>
						) : !service ? (
							<div className="sp-booking-alert sp-booking-alert--error">Service not found.</div>
						) : (
							<>
								<div className="sp-service-detail-grid">
									<div>
										<div id="service-image" className="sp-service-detail-preview">
											{imageUrl ? (
												<img src={imageUrl} alt={service?.name || 'Service'} />
											) : (
												<div className="sp-service-detail-preview-fallback" role="img" aria-label="No service image">
													<svg width="96" height="96" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
														<rect x="2" y="4" width="20" height="14" rx="2" fill="#E6EEF9" />
														<path d="M4 18c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v0H4z" fill="#D6E8FB" />
														<circle cx="8.5" cy="9.5" r="1.5" fill="#B7D6FF" />
														<path d="M21 8l-6 5-4-4-6 6" stroke="#8FB9FF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
													</svg>
													<div className="sp-no-image-text">No image available</div>
												</div>
											)}
										</div>
										<div className="sp-service-detail-summary">
											<div>
												<span className="sp-section-badge">{service.category || 'Service'}</span>
												<h1>{service.name}</h1>
												<p>{service.description}</p>
												{serviceTags.length > 0 && (
													<div className="sp-service-tag-list">
														{serviceTags.map((tag, idx) => (
															<span key={idx} className="sp-tag">{tag}</span>
														))}
													</div>
												)}
											</div>

											<div className="sp-service-detail-meta">
												{detailHighlights.map((item) => (
													<div key={item.label} className="sp-service-detail-highlight">
														<strong>{item.label}</strong>
														<span>{item.value}</span>
													</div>
												))}
											</div>

											<div className="sp-service-detail-card">
												<h2>Service overview</h2>
												<p>{overviewText}</p>
											</div>
										</div>
									</div>

									<aside className="sp-booking-panel">
										<div>
											<p className="sp-subtitle">Secure your booking with just one click</p>
											<div className="sp-price">{displayPrice ? `₹${displayPrice}` : 'Price on request'}</div>
											<p className="sp-booking-note">Professional service booking designed for fast delivery and trusted quality.</p>
										</div>

										<div className="sp-service-detail-highlights">
											{detailHighlights.map((item) => (
												<div key={item.label} className="sp-service-detail-small-card">
													<strong>{item.label}</strong>
													<span>{item.value}</span>
												</div>
											))}
										</div>

										{error && <div className="sp-booking-alert sp-booking-alert--error">{error}</div>}
										{success && <div className="sp-booking-alert sp-booking-alert--success">{success}</div>}

										{!showBookingForm && (
											<button className="sp-booking-btn sp-booking-btn--primary" onClick={handleBookClick} disabled={submitting || !displayPrice}>
												{submitting ? 'Processing...' : 'Book this service'}
											</button>
										)}

										{showBookingForm && (
											<form className="sp-booking-form" onSubmit={handleSubmit}>
												<div className="sp-booking-grid">
													<div className="sp-booking-group">
														<label>Full Name *</label>
														<input type="text" name="customerName" value={form.customerName} onChange={handleChange} required />
													</div>
													<div className="sp-booking-group">
														<label>Phone Number *</label>
														<input type="text" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} required />
													</div>
												</div>

												<div className="sp-booking-group">
													<label>Email</label>
													<input type="email" name="email" value={form.email} onChange={handleChange} />
												</div>

												<div className="sp-booking-group">
													<label>Address *</label>
													<textarea name="address" value={form.address} onChange={handleChange} rows={3} required />
												</div>

												<div className="sp-booking-grid">
													<div className="sp-booking-group">
														<label>Preferred Date</label>
														<select name="preferredDate" value={form.preferredDate} onChange={handleChange} required={availableDates.length > 0}>
															<option value="">-- Select a date --</option>
															{availableDates.map((date) => (
																<option key={date} value={date}>{new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</option>
															))}
														</select>
													</div>
													<div className="sp-booking-group">
														<label>Service Price</label>
														<input type="text" value={displayPrice ? `₹${displayPrice}` : 'On request'} readOnly />
													</div>
												</div>

												<div className="sp-booking-group">
													<label>Notes</label>
													<textarea name="notes" value={form.notes} onChange={handleChange} rows={3} />
												</div>

												<div className="sp-booking-actions">
													<button type="button" className="sp-booking-btn sp-booking-btn--secondary" onClick={() => setShowBookingForm(false)} disabled={submitting}>Cancel</button>
													<button type="submit" className="sp-booking-btn sp-booking-btn--primary" disabled={submitting}>{submitting ? 'Processing...' : 'Confirm Booking'}</button>
												</div>
												{error && <div className="sp-booking-alert sp-booking-alert--error">{error}</div>}
												{success && <div className="sp-booking-alert sp-booking-alert--success">{success}</div>}
											</form>
										)}
									</aside>
								</div>

								{service.features && service.features.length > 0 && (
									<section className="sp-service-detail-section">
										<h3>What you get</h3>
										<div className="sp-service-feature-grid">
											{service.features.map((feature, idx) => (
												<div key={idx} className="sp-feature-card">
													{feature.imageUrl && <img src={feature.imageUrl} alt={feature.title || `Feature ${idx + 1}`} />}
													<h4>{feature.title || `Feature ${idx + 1}`}</h4>
													<p>{feature.description || feature}</p>
												</div>
											))}
										</div>
									</section>
								)}
							</>
						)}
					</div>
				</section>
				<Footer />
			</main>
		</>
	);
};

export default ServiceDetailPage;
