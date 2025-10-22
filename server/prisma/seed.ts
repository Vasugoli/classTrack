import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Create teacher
  const teacher = await prisma.user.create({
    data: {
      name: 'Dr. Smith',
      email: 'drsmith@example.com',
      role: 'TEACHER',
      password: 'hashed_password_here', // replace with bcrypt hash if using auth
    },
  });

  // Create student
  const student = await prisma.user.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      role: 'STUDENT',
      password: 'hashed_password_here',
    },
  });

  // Create class
  const class1 = await prisma.class.create({
    data: {
      name: 'Computer Science 101',
      code: 'CS101',
      teacherId: teacher.id,
    },
  });

  // Create schedule
    await prisma.schedule.create({
      data: {
        userId: teacher.id,
        classId: class1.id,
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '10:30',
      },
    });

  // Create attendance record
    await prisma.attendance.create({
      data: {
        userId: student.id,
        classId: class1.id,
        date: new Date(),
        status: 'PRESENT',
      },
    });

  console.log('✅ Database has been seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
