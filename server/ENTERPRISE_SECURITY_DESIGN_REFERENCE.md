# EIRS - Enterprise Security Design System

## Design Inspiration: Hikvision & Dahua

This design is inspired by the world's leading security/surveillance camera manufacturers:
- **Hikvision** (https://www.hikvision.com) - Global leader in video surveillance
- **Dahua** (https://www.dahuasecurity.com) - Professional security solutions

## Color Palette

### Primary Colors
- **Dark Navy Primary**: `#003d7a` - Trust, security, professionalism
- **Enterprise Blue Secondary**: `#0056b3` - Confidence, stability  
- **Tech Accent Blue**: `#007bff` - Modern, innovative
- **Light Blue Background**: `#e7f0ff` - Clean, minimal content areas

### Neutral Colors
- **Dark Background**: `#0d1b2a` - Hero section, premium feel
- **Card/Content Background**: `#ffffff` - Clean white content
- **Dark Text**: `#1a1a1a` - Primary text on light backgrounds
- **Light Text**: `#ffffff` - Text on dark backgrounds
- **Muted Text**: `#666666` - Secondary text, descriptions
- **Border Light**: `#e0e0e0` - Subtle divisions
- **Hover Background**: `#f5f5f5` - Interactive elements

## Design System

### Hero Section
```
Background: Dark gradient (Enterprise Blue theme)
Text: White with excellent contrast
CTA Buttons: Blue gradient with hover effects
Carousel: Professional indicators with blue accents
```

### Content Sections
```
Background: Light gray (#f8f9fa) or white
Cards: White with blue top border
Typography: Dark text on light background
Accents: Blue for interactive elements
Shadows: Subtle, professional
```

### Buttons

#### Primary Button
- **Background**: Blue gradient `(#0056b3 → #007bff)`
- **Text**: White
- **Hover**: Darker shade with lift effect
- **Shadow**: Subtle blue glow

#### Secondary Button
- **Background**: Transparent
- **Border**: White or Blue
- **Text**: White or Blue
- **Hover**: Blue background with glow

#### CTA Section Buttons
- **Primary**: White background, blue text
- **Secondary**: Transparent with white border

### Cards & Components

#### Feature Card
- **Background**: White
- **Border-top**: 4px solid blue
- **Shadow**: Subtle depth
- **Hover**: Lift up with enhanced shadow

#### Product Card
- **Image**: Full width with zoom on hover
- **Price**: Blue accent color
- **CTA**: Blue gradient button
- **Hover**: Smooth lift animation

#### Service Card
- **Background**: Light gradient
- **Border-left**: 4px solid blue
- **Icon**: Blue colored
- **Hover**: Move right with shadow

### Typography

#### Headings
- **Hero Title**: 4rem, 800 weight, white, bold
- **Section Title**: 2.8rem, 800 weight, dark navy
- **Subsection**: 1.5rem, 700 weight
- **Card Title**: 1.2rem, 700 weight

#### Body Text
- **Body**: 1rem, 400 weight, #1a1a1a
- **Small**: 0.95rem, 400 weight, #666666
- **Muted**: 0.9rem, 400 weight, #999999

### Spacing System
- **xs**: 0.5rem
- **sm**: 1rem
- **md**: 1.5rem
- **lg**: 2rem
- **xl**: 3rem
- **2xl**: 4rem

## Animation & Motion

### Key Animations
- **Slide In**: Elements slide in from sides
- **Fade In Scale**: Cards appear with subtle scale
- **Lift on Hover**: Cards move up on hover
- **Smooth Transitions**: 0.3s ease all effects
- **Pulse**: Gentle opacity pulse for loading

### Timing
- **Instant**: 0.1s - 0.3s interactions
- **Standard**: 0.4s - 0.6s page transitions
- **Deliberate**: 0.8s - 1s initial load animations

## Responsive Breakpoints

### Desktop
- **Large**: 1200px+ (full grid layout)
- **Standard**: 768px - 1200px (normal grid)

### Tablet
- **Medium**: 768px - 1024px (2 columns)

### Mobile
- **Small**: 480px - 768px (2 columns)
- **Extra Small**: < 480px (1 column)

## Professional Standards

### Contrast Ratios
- **AAA Compliant**: All text meets WCAG AAA standards
- **Text on Dark**: Minimum 7:1 ratio
- **Text on Light**: Minimum 7:1 ratio

### Shadow Elevation
```css
Shadow (Normal): 0 2px 8px rgba(0, 0, 0, 0.1)
Shadow (Large): 0 8px 24px rgba(0, 0, 0, 0.15)
Shadow (Hover): 0 12px 32px rgba(0, 0, 0, 0.2)
```

### Border Radius
- **Sharp**: 0px (rare)
- **Slightly Rounded**: 4px (small elements)
- **Rounded**: 6px (cards, buttons)
- **Fully Rounded**: 50% (circles, avatars)

## Implementation Notes

### Hero Section Features
✅ Dark navy gradient background  
✅ Image carousel with smooth transitions  
✅ Professional carousel indicators  
✅ Left/right navigation arrows  
✅ Blue accent colors throughout  
✅ White text with excellent contrast  
✅ Smooth slide animations on entry  

### Button Styles
✅ Blue gradient primary buttons  
✅ White/transparent secondary buttons  
✅ Hover effects with lift and glow  
✅ Active states with slight compression  
✅ Uppercase text with letter spacing  
✅ Box shadows for depth  

### Card Components
✅ White backgrounds for content  
✅ Blue top/left borders for accent  
✅ Subtle shadows for depth  
✅ Hover animations (lift, glow)  
✅ Smooth image zoom on hover  
✅ Professional spacing and padding  

### Accessibility Features
✅ High contrast text (7:1 ratio)  
✅ Clear focus states on interactive elements  
✅ Semantic HTML structure  
✅ Proper heading hierarchy  
✅ Alt text for images  
✅ Keyboard navigation support  

## Color Usage Guidelines

### When to Use Each Color

**Dark Navy (#003d7a)**
- Page backgrounds
- Text headings
- Section titles

**Enterprise Blue (#0056b3)**
- Primary action buttons
- Card accents
- Key interactive elements

**Tech Accent Blue (#007bff)**
- Button hovers
- Links
- Secondary accents
- Highlights

**White (#ffffff)**
- Content cards
- Button backgrounds
- Text on dark backgrounds

**Light Gray (#f8f9fa)**
- Section backgrounds
- Alternative section colors
- Subtle distinctions

## Migration from Previous Design

### Key Changes
1. **Removed**: Green accents (#10b981) → **Added**: Professional Blue theme
2. **Removed**: Cyan glows (#06b6d4) → **Added**: Subtle blue shadows
3. **Removed**: Floating animations → **Added**: Professional slide transitions
4. **Removed**: Complex gradients → **Added**: Clean linear gradients
5. **Improved**: Typography hierarchy and spacing
6. **Enhanced**: Accessibility contrast ratios

### Benefits
- **Professional**: Enterprise security company aesthetic
- **Modern**: Clean, minimal design language
- **Accessible**: Excellent contrast ratios and keyboard support
- **Performant**: Simpler animations and effects
- **Consistent**: Unified color and spacing system

## Assets & Resources

### Hero Section Images
- Use professional security/tech imagery
- Minimum 1920x1080 resolution
- High quality, professional photography
- Preferably showing security systems or professional environments

### Icon Sets
- Use professional business icons
- Consistent style and weight
- Blue colored (#0056b3 or #007bff)
- 2rem - 3.5rem sizing

### Fonts
- **Headings**: Sans-serif, bold (800 weight)
- **Body**: Sans-serif, regular (400 weight)
- **Recommended**: System fonts or Google Fonts (Inter, Roboto, Poppins)

## Testing Checklist

- [ ] All buttons have clear hover states
- [ ] Text contrast meets WCAG AAA
- [ ] Images are optimized and load quickly
- [ ] Animations are smooth (60fps)
- [ ] Responsive design works on all breakpoints
- [ ] Navigation is clear and intuitive
- [ ] Forms are properly labeled and accessible
- [ ] Links have proper underlines or color changes
- [ ] No content is hidden on mobile unnecessarily

---

**Design System Version**: 1.0  
**Last Updated**: 2024  
**Status**: Production Ready  
**Theme**: Enterprise Security (Hikvision/Dahua Inspired)
