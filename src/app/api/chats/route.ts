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

    const userId = session.user.id;

    // Find rooms where the user is a participant
    const rooms = await prisma.chatRoom.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      include: {
        participants: {
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
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ rooms });
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
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
    const { isGroup, name, avatar, recipientId } = body;

    // If it's a 1-to-1 room, check if they are already connected in a room
    if (!isGroup) {
      if (!recipientId) {
        return NextResponse.json({ error: 'Recipient ID is required for 1-to-1 chats' }, { status: 400 });
      }

      const existingRoom = await prisma.chatRoom.findFirst({
        where: {
          isGroup: false,
          AND: [
            { participants: { some: { userId: session.user.id } } },
            { participants: { some: { userId: recipientId } } },
          ],
        },
        include: {
          participants: {
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
            },
          },
        },
      });

      if (existingRoom) {
        return NextResponse.json({ room: existingRoom });
      }

      // Create new 1-to-1 room
      const newRoom = await prisma.chatRoom.create({
        data: {
          isGroup: false,
          participants: {
            create: [
              { userId: session.user.id },
              { userId: recipientId },
            ],
          },
        },
        include: {
          participants: {
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
            },
          },
        },
      });

      return NextResponse.json({ room: newRoom }, { status: 201 });
    }

    // Create a group room
    if (!name) {
      return NextResponse.json({ error: 'Group name is required' }, { status: 400 });
    }

    const newGroupRoom = await prisma.chatRoom.create({
      data: {
        isGroup: true,
        name,
        avatar,
        participants: {
          create: [{ userId: session.user.id }], // Admin starts as the first member
        },
      },
      include: {
        participants: {
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
          },
        },
      },
    });

    return NextResponse.json({ room: newGroupRoom }, { status: 201 });
  } catch (error) {
    console.error('Error creating chat room:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
