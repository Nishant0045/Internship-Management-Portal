require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Internship = require('./models/Internship');
const Application = require('./models/Application');
const Notification = require('./models/Notification');

const daysFromNow = (d) => new Date(Date.now() + d * 24 * 60 * 60 * 1000);

async function seedDatabase() {
  await Promise.all([
    User.deleteMany({}),
    Internship.deleteMany({}),
    Application.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  // ---------- Users ----------
  const [admin, recruiter1, recruiter2] = await User.create([
    { name: 'Platform Admin', email: 'admin@internhub.com', password: 'Admin@123', role: 'admin' },
    {
      name: 'Aarav Sharma', email: 'recruiter@technova.io', password: 'Recruiter@123', role: 'recruiter',
      company: 'TechNova', designation: 'Talent Acquisition Lead', companyWebsite: 'https://technova.io',
      phone: '+91 98765 43210',
    },
    {
      name: 'Priya Verma', email: 'priya@cloudworks.in', password: 'Recruiter@123', role: 'recruiter',
      company: 'CloudWorks', designation: 'HR Manager', companyWebsite: 'https://cloudworks.in',
      phone: '+91 98111 22334',
    },
  ]);

  const students = await User.create([
    {
      name: 'Rahul Das', email: 'student@gmail.com', password: 'Student@123', role: 'student',
      phone: '+91 70020 11223', college: 'IIT Guwahati', degree: 'B.Tech, Computer Science',
      graduationYear: 2027, skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Git'],
      bio: 'Pre-final year CS student passionate about full-stack development and open source.',
      linkedin: 'https://linkedin.com/in/rahuldas', github: 'https://github.com/rahuldas',
    },
    {
      name: 'Sneha Kalita', email: 'sneha.k@gmail.com', password: 'Student@123', role: 'student',
      phone: '+91 94350 44556', college: 'Assam Engineering College', degree: 'B.Tech, Information Technology',
      graduationYear: 2026, skills: ['Python', 'SQL', 'Machine Learning', 'Pandas', 'Tableau'],
      bio: 'Data enthusiast who loves turning messy datasets into clear stories.',
      linkedin: 'https://linkedin.com/in/snehakalita',
    },
    {
      name: 'Vikram Singh', email: 'vikram.s@gmail.com', password: 'Student@123', role: 'student',
      phone: '+91 99870 66221', college: 'NIT Silchar', degree: 'B.Tech, Electronics',
      graduationYear: 2027, skills: ['Figma', 'UI Design', 'HTML', 'CSS', 'Prototyping'],
      bio: 'Design-focused developer crafting clean, accessible user experiences.',
      portfolio: 'https://vikramdesigns.me',
    },
    {
      name: 'Ananya Rao', email: 'ananya.r@gmail.com', password: 'Student@123', role: 'student',
      phone: '+91 90040 77889', college: 'Gauhati University', degree: 'B.Com',
      graduationYear: 2026, skills: ['Content Writing', 'SEO', 'Social Media', 'Canva'],
      bio: 'Content writer and marketer helping brands find their voice.',
    },
  ]);

  // ---------- Internships ----------
  const I = (o) => o;
  const internships = await Internship.create([
    I({
      title: 'Software Engineering Intern', company: 'TechNova', companyWebsite: 'https://technova.io',
      location: 'Remote', mode: 'Remote', jobType: 'Full-time', category: 'Software Engineering',
      skills: ['JavaScript', 'Node.js', 'Git', 'REST APIs'], stipendMin: 40000, stipendMax: 60000,
      duration: '6 months', openings: 4, isFeatured: true, deadline: daysFromNow(30),
      description: 'Join the core platform team to design and ship backend services used by 2M+ users. You will own features end-to-end with mentorship from senior engineers.',
      responsibilities: ['Build and maintain REST APIs with Node.js and Express', 'Write unit and integration tests', 'Participate in code reviews and sprint planning'],
      requirements: ['Strong JavaScript fundamentals', 'Familiarity with Git and REST concepts', 'Available full-time for 6 months'],
      perks: ['Mentorship from senior engineers', 'PPO opportunity', 'Flexible hours', 'Learning stipend'],
      postedBy: recruiter1._id,
    }),
    I({
      title: 'Frontend Developer Intern (React)', company: 'TechNova', location: 'Bengaluru', mode: 'Hybrid',
      jobType: 'Full-time', category: 'Web Development', skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Redux'],
      stipendMin: 30000, stipendMax: 45000, duration: '3 months', openings: 3, isFeatured: true, deadline: daysFromNow(21),
      description: 'Build delightful, performant user interfaces for our analytics dashboard used by enterprise customers.',
      responsibilities: ['Develop reusable React components', 'Collaborate with designers on Figma handoffs', 'Optimize pages for performance and accessibility'],
      requirements: ['Hands-on React experience (projects count!)', 'Good eye for UI details', 'Basic understanding of REST APIs'],
      perks: ['Hybrid flexibility', 'Free lunch on office days', 'Certificate + LOR'],
      postedBy: recruiter1._id,
    }),
    I({
      title: 'AI & Machine Learning Intern', company: 'TechNova', location: 'Remote', mode: 'Remote',
      jobType: 'Full-time', category: 'AI & Data Science', skills: ['Python', 'Machine Learning', 'PyTorch', 'SQL'],
      stipendMin: 50000, stipendMax: 80000, duration: '6 months', openings: 2, isFeatured: true, deadline: daysFromNow(45),
      description: 'Work on applied ML problems — from recommendation models to LLM-powered features. Publish-worthy work with real production impact.',
      responsibilities: ['Train and evaluate ML models', 'Build data pipelines with Python and SQL', 'Prototype LLM integrations'],
      requirements: ['Strong Python and statistics fundamentals', 'Coursework or projects in ML/DL', 'Familiarity with PyTorch or TensorFlow'],
      perks: ['GPU credits', 'Paper/patent support', 'PPO opportunity'],
      postedBy: recruiter1._id,
    }),
    I({
      title: 'Data Analytics Intern', company: 'CloudWorks', location: 'Guwahati', mode: 'On-site',
      jobType: 'Full-time', category: 'Data Analyst', skills: ['SQL', 'Excel', 'Tableau', 'Python'],
      stipendMin: 20000, stipendMax: 30000, duration: '3 months', openings: 2, deadline: daysFromNow(14),
      description: 'Turn raw business data into dashboards and insights that drive decisions across sales, marketing and ops.',
      responsibilities: ['Write SQL queries and build reports', 'Create Tableau dashboards', 'Present weekly insights to stakeholders'],
      requirements: ['Comfortable with SQL and Excel', 'Storytelling with data', 'Detail-oriented'],
      perks: ['Downtown office', 'Free courses', 'Certificate + LOR'],
      postedBy: recruiter2._id,
    }),
    I({
      title: 'UI/UX Design Intern', company: 'CloudWorks', location: 'Remote', mode: 'Remote',
      jobType: 'Part-time', category: 'UI/UX Design', skills: ['Figma', 'Prototyping', 'User Research', 'Design Systems'],
      stipendMin: 15000, stipendMax: 25000, duration: '3 months', openings: 2, deadline: daysFromNow(25),
      description: 'Design mobile and web experiences from research to high-fidelity prototypes, working directly with product managers.',
      responsibilities: ['Create wireframes and prototypes in Figma', 'Run usability tests', 'Maintain the design system'],
      requirements: ['Portfolio with at least 2 projects', 'Figma proficiency', 'Understanding of UX fundamentals'],
      perks: ['Flexible part-time hours', 'Design mentorship', 'Behance feature'],
      postedBy: recruiter2._id,
    }),
    I({
      title: 'Backend Developer Intern (Python)', company: 'CloudWorks', location: 'Remote', mode: 'Remote',
      jobType: 'Full-time', category: 'Software Engineering', skills: ['Python', 'Django', 'PostgreSQL', 'Docker'],
      stipendMin: 35000, stipendMax: 50000, duration: '6 months', openings: 3, deadline: daysFromNow(35),
      description: 'Help scale our cloud billing platform on Django and PostgreSQL. Learn production engineering the right way.',
      responsibilities: ['Build APIs with Django REST Framework', 'Write migrations and optimize queries', 'Containerize services with Docker'],
      requirements: ['Python proficiency', 'Basic SQL knowledge', 'Eagerness to learn DevOps basics'],
      perks: ['Remote-first', 'PPO opportunity', 'Conference budget'],
      postedBy: recruiter2._id,
    }),
    I({
      title: 'Mobile App Intern (Flutter)', company: 'TechNova', location: 'Hyderabad', mode: 'Hybrid',
      jobType: 'Full-time', category: 'Mobile Development', skills: ['Flutter', 'Dart', 'Firebase', 'REST APIs'],
      stipendMin: 30000, stipendMax: 40000, duration: '4 months', openings: 2, deadline: daysFromNow(28),
      description: 'Ship features for our 4.7★ rated cross-platform app with 500K+ downloads.',
      responsibilities: ['Build Flutter screens and widgets', 'Integrate Firebase services', 'Fix bugs and improve app performance'],
      requirements: ['Dart/Flutter basics with 1+ project', 'Understanding of state management', 'Git workflow familiarity'],
      perks: ['Play Store credit', 'Device lab access', 'Certificate + LOR'],
      postedBy: recruiter1._id,
    }),
    I({
      title: 'Digital Marketing Intern', company: 'CloudWorks', location: 'Remote', mode: 'Remote',
      jobType: 'Part-time', category: 'Digital Marketing', skills: ['SEO', 'Social Media', 'Google Analytics', 'Canva'],
      stipendMin: 10000, stipendMax: 18000, duration: '3 months', openings: 4, deadline: daysFromNow(18),
      description: 'Grow our organic presence — run SEO experiments, manage socials and analyze campaign performance.',
      responsibilities: ['Plan and schedule social content', 'Run basic SEO audits', 'Track funnels in Google Analytics'],
      requirements: ['Active on social platforms', 'Strong written English', 'Analytical mindset'],
      perks: ['Fully remote', 'Flexible hours', 'Marketing certifications sponsored'],
      postedBy: recruiter2._id,
    }),
    I({
      title: 'Content Writing Intern', company: 'TechNova', location: 'Remote', mode: 'Remote',
      jobType: 'Part-time', category: 'Content Writing', skills: ['Content Writing', 'SEO', 'Technical Writing'],
      stipendMin: 12000, stipendMax: 20000, duration: '3 months', openings: 3, deadline: daysFromNow(20),
      description: 'Write developer docs, tutorials and blog posts read by 100K+ developers every month.',
      responsibilities: ['Write 2-3 technical articles per week', 'Update product documentation', 'Repurpose content for socials'],
      requirements: ['Excellent written English', 'Interest in technology', 'Writing samples required'],
      perks: ['Byline on all articles', 'Remote-first', 'Portfolio building'],
      postedBy: recruiter1._id,
    }),
    I({
      title: 'Cyber Security Intern', company: 'CloudWorks', location: 'Bengaluru', mode: 'On-site',
      jobType: 'Full-time', category: 'Cyber Security', skills: ['Networking', 'Linux', 'OWASP', 'Burp Suite'],
      stipendMin: 35000, stipendMax: 55000, duration: '6 months', openings: 1, deadline: daysFromNow(40),
      description: 'Work with the security team on VAPT, SOC monitoring and hardening cloud infrastructure.',
      responsibilities: ['Assist with vulnerability assessments', 'Monitor SIEM alerts', 'Document security runbooks'],
      requirements: ['Linux and networking fundamentals', 'OWASP Top 10 awareness', 'Security certifications are a plus'],
      perks: ['Certification reimbursement', 'Security conference pass', 'PPO opportunity'],
      postedBy: recruiter2._id,
    }),
    I({
      title: 'MERN Stack Developer Intern', company: 'TechNova', location: 'Remote', mode: 'Remote',
      jobType: 'Full-time', category: 'Web Development', skills: ['MongoDB', 'Express', 'React', 'Node.js'],
      stipendMin: 35000, stipendMax: 50000, duration: '4 months', openings: 2, deadline: daysFromNow(32),
      description: 'Own full-stack features on the MERN stack — from MongoDB schema design to polished React UI.',
      responsibilities: ['Build MERN features end-to-end', 'Design MongoDB schemas', 'Write API documentation'],
      requirements: ['JavaScript + React basics', 'Understanding of Node.js and MongoDB', 'Git workflow familiarity'],
      perks: ['Remote-first', 'PPO opportunity', 'Mentorship'],
      postedBy: recruiter1._id,
    }),
    I({
      title: 'Graphic Design Intern', company: 'CloudWorks', location: 'Hybrid', mode: 'Hybrid',
      jobType: 'Part-time', category: 'UI/UX Design', skills: ['Figma', 'Canva', 'Illustrator', 'Branding'],
      stipendMin: 12000, stipendMax: 20000, duration: '3 months', openings: 2, deadline: daysFromNow(22),
      description: 'Create brand creatives, social assets and marketing visuals seen by millions.',
      responsibilities: ['Design social and ad creatives', 'Maintain brand guidelines', 'Collaborate with marketing'],
      requirements: ['Figma or Canva proficiency', 'Portfolio of visual work', 'Eye for typography and layout'],
      perks: ['Flexible part-time hours', 'Hybrid flexibility', 'Portfolio features'],
      postedBy: recruiter2._id,
    }),
    I({
      title: 'DevOps Intern', company: 'TechNova', location: 'Remote', mode: 'Remote',
      jobType: 'Full-time', category: 'Software Engineering', skills: ['Docker', 'AWS', 'CI/CD', 'Linux'],
      stipendMin: 30000, stipendMax: 45000, duration: '6 months', openings: 2, status: 'closed', deadline: daysFromNow(-5),
      description: 'Learn how production stays up — CI/CD, Kubernetes basics, monitoring and incident response.',
      responsibilities: ['Maintain CI pipelines', 'Help with AWS cost optimization', 'Write infrastructure docs'],
      requirements: ['Linux comfort', 'Basic Docker knowledge', 'Curiosity about systems'],
      perks: ['AWS credits', 'Remote-first', 'On-call shadowing'],
      postedBy: recruiter1._id,
    }),
    I({
      title: 'Product Analyst Intern (Draft)', company: 'CloudWorks', location: 'Remote', mode: 'Remote',
      jobType: 'Full-time', category: 'Data Analyst', skills: ['SQL', 'A/B Testing', 'Mixpanel'],
      stipendMin: 25000, stipendMax: 35000, duration: '3 months', openings: 1, status: 'draft',
      description: 'Draft listing — not yet published. Help define product metrics and run experiments.',
      responsibilities: [], requirements: [], perks: [],
      postedBy: recruiter2._id,
    }),
  ]);

  // ---------- Applications ----------
  const [rahul, sneha, vikram, ananya] = students;
  const byTitle = (t) => internships.find((i) => i.title === t);

  const appsData = [
    { student: rahul._id, internship: byTitle('Software Engineering Intern')._id, status: 'Shortlisted', coverLetter: 'I have built 3 full-stack MERN projects and contributed to open source. Excited to learn production engineering with TechNova!' },
    { student: rahul._id, internship: byTitle('Frontend Developer Intern (React)')._id, status: 'Interview', coverLetter: 'React is my strongest skill — I built a dashboard app with Redux and would love to bring that experience here.' },
    { student: sneha._id, internship: byTitle('AI & Machine Learning Intern')._id, status: 'Under Review', coverLetter: 'Completed Andrew Ng ML specialization and built an image classifier with PyTorch. Keen to work on real ML problems.' },
    { student: sneha._id, internship: byTitle('Data Analytics Intern')._id, status: 'Selected', coverLetter: 'SQL + Tableau are my daily tools. I interned with a campus club analyzing fest data for 5,000+ attendees.' },
    { student: vikram._id, internship: byTitle('UI/UX Design Intern')._id, status: 'Shortlisted', coverLetter: 'My portfolio includes a fintech redesign and a design system. Figma is my second home!' },
    { student: vikram._id, internship: byTitle('Frontend Developer Intern (React)')._id, status: 'Applied', coverLetter: 'Design engineer here — I bridge the gap between Figma and pixel-perfect React code.' },
    { student: ananya._id, internship: byTitle('Content Writing Intern')._id, status: 'Interview', coverLetter: 'Published 40+ articles on tech and marketing. Samples attached in my portfolio.' },
    { student: ananya._id, internship: byTitle('Digital Marketing Intern')._id, status: 'Rejected', coverLetter: 'Grew a college club Instagram from 500 to 8K followers. Would love to do the same for CloudWorks.' },
  ];

  const applications = [];
  for (const a of appsData) {
    const timeline = [{ status: 'Applied', note: 'Application submitted' }];
    if (a.status !== 'Applied') timeline.push({ status: a.status, note: `Moved to ${a.status}` });
    applications.push(await Application.create({ ...a, phone: '+91 90000 00000', timeline }));
  }

  // One scheduled interview
  applications[1].interview = {
    date: daysFromNow(3), link: 'https://meet.google.com/demo-interview',
    notes: 'Round 1: React + DSA fundamentals (45 min)',
  };
  applications[1].rating = 4;
  applications[1].reviewNotes = 'Strong React fundamentals. Good communication.';
  await applications[1].save();
  applications[6].interview = {
    date: daysFromNow(2), link: 'https://meet.google.com/demo-content',
    notes: 'Portfolio walkthrough + writing exercise',
  };
  await applications[6].save();

  // Update denormalized counters
  for (const internship of internships) {
    const count = await Application.countDocuments({ internship: internship._id });
    internship.applicationsCount = count;
    internship.views = 50 + Math.floor(Math.random() * 400);
    await internship.save();
  }

  // Saved internships for demo student
  rahul.savedInternships = [byTitle('AI & Machine Learning Intern')._id, byTitle('Backend Developer Intern (Python)')._id];
  await rahul.save();

  // ---------- Notifications ----------
  await Notification.create([
    { user: rahul._id, type: 'application_status', title: 'Application Shortlisted', message: 'Your application for Software Engineering Intern at TechNova is now: Shortlisted.', link: `/applications/${applications[0]._id}` },
    { user: rahul._id, type: 'interview', title: 'Interview scheduled', message: 'Interview for Frontend Developer Intern (React) at TechNova has been scheduled.', link: `/applications/${applications[1]._id}` },
    { user: sneha._id, type: 'application_status', title: 'Application Selected', message: 'Congratulations! You were selected for Data Analytics Intern at CloudWorks.', link: `/applications/${applications[3]._id}` },
    { user: recruiter1._id, type: 'new_application', title: 'New application received', message: 'Rahul Das applied for Software Engineering Intern at TechNova.', link: '/recruiter/applications' },
  ]);

  console.log(`Seeded: ${3 + students.length} users, ${internships.length} internships, ${applications.length} applications`);
  return { admin, users: students.length };
}

// Run directly with `node seed.js` / `npm run seed`
if (require.main === module) {
  (async () => {
    try {
      const uri = process.env.MONGODB_URI;
      if (!uri) {
        console.error('Set MONGODB_URI in backend/.env to seed a real database.\n(Tip: just run the server without MONGODB_URI for auto demo-seed.)');
        process.exit(1);
      }
      await mongoose.connect(uri);
      await seedDatabase();
      await mongoose.disconnect();
      console.log('Done.');
      process.exit(0);
    } catch (err) {
      console.error('Seed failed:', err);
      process.exit(1);
    }
  })();
}

module.exports = { seedDatabase };
