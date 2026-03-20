import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱  Seeding database...');

  // Create default profile
  const existingProfile = await prisma.profile.findFirst();
  if (!existingProfile) {
    await prisma.profile.create({
      data: {
        firstName: '',
        lastName: '',
        email: '',
        targetDegree: "Master's",
        targetSemester: 'Winter Semester 2025/26',
        skills: [],
      },
    });
    console.log('✅  Created default profile');
  }

  // Seed a sample German university for demo purposes
  const existing = await prisma.university.findFirst({ where: { name: 'Technical University of Munich' } });
  if (!existing) {
    const tum = await prisma.university.create({
      data: {
        name: 'Technical University of Munich',
        city: 'Munich',
        country: 'Germany',
        website: 'https://www.tum.de',
        description: 'One of Europe\'s top universities for engineering and natural sciences.',
      },
    });

    const course = await prisma.course.create({
      data: {
        universityId: tum.id,
        name: 'M.Sc. Informatics',
        degree: 'M.Sc.',
        language: 'English',
        duration: '4 semesters',
        fees: 0,
        ects: 120,
        applicationVia: 'DIRECT',
        applicationUrl: 'https://www.tum.de/en/studies/degree-programs/detail/informatics-master-of-science-msc',
        sourceUrl: 'https://www.tum.de/en/studies/degree-programs/detail/informatics-master-of-science-msc',
        deadline: new Date('2025-05-31'),
      },
    });

    const application = await prisma.application.create({
      data: {
        courseId: course.id,
        status: 'DRAFT',
        priority: 'HIGH',
      },
    });

    // Default checklist
    const checklistItems = [
      'Write Statement of Purpose (SOP)',
      'Prepare CV/Resume',
      'Gather academic transcripts',
      'Obtain language certificate (IELTS/TOEFL)',
      'Get recommendation letters (2-3)',
      'Prepare copy of passport',
      'Check application portal at TUM',
      'Submit application online',
      'Pay application fee (if any)',
    ];

    await prisma.checklistItem.createMany({
      data: checklistItems.map((label, i) => ({
        applicationId: application.id,
        label,
        order: i,
      })),
    });

    await prisma.timelineEntry.create({
      data: {
        applicationId: application.id,
        action: 'Application created',
        description: 'Sample application added as demo',
        type: 'NOTE',
      },
    });

    // Sample calendar deadline
    await prisma.calendarEvent.create({
      data: {
        title: 'TUM M.Sc. Informatics Deadline',
        date: new Date('2025-05-31'),
        type: 'DEADLINE',
        color: '#ef4444',
        courseId: course.id,
        description: 'Application deadline for TUM Informatics MSc',
      },
    });

    console.log('✅  Created sample TUM application');
  }

  console.log('🎉  Seed complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
