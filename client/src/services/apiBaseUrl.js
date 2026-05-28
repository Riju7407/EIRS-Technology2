const getRawApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  return process.env.NODE_ENV === 'production'
    ? 'https://eirs-technology-production.up.railway.app'
    : 'http://localhost:5000';
};

export const getApiBaseUrl = () => {

  const raw = String(getRawApiBaseUrl()).trim().replace(/\/+$/, '');

  // Guard against env values like https://host/api so auth routes stay at /auth/*.
  if (raw.endsWith('/api')) {
    return raw.slice(0, -4);
  }


  return raw;
  
   
};
