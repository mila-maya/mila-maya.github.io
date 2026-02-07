# Personal Portfolio & Blog

A modern, interactive personal homepage built with React, TypeScript, and Vite. Features a CMS-powered blog, project showcase, and multi-page routing.

## 🚀 Tech Stack

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite 5
- **Routing:** React Router v6
- **CMS:** Contentful
- **Styling:** CSS Modules
- **Deployment:** GitHub Pages (automated with GitHub Actions)
- **Markdown:** react-markdown with syntax highlighting

## 📦 Features

- ✅ Multi-page SPA with client-side routing
- ✅ CMS-powered blog with markdown support
- ✅ Project showcase
- ✅ Responsive design
- ✅ SEO optimized with react-helmet-async
- ✅ Code syntax highlighting
- ✅ Automated deployment to GitHub Pages

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Contentful CMS

1. Create a free account at [Contentful](https://www.contentful.com/)
2. Create a new space (e.g., "Personal Portfolio")
3. Go to **Settings → API keys** and create a new API key
4. Copy your **Space ID** and **Content Delivery API - access token**

### 3. Create Content Models in Contentful

#### Blog Post Content Model

Create a content type with ID: `blogPost`

Fields:
- **Title** (Short text, required)
- **Slug** (Short text, required, unique) - URL-friendly identifier
- **Excerpt** (Long text, required) - Short description (200 chars)
- **Content** (Long text, required) - Full blog post content (supports markdown)
- **Featured Image** (Media, single file)
- **Author** (Short text, required)
- **Published Date** (Date & time, required)
- **Tags** (Short text, list) - e.g., ["React", "TypeScript", "Tutorial"]
- **Category** (Short text) - e.g., "Tutorial", "Opinion", "News"

#### Project Content Model

Create a content type with ID: `project`

Fields:
- **Title** (Short text, required)
- **Slug** (Short text, required, unique)
- **Description** (Long text, required)
- **Technologies** (Short text, list, required) - e.g., ["React", "Node.js"]
- **GitHub URL** (Short text) - Link to GitHub repository
- **Live URL** (Short text) - Link to live demo
- **Featured Image** (Media, single file)
- **Display Order** (Integer, required) - For sorting (1, 2, 3...)

### 4. Configure Environment Variables

Update `.env.local` with your Contentful credentials:

```env
VITE_CONTENTFUL_SPACE_ID=your_actual_space_id
VITE_CONTENTFUL_ACCESS_TOKEN=your_actual_delivery_token
VITE_CONTENTFUL_ENVIRONMENT=master
```

### 5. Add Sample Content

In Contentful, create:
- 3-5 blog posts with the fields above
- 3-5 projects with the fields above
- Upload images for featured images

### 6. Customize Personal Information

Update the following files with your information:

- **src/pages/Home/Home.tsx** - Update hero section text
- **src/pages/About/About.tsx** - Update bio, skills, and description
- **src/pages/Contact/Contact.tsx** - Update email and social links
- **src/components/common/Footer/Footer.tsx** - Update social media links
- **src/components/common/Header/Header.tsx** - Update name and subtitle

Add your avatar image:
- Place your photo as `public/avatar.jpg`
- Or update the image paths in the code

## 🏃 Running Locally

### Development Server

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173)

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 🌐 Deployment to GitHub Pages

### 1. Configure GitHub Repository

1. Go to your repository **Settings → Pages**
2. Under **Source**, select **GitHub Actions**

### 2. Add Contentful Secrets

Go to **Settings → Secrets and variables → Actions** and add:

- `CONTENTFUL_SPACE_ID` - Your Contentful Space ID
- `CONTENTFUL_ACCESS_TOKEN` - Your Contentful Content Delivery API token

### 3. Deploy

Push to the `main` branch:

```bash
git add .
git commit -m "feat: initial React portfolio setup"
git push origin main
```

GitHub Actions will automatically build and deploy your site to `https://mila-maya.github.io`

## 📁 Project Structure

```
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions deployment
├── public/
│   ├── 404.html                # SPA routing fallback
│   └── avatar.jpg              # Your profile photo
├── src/
│   ├── components/
│   │   ├── common/             # Shared components (Header, Footer, SEO)
│   │   ├── blog/               # Blog-specific components
│   │   └── projects/           # Project-specific components
│   ├── pages/                  # Page components (Home, About, Blog, etc.)
│   ├── layouts/                # Layout wrappers
│   ├── services/               # API services (Contentful)
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript type definitions
│   ├── styles/                 # Global styles and CSS variables
│   ├── App.tsx                 # Main app with routing
│   └── main.tsx                # App entry point
├── .env.local                  # Local environment variables (gitignored)
├── .env.example                # Example environment variables
├── package.json
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite configuration
└── README.md
```

## 🎨 Customization

### Styling

- **Global styles:** `src/styles/global.css`
- **CSS variables:** `src/styles/variables.css`
- **Component styles:** Each component has its own `.module.css` file

### Adding New Pages

1. Create a new page component in `src/pages/`
2. Add the route in `src/App.tsx`
3. Add navigation link in `src/components/common/Header/Header.tsx`

### Updating Content

Content is managed in Contentful. To add/update:
1. Log in to Contentful
2. Go to **Content** tab
3. Create or edit entries
4. Publish changes

Content updates appear immediately (no rebuild needed). However, for SEO and performance, you may want to trigger a rebuild via:
- Pushing a commit to GitHub
- Manually triggering the workflow in Actions tab

## 🔧 Troubleshooting

### "Error loading blog posts/projects"

- Check that `.env.local` has correct Contentful credentials
- Verify content models in Contentful match the expected structure
- Ensure content is published (not in draft state)

### Routing not working on GitHub Pages

- Ensure `404.html` is in the `public/` directory
- Check that `vite.config.ts` has `base: '/'` set correctly

### Build fails in GitHub Actions

- Verify repository secrets are set correctly
- Check that all dependencies are in `package.json`
- Review the Actions logs for specific errors

## 📝 License

MIT License - feel free to use this project for your own portfolio!

## 🤝 Contributing

This is a personal portfolio project, but feel free to fork it and customize it for your own use!

---

Built with ❤️ using React, TypeScript, and Vite
