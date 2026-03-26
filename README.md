# mynextjs

A modern Next.js starter template built with the latest features and best practices for scalable web applications.

## ✨ Features

- **Next.js 16.2** with App Router & React 19
- **TypeScript** for type safety
- **Tailwind CSS 4** for styling
- **Shadcn/ui** component library with customizable UI components
- **Dark mode** support via `next-themes`
- **React Query** (@tanstack/react-query) for data fetching
- **Form handling** with React Hook Form + Zod validation
- **Date utilities** via date-fns
- **Framer Motion** for animations
- **Lucide React** icons
- **Error boundaries** and loading states
- **SEO optimized** with metadata, robots.txt, and sitemap
- Optimized for performance and scalability

## 🚀 Getting Started

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```bash
.
├── app/            # App Router pages and layouts
│   ├── error.tsx   # Error boundary
│   ├── loading.tsx # Loading UI
│   ├── not-found.tsx # 404 page
│   ├── robots.ts   # SEO robots config
│   └── sitemap.ts  # SEO sitemap
├── components/     # Reusable UI components
│   ├── ui/         # Shadcn/ui components
├── hooks/          # Custom React hooks
├── lib/            # Utility functions
│   ├── validations/ # Zod schemas
│   ├── date.ts     # Date utilities
│   ├── metadata.ts # SEO metadata config
│   └── utils.ts    # Helper functions
├── public/         # Static assets
└── providers/      # Context providers (theme, query client)
```

## 🧰 Tech Stack

- **Framework**: Next.js 16.2
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: Shadcn/ui, Radix UI primitives
- **State Management**: React Query (TanStack Query)
- **Form Handling**: React Hook Form + Zod
- **Date Utilities**: date-fns
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Theme**: next-themes
- **Linting**: ESLint 9

## 📦 Build & Deploy

```bash
npm run build
npm run start
```

## 📚 Key Features & Examples

### Form Validation

See [example-login-form.tsx](components/examples/example-login-form.tsx) for React Hook Form + Zod integration.

### Custom Hooks

- `useMounted` - Prevent hydration mismatches
- `useMediaQuery` - Responsive media queries
- `useLocalStorage` - Sync state with localStorage

### SEO Configuration

- Metadata configured in [lib/metadata.ts](lib/metadata.ts)
- Dynamic sitemap at `/sitemap.xml`
- Robots.txt at `/robots.txt`

### Error Handling

- App-level error boundary ([error.tsx](app/error.tsx))
- Global error handler ([global-error.tsx](app/global-error.tsx))
- 404 page ([not-found.tsx](app/not-found.tsx))
- Loading states ([loading.tsx](app/loading.tsx))
