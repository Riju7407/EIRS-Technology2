import React from 'react'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css';
import '../styles/ServicesPopup.css';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../context/firebase';

function PhoneSignUp() {
  const [phone, setPhone] = useState('');
  const [user, setUser] = useState(null);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const sendOtp = async() => {
    try {
      setError('');
      setLoading(true);
      
      if (!phone || phone.length < 10) {
        setError('Please enter a valid phone number');
        setLoading(false);
        return;
      }
      
      // Format phone number with + if not already present
      const phoneNumber = phone.startsWith('+') ? phone : '+' + phone;
      
      try {
        const recaptcha = new RecaptchaVerifier(auth, 'recaptcha', {});
        
        const confirmation = await signInWithPhoneNumber(auth, phoneNumber, recaptcha);
        setUser(confirmation);
      } catch (recaptchaError) {
        console.error('reCAPTCHA initialization error:', recaptchaError);
        setError(recaptchaError.message || 'reCAPTCHA initialization failed. Please refresh and try again.');
        setLoading(false);
        return;
      }
      setLoading(false);
    } catch (error) {
      console.error('Error sending OTP:', error);
      setError(error.message || 'Failed to send OTP. Please try again.');
      setLoading(false);
    }
  }
  
  const verifyOtp = async() => {
    try {
      setError('');
      setLoading(true);
      
      if (!otp || otp.length < 6) {
        setError('Please enter a valid 6-digit OTP');
        setLoading(false);
        return;
      }
      
      await user.confirm(otp);
      console.log('Phone number verified successfully!');
      setLoading(false);
      // Redirect or handle successful verification
      window.location.href = '/account';
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setError(error.message || 'Failed to verify OTP. Please try again.');
      setLoading(false);
    }
  }
  
  return (
    <div className='phone-signup'>
      <div className='phone-content'>
        {!user ? (
          <>
            <h2>Sign In with Phone Number</h2>
            <PhoneInput
              country={'in'}
              value={phone}
              onChange={(phone) => setPhone(phone)}
              preferredCountries={['in']}
              enableSearch={true}
            />
            <button 
              onClick={sendOtp} 
              style={{marginTop:'10px', padding: '10px 20px', backgroundColor: '#ff6b35', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </>
        ) : (
          <>
            <h2>Enter OTP</h2>
            <input 
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              maxLength="6"
              style={{marginTop:'10px', padding: '10px', width: '100%', maxWidth: '300px', border: '1px solid #ccc', borderRadius: '5px'}}
            />
            <button 
              onClick={verifyOtp}
              style={{marginTop:'10px', padding: '10px 20px', backgroundColor: '#ff6b35', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </>
        )}
        
        <div style={{marginTop:'10px'}} id="recaptcha"></div>
        
        {error && <p style={{color: 'red', marginTop: '10px'}}>{error}</p>}
      </div>
    </div>
  )
};
export default PhoneSignUp;
