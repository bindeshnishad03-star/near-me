import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city');
    const type = searchParams.get('type'); // SELL, RENT, EXCHANGE
    const query = searchParams.get('q');

    const listings = await prisma.marketplaceListing.findMany({
      where: {
        AND: [
          city ? { city: { equals: city } } : {},
          type ? { type: type as any } : {},
          query
            ? {
                OR: [
                  { title: { contains: query } },
                  { description: { contains: query } },
                ],
              }
            : {},
        ],
      },
      include: {
        user: {
          select: {
            username: true,
            profile: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedListings = listings.map((item) => ({
      ...item,
      mediaUrls: item.mediaUrls ? item.mediaUrls.split(',').filter(Boolean) : [],
    }));

    return NextResponse.json({ listings: formattedListings });
  } catch (error) {
    console.error('Error fetching listings:', error);
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
    const { title, description, price, type, condition, mediaUrls, country, state, city, district, area } = body;

    if (!title || !description || price === undefined || !type || !condition || !country || !state || !city) {
      return NextResponse.json(
        { error: 'Title, Description, Price, Type, Condition, Country, State, and City are required fields' },
        { status: 400 }
      );
    }

    const serializedMediaUrls = Array.isArray(mediaUrls) ? mediaUrls.join(',') : '';

    const listing = await prisma.marketplaceListing.create({
      data: {
        userId: session.user.id,
        title,
        description,
        price: parseFloat(price),
        type,
        condition,
        mediaUrls: serializedMediaUrls,
        country,
        state,
        city,
        district,
        area,
      },
    });

    const formattedListing = {
      ...listing,
      mediaUrls: listing.mediaUrls ? listing.mediaUrls.split(',').filter(Boolean) : [],
    };

    return NextResponse.json({ listing: formattedListing }, { status: 201 });
  } catch (error) {
    console.error('Error creating listing:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
