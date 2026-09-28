const bcrypt = require('bcryptjs');
const { sequelize, User, Category, Lead, Subscription } = require('./models');

const seedDB = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synced!');

    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const testPassword = await bcrypt.hash('test123', salt);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@leadmarket.com',
      password: adminPassword,
      role: 'admin'
    });

    const freelancer = await User.create({
      name: 'Test Freelancer',
      email: 'freelancer@test.com',
      password: testPassword,
      role: 'freelancer'
    });

    const client = await User.create({
      name: 'Test Client',
      email: 'client@test.com',
      password: testPassword,
      role: 'client'
    });

    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    await Subscription.create({
      userId: freelancer.id,
      plan: 'basic',
      status: 'active',
      startDate: new Date(),
      endDate: nextMonth,
      claimsLimit: 10,
      claimsUsedThisMonth: 0
    });

    const categoriesData = [
      { name: 'Web Development', slug: 'web-development', description: 'Websites, web apps, eCommerce' },
      { name: 'Graphic Design', slug: 'graphic-design', description: 'Logos, branding, illustrations' },
      { name: 'Video Editing', slug: 'video-editing', description: 'YouTube, commercials, social media' },
      { name: 'Content Writing', slug: 'content-writing', description: 'Blogs, copywriting, SEO articles' },
      { name: 'SEO', slug: 'seo', description: 'Search Engine Optimization' },
      { name: 'Mobile App Development', slug: 'mobile-app-development', description: 'iOS, Android, React Native' },
      { name: 'UI/UX Design', slug: 'ui-ux-design', description: 'User interface and experience design' },
      { name: 'Social Media Management', slug: 'social-media-management', description: 'Instagram, Twitter, LinkedIn management' }
    ];

    const categories = await Category.bulkCreate(categoriesData);

    const leadsData = [];
    for (let i = 1; i <= 15; i++) {
      const category = categories[i % categories.length];
      const isClientSource = i % 2 === 0;
      
      leadsData.push({
        title: `Project ${i} for ${category.name}`,
        description: `This is a detailed description for project ${i}. We are looking for an expert in ${category.name}.`,
        categoryId: category.id,
        budgetMin: 100 + (i * 50),
        budgetMax: 500 + (i * 100),
        clientContact: `client${i}@example.com`,
        clientReference: `REF-00${i}`,
        status: i % 5 === 0 ? 'claimed' : 'open',
        source: isClientSource ? 'client' : 'admin',
        postedBy: isClientSource ? client.id : admin.id,
        claimedBy: i % 5 === 0 ? freelancer.id : null,
        claimedAt: i % 5 === 0 ? new Date() : null,
      });
    }

    await Lead.bulkCreate(leadsData);

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seedDB();
