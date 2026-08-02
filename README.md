# Harshit Presentation Hub

A premium, dark-first presentation hub designed for classroom use. Built with a merged design language combining **Like 2 identity** (minimalist dark aesthetic) with **Curated Bento** (grid-based dashboard layout).

![Harshit Presentation Hub](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)

## ✨ Features

### Core Functionality
- **Featured Presentation Hero** — Pinned presentation with one-click start
- **Backup Links** — Fallback options (Dropbox, etc.) if primary fails
- **Search & Filter** — Real-time search by title, subject, topic, or tags
- **Subject Chips** — Quick filter by subject category

### Command Palette
- **⌘K / Ctrl+K** — Quick search and navigation
- **Keyboard Navigation** — Arrow keys to navigate, Enter to select, Escape to close
- **Recent Presentations** — Shows pinned/recent when no query

### Display Modes
- **Theme Toggle** — Dark / Light / System preference
- **Projector Mode** — Larger text, stronger borders, high-contrast visibility for classroom projection

### Visual Design
- **Dark-First** — `#050505` background with glass card surfaces
- **Ambient Mesh Background** — Floating gradient blobs with CSS animations
- **Motion Polish** — Staggered entry animations, hover beam effects on featured card
- **Editorial Typography** — Geist Sans (UI) + Newsreader Italic (headings)

### Accessibility
- **Focus Visible Rings** — Visible focus indicators on all interactive elements
- **Skip Link** — "Skip to main content" for keyboard users
- **ARIA Labels** — Proper labeling for screen readers
- **Reduced Motion** — Respects `prefers-reduced-motion` preference
- **Contrast Compliance** — WCAG-compliant text contrast ratios

### Responsive
- **Mobile-First Grid** — Stacks gracefully on small screens
- **Touch Targets** — Minimum 48px button height
- **Projector Mode** — Enhanced visibility for large displays

## 🛠 Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Animation:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Fonts:** Google Fonts (Geist, Newsreader)
- **Database:** PostgreSQL with Drizzle ORM (health check endpoint)
- **Deployment:** Vercel-ready

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd presentation-hub

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
npm run typecheck # Run TypeScript type checking
```

## 📁 Project Structure

```
src/
├── app/
│   ├── globals.css          # Design system & theme
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Dashboard (home)
│   ├── loading.tsx          # Loading state
│   ├── not-found.tsx        # 404 page
│   └── presentation/
│       └── [id]/
│           └── page.tsx     # Focus mode for single presentation
├── components/
│   ├── command/             # Command palette
│   ├── dashboard/           # Dashboard-specific components
│   ├── layout/              # Layout components (AmbientBackground)
│   ├── presentation/        # Presentation components (BackupLinks)
│   ├── projector/           # Projector mode toggle
│   ├── theme/               # Theme toggle
│   └── ui/                  # Reusable UI components
├── data/
│   └── presentations.json   # Presentation data
├── lib/
│   ├── presentations.ts     # Data helpers
│   ├── search.ts            # Search utilities
│   └── utils.ts             # General utilities
└── types/
    └── presentation.ts      # TypeScript types
```

## 🎨 Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--color-midnight` | `#050505` | Background |
| `--color-surface` | `#121212` | Card surfaces |
| `--color-text-primary` | `#f8fafc` | Primary text |
| `--color-text-secondary` | `#94a3b8` | Secondary text |
| `--color-text-muted` | `#475569` | Muted text |
| `--color-accent-indigo` | `#6366f1` | Primary accent |
| `--color-accent-emerald` | `#34d399` | Success/status |

## 📝 Adding Presentations

Edit `src/data/presentations.json`:

```json
{
  "presentations": [
    {
      "id": "unique-slug",
      "title": "Presentation Title",
      "subject": "English",
      "topic": "Chapter Topic",
      "description": "Description of the presentation.",
      "platform": "Google Slides",
      "url": "https://docs.google.com/presentation/...",
      "presentUrl": "https://docs.google.com/presentation/.../present",
      "backupLinks": [
        {
          "label": "Backup PPTX",
          "platform": "Dropbox",
          "url": "https://dropbox.com/...",
          "description": "Backup file description"
        }
      ],
      "tags": ["tag1", "tag2"],
      "pinned": true,
      "accent": "indigo"
    }
  ]
}
```

## 🔧 Configuration

### Theme Persistence
Themes are stored in `localStorage` under `presentation-hub-theme`.

### Projector Mode
Projector mode state is stored in `localStorage` under `presentation-hub-projector`.

## 📱 Browser Support

- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+

## 📄 License

MIT License - feel free to use for your own classroom presentations!

---

Built with ❤️ for classroom presentations
