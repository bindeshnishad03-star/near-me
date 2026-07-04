import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city');
    const category = searchParams.get('category');

    const groups = await prisma.group.findMany({
      where: {
        AND: [
          city ? { city: { equals: city } } : {},
          category ? { category: { equals: category } } : {},
        ],
      },
      include: {
        _count: {
          select: { members: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ groups });
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, category, type, country, state, city, district, area, avatar, coverImage } = body;

    if (!name || !category || !country || !state || !city) {
      return NextResponse.json(
        { error: 'Name, Category, Country, State, and City are required fields' },
        { status: 400 }
      );
    }

    const group = await prisma.group.create({
      data: {
        name,
        description,
        category,
        type: type || 'PUBLIC',
        country,
        state,
        city,
        district,
        area,
        avatar,
        coverImage,
        members: {
          create: [
            {
              userId: session.user.id,
              isAdmin: true,
              isMod: true,
              isPending: false,
            },
          ],
        },
      },
    });

    return NextResponse.json({ group }, { status: 201 });
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
