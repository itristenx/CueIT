import { PrismaClient, UserStatus, TicketStatus, Priority, ArticleStatus, TicketType, UserRole } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@nova.universe' },
    update: {},
    create: {
      clerkId: 'admin-clerk-id',
      email: 'admin@nova.universe',
      firstName: 'Nova',
      lastName: 'Admin',
      displayName: 'Nova Admin',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      department: 'IT',
      title: 'System Administrator',
    },
  });

  const regularUser = await prisma.user.upsert({
    where: { email: 'user@nova.universe' },
    update: {},
    create: {
      clerkId: 'user-clerk-id',
      email: 'user@nova.universe',
      firstName: 'John',
      lastName: 'Doe',
      displayName: 'John Doe',
      status: UserStatus.ACTIVE,
      department: 'Sales',
      title: 'Sales Representative',
    },
  });

  // Create sample tickets
  const ticket1 = await prisma.ticket.create({
    data: {
      ticketNumber: 'TKT-000001',
      title: 'Computer won\'t start',
      description: 'My computer won\'t turn on when I press the power button. I\'ve tried different power cables but no luck.',
      priority: Priority.HIGH,
      status: TicketStatus.OPEN,
      category: 'Hardware',
      subcategory: 'Desktop',
      tags: ['hardware', 'desktop', 'power'],
      creatorId: regularUser.id,
      assigneeId: adminUser.id,
    },
  });

  const ticket2 = await prisma.ticket.create({
    data: {
      ticketNumber: 'TKT-000002',
      title: 'Email not syncing',
      description: 'My Outlook email is not syncing with the server. I\'m not receiving new emails.',
      priority: Priority.MEDIUM,
      status: TicketStatus.IN_PROGRESS,
      category: 'Software',
      subcategory: 'Email',
      tags: ['email', 'outlook', 'sync'],
      creatorId: regularUser.id,
      assigneeId: adminUser.id,
    },
  });

  // Create sample comments
  await prisma.comment.create({
    data: {
      content: 'I\'ve checked the power supply and it seems to be working. Let me check the motherboard next.',
      isInternal: true,
      ticketId: ticket1.id,
      authorId: adminUser.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Hi John, I\'ve started investigating this issue. Can you try restarting your computer and let me know if that helps?',
      isInternal: false,
      ticketId: ticket2.id,
      authorId: adminUser.id,
    },
  });

  // Create sample KB articles
  await prisma.kBArticle.create({
    data: {
      title: 'How to Reset Your Password',
      content: `# How to Reset Your Password

If you've forgotten your password, follow these steps:

1. Go to the login page
2. Click on "Forgot Password"
3. Enter your email address
4. Check your email for a reset link
5. Click the link and set a new password

## Important Notes

- Password reset links expire after 1 hour
- Your new password must be at least 8 characters long
- Include uppercase, lowercase, numbers, and special characters`,
      excerpt: 'Step-by-step guide to reset your password',
      category: 'Account Management',
      tags: ['password', 'reset', 'account'],
      status: ArticleStatus.PUBLISHED,
      authorId: adminUser.id,
      publishedAt: new Date(),
    },
  });

  await prisma.kBArticle.create({
    data: {
      title: 'VPN Connection Troubleshooting',
      content: `# VPN Connection Troubleshooting

Having trouble connecting to the VPN? Try these solutions:

## Common Issues

### Cannot Connect
1. Check your internet connection
2. Verify your VPN credentials
3. Try connecting to a different server
4. Restart the VPN client

### Slow Connection
1. Try connecting to a server closer to your location
2. Switch to a different protocol (OpenVPN, IKEv2)
3. Check for background applications using bandwidth

### Connection Drops
1. Enable auto-reconnect in your VPN client
2. Check power management settings
3. Update your VPN client to the latest version`,
      excerpt: 'Solutions for common VPN connection problems',
      category: 'Network',
      tags: ['vpn', 'connection', 'troubleshooting'],
      status: ArticleStatus.PUBLISHED,
      authorId: adminUser.id,
      publishedAt: new Date(),
    },
  });

  // Create sample configurations
  await prisma.configuration.create({
    data: {
      key: 'company_name',
      value: 'Nova Universe Corporation',
      type: 'string',
      category: 'general',
    },
  });

  await prisma.configuration.create({
    data: {
      key: 'support_email',
      value: 'support@nova.universe',
      type: 'string',
      category: 'contact',
    },
  });

  await prisma.configuration.create({
    data: {
      key: 'max_ticket_attachments',
      value: '5',
      type: 'number',
      category: 'tickets',
    },
  });

  console.log('✅ Nova Universe database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
