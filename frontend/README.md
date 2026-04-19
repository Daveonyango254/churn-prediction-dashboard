# Premium Churn Prediction Dashboard

A sophisticated, enterprise-grade churn prediction analytics platform with a premium UI design. Built with React, TypeScript, Vite, and modern styling.

## Features

- **Dashboard**: Real-time KPI metrics, churn trends, and customer insights
- **Customer Management**: Browse and analyze customer data with risk scores
- **Advanced Analytics**: Detailed visualizations and retention analysis
- **Churn Predictor**: Predict customer churn with feature importance analysis
- **Settings**: Customizable dashboard configurations and preferences
- **Mobile Responsive**: Fully optimized for mobile, tablet, and desktop
- **Premium UI**: Dark theme with sophisticated color palette and animations

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Routing**: React Router DOM v7
- **Charts**: Recharts
- **Styling**: Tailwind CSS, Custom CSS Variables
- **Icons**: Lucide React
- **State Management**: React Context API

## Project Structure

```
frontend/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── Sidebar.tsx
│   │   ├── Layout.tsx
│   │   ├── Header.tsx
│   │   ├── StatCard.tsx
│   │   ├── Card.tsx
│   │   └── Button.tsx
│   ├── pages/               # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Customers.tsx
│   │   ├── Analytics.tsx
│   │   ├── Predictor.tsx
│   │   └── Settings.tsx
│   ├── context/             # React Context providers
│   │   └── AppContext.tsx
│   ├── utils/               # Utility functions
│   │   └── format.ts
│   ├── styles/              # Global styles
│   │   └── premium.css
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

## Design System

### Color Palette
- **Primary Background**: #0f1419 (Deep Navy)
- **Secondary Background**: #16202d (Navy)
- **Tertiary Background**: #1f2937 (Dark Gray)
- **Accent Primary**: #3b82f6 (Bright Blue)
- **Accent Secondary**: #10b981 (Emerald Green)
- **Success**: #10b981
- **Warning**: #f59e0b
- **Error**: #ef4444

### Typography
- **Font Family**: System UI fonts optimized for readability
- **Headings**: Space Grotesk (600, 700)
- **Body**: IBM Plex Sans (400, 500, 600)

### Components
All components support:
- Smooth hover states
- Premium shadows and transitions
- Responsive design patterns
- Accessibility features (ARIA labels, focus states)

## Running the Application

### Development

```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5174`

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Mobile Responsiveness

The dashboard is fully responsive with:
- Collapsible sidebar navigation on mobile
- Touch-friendly interaction sizes
- Optimized layouts for all screen sizes
- Mobile-first CSS design approach

## API Integration

The dashboard expects the following API endpoints:

- `GET /api/overview` - Dashboard overview metrics
- `GET /api/customers` - Customer list data
- `GET /api/feature-importance` - Feature importance data
- `GET /api/distribution` - Data distribution analysis
- `GET /api/metadata` - Dashboard metadata

## Customization

### Theme Colors
Edit `/src/styles/premium.css` to modify the CSS variables:

```css
:root {
  --primary-bg: #0f1419;
  --accent-primary: #3b82f6;
  /* ... other colors ... */
}
```

### Adding New Pages
1. Create a new component in `/src/pages`
2. Add the route in `/src/App.tsx`
3. Add navigation item in `/src/components/Sidebar.tsx`

## Performance Optimizations

- Lazy loading of route components
- Optimized chart rendering with Recharts
- CSS-in-JS variables for efficient theming
- Hardware-accelerated animations

## License

Proprietary - All rights reserved
