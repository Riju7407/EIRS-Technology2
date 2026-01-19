# EIRS Technology - Frontend

## Overview

This is a comprehensive MERN stack frontend for EIRS Technology, an integrated security and automation solutions provider. The application includes a public-facing website with product catalog, services, and a fully-featured admin dashboard.

## Features

### Public Pages
- **Home Page**: Hero section, product categories, services overview, testimonials, and CTA buttons
- **Products Page**: Searchable and filterable product catalog with categories and brands
- **Product Details**: Detailed view with specifications, datasheets, and related products
- **Contact Page**: Contact form with validation and email submission
- **Authentication**: User signup and signin pages

### Admin Dashboard
- **Dashboard**: KPIs and recent activity overview
- **Enquiries Management**: View, search, and export contact form submissions to CSV
- **Products Management**: CRUD operations for products with bulk management
- **Content Management**: Edit website content (can be extended)

## Tech Stack

- **React 19**: UI framework
- **React Router v6**: Client-side routing
- **Axios**: HTTP client for API calls
- **React Icons**: Icon library
- **CSS**: Custom styling with CSS Grid and Flexbox

## Installation

### Prerequisites
- Node.js 16+ and npm
- Backend server running on `http://localhost:3000`

### Setup

1. **Navigate to the client directory**
```bash
cd client
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm start
```

The application will open at `http://localhost:3000` in your browser.

## Project Structure

```
client/
├── public/
│   ├── index.html
│   └── ...
├── src/
│   ├── components/
│   │   ├── Header.js
│   │   └── Footer.js
│   ├── pages/
│   │   ├── HomePage.js
│   │   ├── ProductsPage.js
│   │   ├── ProductDetailPage.js
│   │   ├── ContactPage.js
│   │   ├── SignUpPage.js
│   │   ├── SignInPage.js
│   │   ├── AdminDashboard.js
│   │   ├── AdminEnquiries.js
│   │   └── AdminProducts.js
│   ├── services/
│   │   └── api.js
│   ├── styles/
│   │   ├── global.css
│   │   ├── Header.css
│   │   ├── Footer.css
│   │   ├── HomePage.css
│   │   ├── ProductsPage.css
│   │   ├── ProductDetailPage.css
│   │   ├── ContactPage.css
│   │   ├── AuthPages.css
│   │   ├── AdminDashboard.css
│   │   └── AdminPages.css
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
└── package.json
```

## API Integration

The frontend communicates with the backend API endpoints:

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/user` - Get user profile

### Products
- `GET /api/auth/products` - Get all products
- `POST /api/auth/products/add` - Create product (admin)
- `PUT /api/auth/products/:id` - Update product (admin)
- `DELETE /api/auth/products/:id` - Delete product (admin)

### Services
- `GET /api/auth/services` - Get all services
- `POST /api/auth/services/add` - Add service (admin)
- `PUT /api/auth/services/update/:id` - Update service (admin)
- `DELETE /api/auth/services/delete/:id` - Delete service (admin)

### Contact & Admin
- `POST /api/auth/contact` - Submit contact form
- `GET /api/auth/contacts` - Get all contact submissions (admin)
- `GET /api/auth/users` - Get all users (admin)

## Available Routes

### Public Routes
- `/` - Home page
- `/products` - Products listing
- `/products/:id` - Product details
- `/contact` - Contact form
- `/signup` - User registration
- `/signin` - User login

### Admin Routes
- `/admin/dashboard` - Admin dashboard
- `/admin/enquiries` - Enquiries management
- `/admin/products` - Products management

## Features Implementation

### Search & Filtering
- Product search by name and description
- Filter by category and brand
- Dynamic filtering on Products page

### Forms
- Contact form with validation
- User registration and login
- Product creation and editing

### State Management
- React hooks (useState, useEffect)
- Local storage for authentication tokens

### Responsive Design
- Mobile-first approach
- Responsive grid layouts
- Mobile menu navigation

## Environment Configuration

Create a `.env` file in the client directory if needed:

```
REACT_APP_API_URL=http://localhost:3000/api
```

However, the current implementation uses a hardcoded base URL. Update it in `src/services/api.js` if needed.

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build` directory.

## Available Scripts

- `npm start` - Run development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App (irreversible)

## Styling

The application uses a custom CSS design system with:
- CSS Grid and Flexbox for layouts
- CSS variables for theming
- Responsive breakpoints at 768px
- Modern gradients and transitions

### Color Scheme
- Primary: `#2563eb` (Blue)
- Secondary: `#1e40af` (Dark Blue)
- Accent: `#f59e0b` (Amber)
- Text Dark: `#1f2937`
- Text Light: `#6b7280`
- Background: `#f9fafb`

## Future Enhancements

1. **Content Management System**: Dynamic homepage content editing
2. **Product Management**: Image upload and advanced filtering
3. **User Profile**: User account management and order history
4. **Analytics**: Dashboard analytics and reporting
5. **Multi-language Support**: i18n implementation
6. **Dark Mode**: Theme switcher
7. **Notifications**: Toast notifications and alerts
8. **Performance**: Lazy loading and code splitting

## Troubleshooting

### API Connection Issues
- Ensure backend server is running on port 3000
- Check CORS settings on backend
- Verify API base URL in `src/services/api.js`

### Authentication Issues
- Clear localStorage and login again
- Check token expiration
- Verify JWT middleware on backend

### Build Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear npm cache: `npm cache clean --force`

## Support

For issues or questions, contact the development team or refer to the backend documentation.

## License

All rights reserved to EIRS Technology.
