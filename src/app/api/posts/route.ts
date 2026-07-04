import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { content, type, mediaUrls, locationTag, latitude, longitude, pollOptions } = body;

    if (!content) {
      return NextResponse.json({ error: 'Post content cannot be empty' }, { status: 400 });
    }

    const serializedMediaUrls = Array.isArray(mediaUrls) ? mediaUrls.join(',') : '';

    // Create the post
    const post = await prisma.post.create({
      data: {
        userId: session.user.id,
        content,
        type: type || 'TEXT',
        mediaUrls: serializedMediaUrls,
        locationTag: locationTag || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        polls: pollOptions && Array.isArray(pollOptions) && type === 'POLL'
          ? {
              create: pollOptions.map((opt: string) => ({
                optionText: opt,
              })),
            }
          : undefined,
      },
      include: {
        polls: true,
      },
    });

    const formattedPost = {
      ...post,
      mediaUrls: post.mediaUrls ? post.mediaUrls.split(',').filter(Boolean) : [],
    };

    return NextResponse.json({ post: formattedPost }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    const posts = await prisma.post.findMany({
      where: userId ? { userId } : {},
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profile: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
        },
        likes: true,
        comments: {
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
          orderBy: { createdAt: 'asc' },
        },
        polls: true,
        votes: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedPosts = posts.map((post) => ({
      ...post,
      mediaUrls: post.mediaUrls ? post.mediaUrls.split(',').filter(Boolean) : [],
    }));

    return NextResponse.json({ posts: formattedPosts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
