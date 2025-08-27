# LinkLoom - Automated Link-in-Bio Tool

LinkLoom is a modern SaaS application that automatically syncs your bio links with content calendars, making it easy to keep your audience updated with your latest content.

## ✨ Features

- **Automated Link Sync** - Connect Trello, Notion, and other platforms
- **Smart Bio Pages** - AI-generated layouts that match your brand
- **Real-time Updates** - Links update automatically when content is published
- **Custom Domains** - Use your own domain or subdomain
- **Analytics** - Track clicks and engagement
- **Responsive Design** - Works perfectly on all devices

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript, Vite, Tailwind CSS
- **UI Components**: Shadcn/ui, Lucide React icons
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Styling**: Custom design system with glassmorphism effects
- **Routing**: React Router DOM
- **State Management**: React Context + Hooks

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/            # Shadcn/ui components
│   ├── Header.tsx     # Navigation header
│   ├── Hero.tsx       # Landing page hero section
│   ├── Features.tsx   # Feature showcase
│   ├── HowItWorks.tsx # Process explanation
│   ├── Pricing.tsx    # Pricing plans
│   ├── Footer.tsx     # Site footer
│   └── DashboardLayout.tsx # Dashboard layout
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── pages/              # Page components
│   ├── LandingPage.tsx # Main landing page
│   ├── Dashboard.tsx   # Dashboard routing
│   ├── auth/           # Authentication pages
│   └── dashboard/      # Dashboard pages
├── lib/                # Utilities and configurations
│   ├── supabase.ts    # Supabase client
│   └── utils.ts       # Helper functions
└── supabase/           # Database migrations
    └── migrations/     # SQL migration files
```

## 🗄️ Database Schema

The application uses a PostgreSQL database with the following key tables:

- **user_profiles** - User information and subdomains
- **bio_pages** - Bio page configurations
- **links** - Individual links with tracking
- **integrations** - Third-party platform connections
- **automation_rules** - Sync automation logic
- **subscriptions** - User subscription management
- **link_clicks** - Click tracking and analytics

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Git

### 1. Clone and Install

```bash
git clone <repository-url>
cd LinkLoom
npm install
```

### 2. Set Up Supabase

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Set Environment Variables**
   ```bash
   cp env.example .env.local
   ```
   
   Update `.env.local` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://ctfugzedtycshflmqlsd.supabase.co
   VITE_SUPABASE_ANON_KEY=***REMOVED***
   ```

3. **Run Database Migrations**
   - In your Supabase dashboard, go to SQL Editor
   - Copy the contents of `supabase/migrations/001_initial_schema.sql`
   - Run the migration to create all tables and policies

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3001`

## 📱 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🛣️ Pages & Routes

### Public Routes
- `/` - Landing page
- `/auth/signup` - User registration
- `/auth/signin` - User login
- `/auth/forgot-password` - Password reset

### Protected Routes (Dashboard)
- `/dashboard` - Dashboard overview
- `/dashboard/integrations` - Platform connections
- `/dashboard/bio-page` - Bio page customization
- `/dashboard/automation` - Sync rules
- `/dashboard/analytics` - Performance metrics
- `/dashboard/settings` - Account settings

## 🔑 Key Components

- **AuthContext** - Manages user authentication state
- **ProtectedRoute** - Guards protected dashboard routes
- **DashboardLayout** - Consistent dashboard navigation
- **Custom UI Components** - Extended Shadcn/ui with LinkLoom branding

## 🔌 Integrations

### Trello Integration
- OAuth authentication
- Board and list selection
- Automatic card sync to links
- Real-time updates

### Future Integrations
- Notion
- Airtable
- Google Calendar
- Custom webhooks

## 💰 Pricing Plans

- **Free Plan**: 10 links, basic themes, subdomain
- **Pro Plan**: Unlimited links, custom domains, advanced analytics, priority support

## 🚧 Development Status

### ✅ Completed
- [x] Project setup and configuration
- [x] Landing page with modern design
- [x] Authentication system (Supabase)
- [x] Database schema and migrations
- [x] Protected dashboard routes
- [x] User authentication pages
- [x] Responsive design system

### 🚧 In Progress
- [ ] Dashboard functionality implementation
- [ ] Trello integration
- [ ] Bio page generator
- [ ] Link management system

### 📋 Next Steps
- [ ] Implement dashboard pages with real data
- [ ] Set up Trello OAuth flow
- [ ] Create automation engine
- [ ] Add Stripe payment integration
- [ ] Implement custom domain setup
- [ ] Add analytics and tracking

## 🎨 Design System

### Color Palette
- **Primary**: HSL(220, 100%, 60%) - Blue
- **Secondary**: HSL(280, 100%, 60%) - Purple
- **Accent**: HSL(40, 100%, 60%) - Orange
- **Background**: HSL(0, 0%, 98%) - Off-white
- **Foreground**: HSL(0, 0%, 10%) - Near-black

### Typography
- **Headings**: Inter, bold weights
- **Body**: Inter, regular weights
- **Monospace**: JetBrains Mono for code

### Components
- Glassmorphism cards with backdrop blur
- Gradient buttons and accents
- Smooth hover animations
- Responsive grid layouts

## 🔒 Security Features

- Row Level Security (RLS) policies
- JWT authentication
- Secure password handling
- CORS protection
- Rate limiting (planned)

## 🚀 Deployment

### Supabase Hosting
- Database and authentication
- Edge functions for API endpoints
- Real-time subscriptions

### Frontend Deployment
- Vercel (recommended)
- Netlify
- AWS S3 + CloudFront

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Create a GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas

## 🙏 Acknowledgments

- Built with [Supabase](https://supabase.com) for the backend
- UI components from [Shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide React](https://lucide.dev)
- Design inspiration from modern SaaS applications

---

**LinkLoom** - Automate your bio links, amplify your content. 🚀
