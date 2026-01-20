
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findUnique({
        where: { email: 'mulusewu@skillhub.com' },
    });
    console.log('User mulusewu:', user);

    const student = await prisma.user.findUnique({
        where: { email: 'student1@example.com' },
    });
    console.log('User student1:', student);

    // If Admin is configured as STUDENT, fix it
    if (user && user.role !== 'ADMIN') {
        console.log('Fixing Admin Role...');
        await prisma.user.update({
            where: { email: 'mulusewu@skillhub.com' },
            data: { role: 'ADMIN' }
        });
        console.log('Admin Role Fixed!');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
