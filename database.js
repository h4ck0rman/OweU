const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {

    const newUser = await prisma.user.create({
        data: {
            username: 'harpreetkaursROCLS',
            password_hash: 'hashhashhashhashahshahshash',
        },
    });

    console.log('New User:', newUser);

    const newSession = await prisma.session.create({
        data: {
            user: {
                connect: { id: newUser.id}, // Connect to existing User
              },
            title: 'Hunter x Hunter',
            start_time: new Date(),
            end_time: null
        },
    })

    console.log('New Session: ', newSession);

    const users = await prisma.user.findMany();
    console.log('All Users: ', users);

    const sessions_harp = await prisma.session.findMany({
        where: {
            user_id: newUser.id
        }
    });
    console.log(sessions_harp);
}

main()
.catch((e) => console.error(e))
.finally(async () => {
    await prisma.$disconnect();
})