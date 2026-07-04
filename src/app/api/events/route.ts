import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city');
    const category = searchParams.get('category');

    const events = await prisma.event.findMany({
      where: {
        AND: [
          city ? { city: { equals: city } } : {},
          category ? { category: { equals: category } } : {},
        ],
      },
      include: {
        rsvps: true,
        group: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { eventDate: 'asc' },
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
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
    const { title, description, category, eventDate, mediaUrl, country, state, city, district, area, society, address, groupId } = body;

    if (!title || !description || !category || !eventDate || !country || !state || !city || !address) {
      return NextResponse.json(
        { error: 'Title, Description, Category, Date, Country, State, City, and Address are required fields' },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        category,
        eventDate: new Date(eventDate),
        mediaUrl,
        country,
        state,
        city,
        district,
        area,
        society,
        address,
        groupId: groupId || null,
        rsvps: {
          create: [
            {
              userId: session.user.id,
              status: 'going',
            },
          ],
        },
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
