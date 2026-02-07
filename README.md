# Personal Portfolio & Blog

A modern, interactive personal homepage built with React, TypeScript, and Vite. Features a blog, project showcase, and multi-page routing - all with **content managed directly in code** (no external CMS needed!).

## 🚀 Tech Stack

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite 5
- **Routing:** React Router v6
- **Styling:** CSS Modules
- **Deployment:** GitHub Pages (automated with GitHub Actions)
- **Content:** Managed in local TypeScript files (no database or CMS required!)

## 📦 Features

- ✅ Multi-page SPA with client-side routing
- ✅ Blog with markdown support and syntax highlighting
- ✅ Project showcase
- ✅ Responsive design
- ✅ SEO optimized
- ✅ **Easy content management** - just edit TypeScript files!
- ✅ Automated deployment to GitHub Pages

## 🛠️ Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173)

That's it! Your portfolio is running with example content.

## ✏️ Adding Your Own Content

### Adding Blog Posts

Edit [src/data/blogPosts.ts](src/data/blogPosts.ts):

```typescript
export const blogPosts: BlogPost[] = [
  {
    title: "My Awesome Blog Post",
    slug: "my-awesome-blog-post", // Used in URL: /blog/my-awesome-blog-post
    excerpt: "A short description that appears in the blog list",
    content: `# My Awesome Blog Post

This is the full content of your blog post. You can use **markdown**!

## Code Examples

\`\`\`javascript
const greeting = "Hello World!";
console.log(greeting);
\`\`\`

It's that easy!`,
    author: "Your Name",
    publishedDate: "2025-02-07T10:00:00.000Z",
    tags: ["JavaScript", "Tutorial"],
    category: "Tutorial"
  },
  // Add more posts here...
];
```

### Adding Projects

Edit [src/data/projects.ts](src/data/projects.ts):

```typescript
export const projects: Project[] = [
  {
    title: "My Cool Project",
    slug: "my-cool-project",
    description: "A description of what this project does",
    technologies: ["React", "TypeScript", "Node.js"],
    githubUrl: "https://github.com/yourusername/project",
    liveUrl: "https://project-demo.com", // Optional
    displayOrder: 1 // Controls the order projects are displayed
  },
  // Add more projects here...
];
```

## 🎨 Customization

### Update Personal Information

1. **Header & Navigation** - [src/components/common/Header/Header.tsx](src/components/common/Header/Header.tsx)
   - Update your name and tagline

2. **Home Page** - [src/pages/Home/Home.tsx](src/pages/Home/Home.tsx)
   - Update the hero section text

3. **About Page** - [src/pages/About/About.tsx](src/pages/About/About.tsx)
   - Update your bio, skills, and background

4. **Contact Page** - [src/pages/Contact/Contact.tsx](src/pages/Contact/Contact.tsx)
   - Update email and social links

5. **Footer** - [src/components/common/Footer/Footer.tsx](src/components/common/Footer/Footer.tsx)
   - Update social media links

6. **Profile Photo**
   - Add your photo as `public/avatar.jpg`

### Styling

- **Global styles:** [src/styles/global.css](src/styles/global.css)
- **CSS variables (colors, spacing):** [src/styles/variables.css](src/styles/variables.css)
- **Component styles:** Each component has its own `.module.css` file

To change the color scheme, edit the CSS variables in [src/styles/variables.css](src/styles/variables.css):

```css
:root {
  --primary-color: #007acc; /* Change this to your preferred color */
  --primary-hover: #005fa3;
  /* ... */
}
```

## 🌐 Deployment to GitHub Pages

### 1. Configure GitHub Repository

1. Go to your repository **Settings → Pages**
2. Under **Source**, select **GitHub Actions**

### 2. Deploy

Simply push to the `main` branch:

```bash
git add .
git commit -m "feat: initial React portfolio setup"
git push origin main
```

GitHub Actions will automatically build and deploy your site to `https://yourusername.github.io` 🚀

**No secrets or API keys needed!** Since content is managed in code, the deployment is completely self-contained.

## 📁 Project Structure

```
├── .github/workflows/deploy.yml  # GitHub Actions deployment
├── public/
│   ├── 404.html                  # SPA routing fallback
│   └── avatar.jpg                # Your profile photo
├── src/
│   ├── components/               # Reusable UI components
│   ├── pages/                    # Page components (Home, About, Blog, etc.)
│   ├── layouts/                  # Layout wrappers
│   ├── data/                     # ⭐ YOUR CONTENT LIVES HERE
│   │   ├── blogPosts.ts          # Blog posts
│   │   └── projects.ts           # Projects
│   ├── services/                 # Data fetching services
│   ├── hooks/                    # Custom React hooks
│   ├── types/                    # TypeScript type definitions
│   ├── styles/                   # Global styles
│   ├── App.tsx                   # Main app with routing
│   └── main.tsx                  # Entry point
└── README.md
```

## 🔧 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
```

## 💡 Tips

### Adding Images to Blog Posts

1. Place images in the `public/images/` folder
2. Reference them in markdown:

```markdown
![Alt text](/images/my-image.jpg)
```

### Adding New Pages

1. Create a new component in `src/pages/`
2. Add the route in [src/App.tsx](src/App.tsx)
3. Add navigation link in [src/components/common/Header/Header.tsx](src/components/common/Header/Header.tsx)

### Markdown Tips

Your blog posts support:
- **Bold**, *italic*, ~~strikethrough~~
- [Links](https://example.com)
- Code blocks with syntax highlighting
- Lists, tables, and blockquotes
- And more!

See the example posts in [src/data/blogPosts.ts](src/data/blogPosts.ts) for reference.

## 🚀 Going Further

Want to add more features? Here are some ideas:

- **Search functionality** - Add a search bar to filter blog posts
- **Dark mode** - Add a theme toggle
- **Analytics** - Integrate Google Analytics or Plausible
- **Comments** - Use Utterances or Disqus for blog comments
- **RSS feed** - Generate an RSS feed for your blog
- **Contact form backend** - Use Formspree or EmailJS for the contact form

## 📝 License

MIT License - feel free to use this project for your own portfolio!

---

Built with ❤️ using React, TypeScript, and Vite
