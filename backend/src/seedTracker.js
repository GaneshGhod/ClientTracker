const { sequelize, Client } = require('./models');

const seedClients = async () => {
  try {
    await sequelize.sync();
    console.log('Database synced for Client Tracker...');

    // Clear existing clients for clean seed
    await Client.destroy({ where: {} });

    const now = new Date();
    
    // 2 days ago (Overdue)
    const overdueDate = new Date(now);
    overdueDate.setDate(now.getDate() - 2);

    // Today at 3:00 PM (Due Today)
    const todayDate = new Date(now);
    todayDate.setHours(15, 0, 0, 0);

    // Tomorrow at 11:00 AM (Upcoming)
    const tomorrowDate = new Date(now);
    tomorrowDate.setDate(now.getDate() + 1);
    tomorrowDate.setHours(11, 0, 0, 0);

    // In 4 days (Upcoming)
    const futureDate = new Date(now);
    futureDate.setDate(now.getDate() + 4);

    const sampleClients = [
      {
        name: 'Sarah Jenkins',
        company: 'Apex Digital Agency',
        email: 'sarah@apexdigital.io',
        phone: '+1 (555) 234-8901',
        projectTitle: 'E-Commerce Redesign (Shopify)',
        projectDescription: 'Migrate from WooCommerce to Shopify Plus. Needs custom theme design, payment gateways, and inventory sync.',
        budget: '$4,500 - $6,000',
        status: 'in_discussion',
        followUpDate: todayDate,
        followUpNote: 'Send revised scope document and schedule kickoff call.',
        notes: 'Very interested. Mentioned budget is approved for Q4.',
      },
      {
        name: 'Michael Chen',
        company: 'NovaTech Labs',
        email: 'm.chen@novatech.co',
        phone: '+1 (555) 890-1234',
        projectTitle: 'Mobile App MVP (React Native)',
        projectDescription: 'Fitness tracking app with Bluetooth sensor integration.',
        budget: '$8,000',
        status: 'contacted',
        followUpDate: overdueDate,
        followUpNote: 'Follow up on proposal sent last Friday. Check if tech team had questions.',
        notes: 'Had initial 30 min discovery call. Waiting on CTO feedback.',
      },
      {
        name: 'Elena Rostova',
        company: 'Verve Studio',
        email: 'elena@vervestudio.design',
        phone: '+1 (555) 456-7890',
        projectTitle: 'Brand Identity & Web Assets',
        projectDescription: 'Complete visual branding, typography guide, and Figma landing page design.',
        budget: '$2,800',
        status: 'new',
        followUpDate: todayDate,
        followUpNote: 'Call Elena to discuss creative brief and timeline.',
        notes: 'Inbound inquiry via website form. Needs project done within 3 weeks.',
      },
      {
        name: 'David Patel',
        company: 'Horizon Logistics',
        email: 'david.p@horizonlogistics.com',
        phone: '+1 (555) 678-9012',
        projectTitle: 'Internal Warehouse Dashboard',
        projectDescription: 'Real-time shipment tracking dashboard connecting to internal REST APIs.',
        budget: '$5,000',
        status: 'in_progress',
        followUpDate: tomorrowDate,
        followUpNote: 'Deliver milestone 1 demo link and gather feedback.',
        notes: 'Contract signed, 50% deposit received. Milestone 1 due Friday.',
      },
      {
        name: 'Marcus Brody',
        company: 'Ironclad Fitness',
        email: 'marcus@ironcladfit.com',
        phone: '+1 (555) 345-6789',
        projectTitle: 'Membership Landing Page',
        projectDescription: 'High-converting sales funnel page for new gym location.',
        budget: '$1,500',
        status: 'completed',
        followUpDate: null,
        followUpNote: null,
        notes: 'Delivered successfully, client very happy. Potential retainer next year.',
      },
      {
        name: 'Amanda Taylor',
        company: 'Solstice Media',
        email: 'amanda@solsticemedia.net',
        phone: '+1 (555) 789-0123',
        projectTitle: 'Video Ad Campaign Editing',
        projectDescription: 'Short-form TikTok and Instagram reels ads editing.',
        budget: '$2,000 / mo',
        status: 'in_discussion',
        followUpDate: futureDate,
        followUpNote: 'Check in regarding monthly retainer agreement draft.',
        notes: 'Wants 15 edited clips per month.',
      },
    ];

    await Client.bulkCreate(sampleClients);
    console.log(`Successfully seeded ${sampleClients.length} clients with follow-up reminders!`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding clients failed:', err);
    process.exit(1);
  }
};

seedClients();
