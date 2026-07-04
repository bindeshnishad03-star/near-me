import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      include: { interests: true },
    });

    if (!profile) {
      return NextResponse.json({ profile: null });
    }

    // Format fields back to array for frontend compatibility
    const formattedProfile = {
      ...profile,
      languages: profile.languages ? profile.languages.split(',').filter(Boolean) : [],
      skills: profile.skills ? profile.skills.split(',').filter(Boolean) : [],
    };

    return NextResponse.json({ profile: formattedProfile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      bio,
      avatar,
      coverImage,
      profession,
      education,
      languages, // array of strings
      skills, // array of strings
      country,
      state,
      city,
      district,
      area,
      society,
      apartment,
      latitude,
      longitude,
      interests, // string array of interest names
      hideExactLocation,
      showOnlyCity,
    } = body;

    if (!name || !country || !state || !city) {
      return NextResponse.json(
        { error: 'Name, Country, State, and City are required fields' },
        { status: 400 }
      );
    }

    // Connect/create interests
    const interestConnects = [];
    if (interests && Array.isArray(interests)) {
      for (const name of interests) {
        const interest = await prisma.interest.upsert({
          where: { name },
          update: {},
          create: { name },
        });
        interestConnects.push({ id: interest.id });
      }
    }

    // Format skills and languages arrays as comma-separated strings
    const serializedLanguages = Array.isArray(languages) ? languages.join(',') : '';
    const serializedSkills = Array.isArray(skills) ? skills.join(',') : '';

    const updatedProfile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: {
        name,
        bio,
        avatar,
        coverImage,
        profession,
        education,
        languages: serializedLanguages,
        skills: serializedSkills,
        country,
        state,
        city,
        district,
        area,
        society,
        apartment,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        hideExactLocation: !!hideExactLocation,
        showOnlyCity: !!showOnlyCity,
        interests: {
          set: [], // clear existing connection
          connect: interestConnects,
        },
      },
      create: {
        userId: session.user.id,
        name,
        bio,
        avatar,
        coverImage,
        profession,
        education,
        languages: serializedLanguages,
        skills: serializedSkills,
        country,
        state,
        city,
        district,
        area,
        society,
        apartment,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        hideExactLocation: !!hideExactLocation,
        showOnlyCity: !!showOnlyCity,
        interests: {
          connect: interestConnects,
        },
      },
      include: {
        interests: true,
      },
    });

    const formattedProfile = {
      ...updatedProfile,
      languages: updatedProfile.languages ? updatedProfile.languages.split(',').filter(Boolean) : [],
      skills: updatedProfile.skills ? updatedProfile.skills.split(',').filter(Boolean) : [],
    };

    return NextResponse.json({ profile: formattedProfile });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
