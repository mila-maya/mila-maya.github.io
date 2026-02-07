import SEO from '@components/common/SEO/SEO';
import styles from './About.module.css';

const About = () => {
  const skills = [
    'JavaScript',
    'TypeScript',
    'React',
    'Node.js',
    'Python',
    'HTML/CSS',
    'Git',
    'REST APIs',
    'SQL',
    'Docker',
    'AWS',
    'DevOps'
  ];

  return (
    <>
      <SEO
        title="About"
        description="Learn more about Mila - software engineer, open source enthusiast, and blogger."
      />

      <div className={styles.container}>
        <header className={styles.header}>
          <img
            src="/avatar.jpg"
            alt="Mila"
            className={styles.avatar}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <h1 className={styles.title}>About Me</h1>
          <p className={styles.subtitle}>
            Software Engineer | Open Source Enthusiast | Blogger
          </p>
        </header>

        <div className={styles.content}>
          <p>
            Hi! I'm Mila, a passionate software engineer who loves building things
            for the web. I specialize in creating user-friendly applications using
            modern technologies and best practices.
          </p>

          <p>
            I'm particularly interested in web development, DevOps, and open source
            software. When I'm not coding, you can find me contributing to open
            source projects, writing blog posts, or learning new technologies.
          </p>

          <p>
            I believe in continuous learning and sharing knowledge with the
            community. That's why I maintain this blog where I share tutorials,
            tips, and insights from my development journey.
          </p>
        </div>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Skills & Technologies</h2>
          <div className={styles.skills}>
            {skills.map((skill, index) => (
              <span key={index} className={styles.skill}>
                {skill}
              </span>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>What I Do</h2>
          <div className={styles.content}>
            <p>
              <strong>Web Development:</strong> I build responsive, performant web
              applications using modern frameworks like React and Vue.js.
            </p>
            <p>
              <strong>Backend Development:</strong> I create RESTful APIs and
              server-side applications using Node.js and Python.
            </p>
            <p>
              <strong>DevOps:</strong> I'm experienced in CI/CD pipelines,
              containerization with Docker, and cloud deployment on AWS.
            </p>
            <p>
              <strong>Open Source:</strong> I actively contribute to open source
              projects and maintain several of my own.
            </p>
          </div>
        </section>
      </div>
    </>
  );
};

export default About;
