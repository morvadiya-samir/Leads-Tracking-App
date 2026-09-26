import { prisma } from './db.js';

async function main() {
  console.log('🌱 Seeding Leads and Notes database...');

  // Clean existing data
  await prisma.note.deleteMany();
  await prisma.lead.deleteMany();

  const leadsData = [
    {
      name: 'Sarah Connor',
      email: 'sarah.connor@cyberdyne.io',
      phone: '+1 (555) 234-5678',
      status: 'qualified',
      notes: [
        'Requested enterprise demo for cloud migration project.',
        'Initial discovery call completed. High intent and budget approved for Q4.',
        'Follow-up scheduled for next Tuesday at 2 PM EST.',
      ],
    },
    {
      name: 'Michael Scott',
      email: 'mscott@dundermifflin.com',
      phone: '+1 (555) 432-8765',
      status: 'contacted',
      notes: [
        'Left voicemail introducing our CRM integration features.',
        'Replied via email asking for paper-industry specific case studies.',
      ],
    },
    {
      name: 'Elena Rostova',
      email: 'elena.rostova@technova.ai',
      phone: '+44 20 7946 0912',
      status: 'new',
      notes: [
        'Inbound form submission through product landing page pricing calculator.',
      ],
    },
    {
      name: 'David Kim',
      email: 'dkim@apexventures.co',
      phone: '+1 (415) 890-1234',
      status: 'qualified',
      notes: [
        'Met at TechCrunch Disrupt conference booth.',
        'Interested in API volume licensing for 500+ active seats.',
        'Shared technical documentation and security compliance whitepaper.',
      ],
    },
    {
      name: 'Amara Okafor',
      email: 'amara.okafor@zenithsolar.org',
      phone: '+234 803 123 4567',
      status: 'new',
      notes: [
        'Requested quote for field agent lead management.',
      ],
    },
    {
      name: 'Lucas Bernard',
      email: 'lucas.bernard@solutech.fr',
      phone: '+33 1 42 68 55 00',
      status: 'lost',
      notes: [
        'Lead decided to build an internal in-house tool instead.',
        'Marked lost. Re-evaluate outreach in 6 months.',
      ],
    },
    {
      name: 'Priya Sharma',
      email: 'priya.sharma@innovatecorp.in',
      phone: '+91 98200 12345',
      status: 'contacted',
      notes: [
        'Sent proposal deck and pricing tier comparison.',
        'Waiting for feedback from procurement committee.',
      ],
    },
    {
      name: 'Marcus Vance',
      email: 'mvance@horizonlogistics.com',
      phone: '+1 (312) 555-7890',
      status: 'new',
      notes: [
        'Signed up for 14-day trial account.',
      ],
    },
    {
      name: 'Alexander Wright',
      email: 'a.wright@quantumflow.de',
      phone: '+49 30 901820',
      status: 'qualified',
      notes: [
        'Evaluated SOC2 compliance checklist.',
        'Requested procurement contract draft.',
      ],
    },
    {
      name: 'Sofia Chen',
      email: 'schen@pacificcloud.com',
      phone: '+1 (206) 555-0144',
      status: 'contacted',
      notes: [
        'Discussed custom webhooks and REST API limits.',
      ],
    },
    {
      name: 'Liam O\'Connor',
      email: 'liam@dublindigital.ie',
      phone: '+353 1 496 0123',
      status: 'new',
      notes: [
        'Requested sandbox credentials for technical team review.',
      ],
    },
    {
      name: 'Isabella Rossi',
      email: 'i.rossi@milano-fintech.it',
      phone: '+39 02 8765 4321',
      status: 'qualified',
      notes: [
        'Executive presentation delivered to VP of Operations.',
      ],
    },
    {
      name: 'Tariq Al-Mansoor',
      email: 'tariq@desertwinds.ae',
      phone: '+971 4 312 3456',
      status: 'contacted',
      notes: [
        'Requested multi-currency invoicing options.',
      ],
    },
    {
      name: 'Chloe Dupont',
      email: 'chloe@lyonaerospace.fr',
      phone: '+33 4 72 00 11 22',
      status: 'lost',
      notes: [
        'Project postponed until next fiscal year.',
      ],
    },
  ];

  for (const lead of leadsData) {
    const createdLead = await prisma.lead.create({
      data: {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        status: lead.status,
        notes: {
          create: lead.notes.map(content => ({
            content,
          })),
        },
      },
    });

    console.log(`✅ Seeded lead: ${createdLead.name} (${createdLead.email})`);
  }

  console.log(`🎉 Seeding completed! Total ${leadsData.length} leads seeded.`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
