import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaCalendarAlt, FaRupeeSign, FaTools } from 'react-icons/fa';
import { serviceService } from '../services/api';
import paymentService from '../services/paymentService';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import '../styles/ServicesPage.css';

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

	useEffect(() => {
		let isMounted = true;
		const run = async () => {
			try {
				setLoading(true);
				setError('');
				const r = await serviceService.getServiceById(id);
				const svc = r?.data || r;
				if (isMounted) {
					setService(svc);
					setForm((prev) => ({
						...prev,
						preferredDate: prev.preferredDate || toDateInputValue(svc?.preferredDate),
					}));
				}
			} catch (e) {
				if (isMounted) setError(e?.message || e?.response?.data?.message || 'Unable to load service details');
			} finally {
				if (isMounted) setLoading(false);
			}
		};
		run();
		return () => { isMounted = false; };
	}, [id]);

	useEffect(() => {
		// Keep form synced with latest user values
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
			// 1) Create booking first
			const bookingResp = await serviceService.createBooking({
				serviceId: service._id,
				customerName: form.customerName,
				phoneNumber: form.phoneNumber,
				email: form.email,
				address: form.address,
				preferredDate: form.preferredDate || null,
				notes: form.notes,
			});

			const booking = bookingResp?.data || bookingResp?.data?.data || bookingResp?.data?.booking || bookingResp?.data || bookingResp;
			const bookingId = booking?._id || bookingResp?.data?._id || bookingResp?.data?.data?._id;

			if (!bookingId) {
				throw new Error('Booking created but booking ID is missing.');
			}

			// 2) Create Razorpay order for this booking
			const scriptOk = await paymentService.loadRazorpayScript();
			if (!scriptOk) throw new Error('Failed to load payment gateway. Please try again.');

			const orderResp = await paymentService.createServiceBookingOrder({ bookingId });
			if (!orderResp?.success) throw new Error(orderResp?.message || 'Unable to start payment');

			const { key, orderId, amount, currency } = orderResp;
			if (!key || !orderId || !amount) throw new Error('Payment gateway did not return required order details');

			// 3) Open Razorpay checkout
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
					} catch (verErr) {
						setError(verErr?.message || 'Payment verification failed.');
					}
				},
				modal: {
					ondismiss: () => {
						navigate('/');
					},
				},
			};

			const rzp = new window.Razorpay(options);
			rzp.open();
		} catch (err) {
			setError(err?.message || err?.response?.data?.message || 'Unable to book service. Please try again.');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<>
			<main className="sp-page">
				<section className="sp-services-section" style={{ paddingTop: 24 }}>
					<div className="sp-container">
						<div style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
							<button className="sp-hero-btn sp-hero-btn--outline" onClick={() => navigate('/services')}>
								<FaArrowLeft /> Back
							</button>
							<Link to="/services" className="sp-hero-btn sp-hero-btn--outline">All Services</Link>
						</div>

						{loading ? (
							<div className="sp-loading"><div className="sp-spinner" /><p>Loading service</p></div>
						) : error ? (
							<div className="sp-booking-alert sp-booking-alert--error">{error}</div>
						) : !service ? (
							<div className="sp-booking-alert sp-booking-alert--error">Service not found.</div>
						) : (
							<>
								{/* Hero Section with Image */}
								<div style={{
									display: 'grid',
									gridTemplateColumns: service.image ? 'repeat(auto-fit, minmax(350px, 1fr))' : '1fr',
									gap: 32,
									alignItems: 'start',
									marginBottom: 40,
									borderRadius: 16,
									overflow: 'hidden'
								}}>
									{/* Image Section */}
									{service.image && (
										<div style={{
											borderRadius: 16,
											overflow: 'hidden',
											boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
											backgroundColor: '#f8f9fa'
										}}>
											<img 
												src={service.image} 
												alt={service.name} 
												style={{ 
													width: '100%', 
													height: '100%',
													minHeight: 400,
													objectFit: 'cover',
													display: 'block'
												}} 
											/>
										</div>
									)}

									{/* Service Info Section */}
									<div style={{
										display: 'flex',
										flexDirection: 'column',
										gap: 20
									}}>
										<div>
											<h1 style={{
												fontSize: 36,
												fontWeight: 700,
												color: '#1a1a1a',
												margin: '0 0 12px 0',
												display: 'flex',
												gap: 12,
												alignItems: 'center'
											}}>
												<FaTools style={{ color: '#0066cc' }} /> 
												{service.name}
											</h1>
											<p style={{
												fontSize: 16,
												color: '#666',
												lineHeight: 1.6,
												margin: 0
											}}>
												{service.description}
											</p>
										</div>

										{/* Price and Date Card */}
										<div style={{
											display: 'grid',
											gridTemplateColumns: '1fr 1fr',
											gap: 16,
											padding: 20,
											backgroundColor: '#f0f4ff',
											borderRadius: 12,
											border: '2px solid #e0e8ff'
										}}>
											<div>
												<p style={{
													fontSize: 12,
													color: '#666',
													fontWeight: 600,
													textTransform: 'uppercase',
													margin: '0 0 8px 0'
												}}>Price</p>
												<p style={{
													fontSize: 28,
													fontWeight: 700,
													color: '#0066cc',
													margin: 0,
													display: 'flex',
													alignItems: 'center',
													gap: 8
												}}>
													<FaRupeeSign style={{ fontSize: 20 }} />
													{displayPrice ? displayPrice : 'On Request'}
												</p>
											</div>
											<div>
												<p style={{
													fontSize: 12,
													color: '#666',
													fontWeight: 600,
													textTransform: 'uppercase',
													margin: '0 0 8px 0'
												}}>Preferred Date</p>
												<p style={{
													fontSize: 16,
													fontWeight: 600,
													color: '#1a1a1a',
													margin: 0,
													display: 'flex',
													alignItems: 'center',
													gap: 8
												}}>
													<FaCalendarAlt style={{ fontSize: 18, color: '#0066cc' }} />
													{service.availableDates?.length > 0 ? 'Multiple dates available' : 'N/A'}
												</p>
											</div>
										</div>

										{/* CTA Button */}
										{!showBookingForm && (
											<button 
												className="sp-cta-btn sp-cta-btn--primary" 
												onClick={handleBookClick} 
												disabled={submitting || !displayPrice}
												style={{
													padding: '14px 32px',
													fontSize: 16,
													fontWeight: 600,
													borderRadius: 8,
													width: '100%'
												}}
											>
												{submitting ? 'Processing...' : 'Book This Service'}
											</button>
										)}
									</div>
								</div>

								{/* Booking Form Section */}
								{showBookingForm && (
									<div style={{
										backgroundColor: '#f8f9fa',
										padding: 32,
										borderRadius: 16,
										marginBottom: 32
									}}>
										<h3 style={{
											fontSize: 24,
											fontWeight: 700,
											marginBottom: 24,
											color: '#1a1a1a'
										}}>Complete Your Booking</h3>

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
													<label>Preferred Date *</label>
													<select name="preferredDate" value={form.preferredDate} onChange={handleChange} required style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }}>
														<option value="">-- Select a date --</option>
														{service.availableDates?.map(date => (
															<option key={date} value={date}>
																{new Date(date).toLocaleDateString('en-IN')}
															</option>
														))}
													</select>
												</div>
												<div className="sp-booking-group">
													<label>Service Price</label>
													<input type="text" value={displayPrice ? `Rs. ${displayPrice}` : 'On request'} readOnly />
												</div>
											</div>

											<div className="sp-booking-group">
												<label>Notes</label>
												<textarea name="notes" value={form.notes} onChange={handleChange} rows={2} />
											</div>

											{error && <div className="sp-booking-alert sp-booking-alert--error">{error}</div>}
											{success && <div className="sp-booking-alert sp-booking-alert--success">{success}</div>}

											<div className="sp-booking-actions">
												<button type="button" className="sp-booking-btn sp-booking-btn--secondary" onClick={() => setShowBookingForm(false)} disabled={submitting}>
													Cancel
												</button>
												<button type="submit" className="sp-booking-btn sp-booking-btn--primary" disabled={submitting}>
													{submitting ? 'Processing...' : 'Book Service'}
												</button>
											</div>
										</form>

										{success && <div className="sp-booking-alert sp-booking-alert--success" style={{ marginTop: 12 }}>{success}</div>}
									</div>
								)}

								{/* Features Section */}
								{service.features && service.features.length > 0 && (
									<div style={{ marginTop: 48, marginBottom: 32 }}>
										<h3 style={{
											fontSize: 28,
											fontWeight: 700,
											marginBottom: 32,
											color: '#1a1a1a',
											textAlign: 'center'
										}}>What's Included</h3>
										<div style={{
											display: 'grid',
											gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
											gap: 24
										}}>
											{service.features.map((feature, idx) => (
												<div key={idx} style={{
													borderRadius: 16,
													overflow: 'hidden',
													backgroundColor: '#fff',
													boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
													transition: 'transform 0.3s, box-shadow 0.3s'
												}}>
													{feature.imageUrl && (
														<div style={{
															width: '100%',
															height: 200,
															overflow: 'hidden',
															backgroundColor: '#f0f4ff'
														}}>
															<img 
																src={feature.imageUrl} 
																alt={feature.title} 
																style={{ 
																	width: '100%', 
																	height: '100%', 
																	objectFit: 'cover' 
																}} 
															/>
														</div>
													)}
													<div style={{ padding: 24 }}>
														<h4 style={{
															fontSize: 18,
															fontWeight: 700,
															color: '#0066cc',
															marginBottom: 12,
															margin: '0 0 12px 0'
														}}>
															{feature.title}
														</h4>
														<p style={{
															fontSize: 14,
															lineHeight: 1.6,
															color: '#666',
															margin: 0,
															whiteSpace: 'pre-wrap'
														}}>
															{feature.description}
														</p>
													</div>
												</div>
											))}
										</div>
									</div>
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
