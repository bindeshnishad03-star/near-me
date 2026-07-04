const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding (SQLite)...');

  // 1. Clean existing database contents (order matters for constraints)
  console.log('🧹 Cleaning existing data...');
  await prisma.report.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.eventRSVP.deleteMany();
  await prisma.event.deleteMany();
  await prisma.marketplaceListing.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.group.deleteMany();
  await prisma.message.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.chatRoom.deleteMany();
  await prisma.connection.deleteMany();
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.pollVote.deleteMany();
  await prisma.pollOption.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.post.deleteMany();
  await prisma.story.deleteMany();
  await prisma.reel.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.interest.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Database cleaned.');

  // 2. Create Predefined Interests
  console.log('🏷️ Seeding interests...');
  const interestNames = [
    'Technology', 'Business', 'Education', 'Sports', 'Music', 'Movies',
    'Fitness', 'Photography', 'Travel', 'Food', 'Gaming', 'Pets',
    'Politics', 'Fashion', 'Finance', 'Reading', 'Coding', 'Entrepreneurship'
  ];
  
  const interestMap = {};
  for (const name of interestNames) {
    const interest = await prisma.interest.create({
      data: { name },
    });
    interestMap[name] = interest;
  }
  console.log(`✅ Created ${interestNames.length} interests.`);

  // 3. Create Users & Profiles
  console.log('👤 Seeding users & profiles...');
  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  const usersData = [
    {
      email: 'alice@nearme.com',
      username: 'alice_tech',
      name: 'Alice Johnson',
      role: 'ADMIN',
      bio: 'Software engineer loving local community initiatives and hiking.',
      profession: 'Lead Developer',
      education: 'B.Tech in Computer Science',
      languages: ['English', 'Kannada'],
      skills: ['React', 'Next.js', 'PostgreSQL', 'TypeScript'],
      interests: ['Technology', 'Coding', 'Entrepreneurship', 'Fitness'],
      country: 'India',
      state: 'Karnataka',
      city: 'Bengaluru',
      district: 'Urban Bangalore',
      area: 'Indiranagar',
      society: 'Indira Heights',
      apartment: '4B',
      latitude: 12.97189,
      longitude: 77.64115,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      coverImage: 'https://images.unsplash.com/photo-1707343843437-caacff5cfa74?w=800',
    },
    {
      email: 'bob@nearme.com',
      username: 'bob_fitness',
      name: 'Bob Smith',
      role: 'USER',
      bio: 'Personal trainer and food enthusiast. Let\'s make our neighborhood healthy!',
      profession: 'Fitness Coach',
      education: 'Certified Personal Trainer (NASM)',
      languages: ['English', 'Spanish'],
      skills: ['Weightlifting', 'Nutrition Planning', 'Cardio', 'Yoga'],
      interests: ['Fitness', 'Food', 'Travel', 'Sports'],
      country: 'India',
      state: 'Karnataka',
      city: 'Bengaluru',
      district: 'Urban Bangalore',
      area: 'Indiranagar',
      society: 'Indira Heights',
      apartment: '12A',
      latitude: 12.97150,
      longitude: 77.64200,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      coverImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800',
    },
    {
      email: 'charlie@nearme.com',
      username: 'charlie_entrepreneur',
      name: 'Charlie Davis',
      role: 'MODERATOR',
      bio: 'Local business builder. Interested in networking with techies and financial geeks.',
      profession: 'Founder',
      education: 'MBA, Stanford University',
      languages: ['English'],
      skills: ['Business Development', 'Fundraising', 'Strategy'],
      interests: ['Business', 'Entrepreneurship', 'Finance', 'Technology'],
      country: 'India',
      state: 'Karnataka',
      city: 'Bengaluru',
      district: 'Urban Bangalore',
      area: 'HSR Layout',
      society: 'HSR Residency',
      apartment: 'Penthouse A',
      latitude: 12.91026,
      longitude: 77.64502,
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
      coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
    },
    {
      email: 'dan@nearme.com',
      username: 'dan_photos',
      name: 'Dan Evans',
      role: 'USER',
      bio: 'Freelance photographer capturing neighborhood stories and nature.',
      profession: 'Photographer',
      education: 'BFA in Photography',
      languages: ['English', 'French'],
      skills: ['Lightroom', 'Portraiture', 'Drone Videography'],
      interests: ['Photography', 'Travel', 'Movies', 'Music'],
      country: 'USA',
      state: 'California',
      city: 'San Francisco',
      district: 'SF County',
      area: 'Mission District',
      society: 'Mission Apartments',
      apartment: '302',
      latitude: 37.7599,
      longitude: -122.4148,
      avatar: 'https://images.unsplash.com/photo-1527983359383-4758693f760c?w=150',
      coverImage: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800',
    },
    {
      email: 'emily@nearme.com',
      username: 'emily_chef',
      name: 'Emily Wong',
      role: 'USER',
      bio: 'Home baker and local food reviewer. Sharing recipes and hosting dinner parties.',
      profession: 'Culinary Artist',
      education: 'De Cordova Culinary School',
      languages: ['English', 'Mandarin'],
      skills: ['Baking', 'Pastry', 'Menu Design', 'Wine Pairing'],
      interests: ['Food', 'Music', 'Travel', 'Pets'],
      country: 'USA',
      state: 'California',
      city: 'San Francisco',
      district: 'SF County',
      area: 'SoMa',
      society: 'SoMa Lofts',
      apartment: '501',
      latitude: 37.7785,
      longitude: -122.3958,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      coverImage: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800',
    }
  ];

  const createdUsers = [];
  for (const data of usersData) {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        passwordHash: defaultPasswordHash,
        role: data.role,
      },
    });

    const profileInterests = data.interests.map(name => ({ id: interestMap[name].id }));

    await prisma.profile.create({
      data: {
        userId: user.id,
        name: data.name,
        bio: data.bio,
        avatar: data.avatar,
        coverImage: data.coverImage,
        profession: data.profession,
        education: data.education,
        languages: data.languages.join(','),
        skills: data.skills.join(','),
        country: data.country,
        state: data.state,
        city: data.city,
        district: data.district,
        area: data.area,
        society: data.society,
        apartment: data.apartment,
        latitude: data.latitude,
        longitude: data.longitude,
        interests: {
          connect: profileInterests,
        },
      },
    });

    createdUsers.push(user);
  }
  console.log(`✅ Created ${createdUsers.length} users with profiles.`);

  const [alice, bob, charlie, dan, emily] = createdUsers;

  // 4. Seeding Connections (Friends)
  console.log('🤝 Seeding connections...');
  await prisma.connection.create({
    data: { senderId: alice.id, receiverId: bob.id, status: 'ACCEPTED' },
  });
  await prisma.connection.create({
    data: { senderId: alice.id, receiverId: charlie.id, status: 'ACCEPTED' },
  });
  await prisma.connection.create({
    data: { senderId: bob.id, receiverId: charlie.id, status: 'PENDING' },
  });
  await prisma.connection.create({
    data: { senderId: dan.id, receiverId: emily.id, status: 'ACCEPTED' },
  });
  console.log('✅ Created user connections.');

  // 5. Seeding Posts with Polls, Comments, Likes, Bookmarks
  console.log('📝 Seeding posts...');
  
  // Post 1: Alice (Text + Poll)
  const post1 = await prisma.post.create({
    data: {
      userId: alice.id,
      type: 'POLL',
      content: 'Hey Indiranagar developers! Which coding workspace do you prefer for remote days? Let\'s meet up soon.',
      mediaUrls: '',
      locationTag: 'Indiranagar, Bengaluru',
      latitude: 12.97189,
      longitude: 77.64115,
      polls: {
        create: [
          { optionText: 'Third Wave Coffee' },
          { optionText: 'WeWork Indiranagar' },
          { optionText: 'Home Sweet Home' },
          { optionText: 'NearMe Office Space' }
        ]
      }
    },
    include: { polls: true }
  });

  // Bob votes on Alice's poll
  await prisma.pollVote.create({
    data: {
      userId: bob.id,
      postId: post1.id,
      optionId: post1.polls[0].id
    }
  });

  // Post 2: Bob (Images)
  const post2 = await prisma.post.create({
    data: {
      userId: bob.id,
      type: 'IMAGE',
      content: 'Morning jog around Indiranagar! The weather in Bengaluru is perfect today. Check out these views from the park.',
      mediaUrls: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600,https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600',
      locationTag: 'Indiranagar Park, Bengaluru',
      latitude: 12.97250,
      longitude: 77.64300,
    }
  });

  // Alice likes Bob's post
  await prisma.like.create({
    data: { userId: alice.id, postId: post2.id }
  });

  // Alice comments on Bob's post
  await prisma.comment.create({
    data: {
      userId: alice.id,
      postId: post2.id,
      content: 'Agreed! Which park is this? I\'d love to join next time.'
    }
  });

  // Post 3: Dan (Video/Image from Mission District SF)
  const post3 = await prisma.post.create({
    data: {
      userId: dan.id,
      type: 'IMAGE',
      content: 'Beautiful sunset capturing the murals in the Mission District. This area has so much character!',
      mediaUrls: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600',
      locationTag: 'Mission District, San Francisco',
      latitude: 37.7599,
      longitude: -122.4148,
    }
  });

  // Emily likes Dan's post
  await prisma.like.create({
    data: { userId: emily.id, postId: post3.id }
  });

  // Emily bookmarks Dan's post
  await prisma.bookmark.create({
    data: { userId: emily.id, postId: post3.id }
  });
  console.log('✅ Seeded posts.');

  // 6. Seeding Stories & Reels
  console.log('🎬 Seeding stories and reels...');
  await prisma.story.create({
    data: {
      userId: alice.id,
      mediaUrl: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600',
      mediaType: 'image',
      text: 'Working on a new local web framework!'
    }
  });
  await prisma.story.create({
    data: {
      userId: emily.id,
      mediaUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600',
      mediaType: 'image',
      text: 'Fresh sourdough right out of the oven! 🍞'
    }
  });

  // Reels
  await prisma.reel.create({
    data: {
      userId: bob.id,
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-holding-a-cell-phone-looking-at-a-map-40626-large.mp4',
      caption: 'Finding the best local running spots in Bengaluru 🗺️🏃‍♂️'
    }
  });
  await prisma.reel.create({
    data: {
      userId: dan.id,
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-photographer-capturing-photos-of-nature-34138-large.mp4',
      caption: 'Golden hour in San Francisco, capturing the fog roll in'
    }
  });
  console.log('✅ Stories and reels added.');

  // 7. Seeding Groups & Members
  console.log('👥 Seeding groups...');
  const group1 = await prisma.group.create({
    data: {
      name: 'Indiranagar Tech Club',
      description: 'A community of developers, designers, and tech innovators living around Indiranagar. Monthly meetups, hackathons, and networking sessions.',
      category: 'interest',
      type: 'PUBLIC',
      avatar: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=150',
      coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
      country: 'India',
      state: 'Karnataka',
      city: 'Bengaluru',
      district: 'Urban Bangalore',
      area: 'Indiranagar',
    }
  });

  await prisma.groupMember.create({
    data: { groupId: group1.id, userId: alice.id, isAdmin: true, isPending: false }
  });
  await prisma.groupMember.create({
    data: { groupId: group1.id, userId: bob.id, isAdmin: false, isPending: false }
  });
  await prisma.groupMember.create({
    data: { groupId: group1.id, userId: charlie.id, isAdmin: false, isPending: false }
  });

  const group2 = await prisma.group.create({
    data: {
      name: 'SF Mission District Eats',
      description: 'Exploring the best cafes, bakeries, burrito spots, and dining in the Mission and SoMa. Sharing recipes and hosting dinners.',
      category: 'interest',
      type: 'PUBLIC',
      avatar: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=150',
      coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
      country: 'USA',
      state: 'California',
      city: 'San Francisco',
      district: 'SF County',
      area: 'Mission District',
    }
  });

  await prisma.groupMember.create({
    data: { groupId: group2.id, userId: emily.id, isAdmin: true, isPending: false }
  });
  await prisma.groupMember.create({
    data: { groupId: group2.id, userId: dan.id, isAdmin: false, isPending: false }
  });
  console.log('✅ Seeded groups.');

  // 8. Seeding Events with RSVPs
  console.log('📅 Seeding events...');
  const event1 = await prisma.event.create({
    data: {
      groupId: group1.id,
      title: 'Local Connect Pitch & Hack',
      description: 'Bring your laptop, present your ideas, and collaborate on building products that serve our local neighborhood. Dinner and drinks will be served.',
      category: 'meetup',
      eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
      mediaUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600',
      country: 'India',
      state: 'Karnataka',
      city: 'Bengaluru',
      district: 'Urban Bangalore',
      area: 'Indiranagar',
      society: 'Indira Heights',
      address: 'Community Hall, 2nd Floor, Indira Heights, Indiranagar',
    }
  });

  await prisma.eventRSVP.create({
    data: { eventId: event1.id, userId: alice.id, status: 'going' }
  });
  await prisma.eventRSVP.create({
    data: { eventId: event1.id, userId: bob.id, status: 'going' }
  });
  await prisma.eventRSVP.create({
    data: { eventId: event1.id, userId: charlie.id, status: 'maybe' }
  });

  const event2 = await prisma.event.create({
    data: {
      groupId: group2.id,
      title: 'Mission District Sourdough Masterclass',
      description: 'Host Emily will teach you the fundamentals of starter maintenance, dough hydration, and baking the perfect crusty loaf at home.',
      category: 'workshop',
      eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
      mediaUrl: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=600',
      country: 'USA',
      state: 'California',
      city: 'San Francisco',
      district: 'SF County',
      area: 'Mission District',
      address: 'Emily\'s Loft Kitchen, 128 Guerrero St, San Francisco',
    }
  });

  await prisma.eventRSVP.create({
    data: { eventId: event2.id, userId: emily.id, status: 'going' }
  });
  await prisma.eventRSVP.create({
    data: { eventId: event2.id, userId: dan.id, status: 'going' }
  });
  console.log('✅ Seeded events.');

  // 9. Seeding Marketplace Listings
  console.log('🛒 Seeding marketplace listings...');
  await prisma.marketplaceListing.create({
    data: {
      userId: bob.id,
      title: 'Premium Adjustable Dumbbell Set (Pair)',
      description: 'Practically brand new, range from 2.5kg to 24kg. Extremely space efficient for home workouts. Pick up in Indiranagar.',
      price: 6500,
      type: 'SELL',
      condition: 'like_new',
      mediaUrls: 'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=600',
      country: 'India',
      state: 'Karnataka',
      city: 'Bengaluru',
      district: 'Urban Bangalore',
      area: 'Indiranagar',
    }
  });

  await prisma.marketplaceListing.create({
    data: {
      userId: alice.id,
      title: 'Trek Road Bike (54cm Frame)',
      description: 'Renting out my road bike for weekends. Complete with helmet, phone mount, and tire repair kit. Perfect for Nandi Hills rides.',
      price: 500,
      type: 'RENT',
      condition: 'good',
      mediaUrls: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600',
      country: 'India',
      state: 'Karnataka',
      city: 'Bengaluru',
      district: 'Urban Bangalore',
      area: 'Indiranagar',
    }
  });
  console.log('✅ Seeded marketplace.');

  // 10. Seeding Real-time Chat Messages
  console.log('💬 Seeding chat logs...');
  const room1 = await prisma.chatRoom.create({
    data: { isGroup: false }
  });

  await prisma.participant.create({
    data: { roomId: room1.id, userId: alice.id }
  });
  await prisma.participant.create({
    data: { roomId: room1.id, userId: bob.id }
  });

  await prisma.message.create({
    data: {
      roomId: room1.id,
      senderId: alice.id,
      content: 'Hey Bob, did you see the post about the workspace meet-up?',
      readBy: `${alice.id},${bob.id}`
    }
  });
  await prisma.message.create({
    data: {
      roomId: room1.id,
      senderId: bob.id,
      content: 'Yeah Alice! Just voted on the poll. Third Wave Coffee gets my vote, they have great wifi.',
      readBy: `${alice.id},${bob.id}`
    }
  });
  await prisma.message.create({
    data: {
      roomId: room1.id,
      senderId: alice.id,
      content: 'Awesome, let\'s wait for Charlie and check if he wants to join.',
      readBy: `${alice.id}`
    }
  });

  const room2 = await prisma.chatRoom.create({
    data: { isGroup: true, name: 'Indiranagar Tech Chat' }
  });

  await prisma.participant.create({
    data: { roomId: room2.id, userId: alice.id }
  });
  await prisma.participant.create({
    data: { roomId: room2.id, userId: bob.id }
  });
  await prisma.participant.create({
    data: { roomId: room2.id, userId: charlie.id }
  });

  await prisma.message.create({
    data: {
      roomId: room2.id,
      senderId: charlie.id,
      content: 'Welcome everyone to the official Tech Club group chat!',
      readBy: `${charlie.id},${alice.id},${bob.id}`
    }
  });
  console.log('✅ Seeded chat logs.');

  console.log('🎉 Database seeding complete successfully (SQLite)!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
