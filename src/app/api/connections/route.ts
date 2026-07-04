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

    // Fetch user connections (accepted and pending)
    const connections = await prisma.connection.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            profile: {
              select: {
                name: true,
                avatar: true,
                city: true,
                area: true,
              },
            },
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            profile: {
              select: {
                name: true,
                avatar: true,
                city: true,
                area: true,
              },
            },
          },
        },
      },
    });

    const accepted = connections.filter((c) => c.status === 'ACCEPTED');
    const pendingIncoming = connections.filter((c) => c.status === 'PENDING' && c.receiverId === userId);
    const pendingOutgoing = connections.filter((c) => c.status === 'PENDING' && c.senderId === userId);

    return NextResponse.json({
      connections: {
        accepted,
        pendingIncoming,
        pendingOutgoing,
      },
    });
  } catch (error) {
    console.error('Error fetching connections:', error);
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
    const { receiverId } = body;

    if (!receiverId) {
      return NextResponse.json({ error: 'Receiver ID is required' }, { status: 400 });
    }

    if (receiverId === session.user.id) {
      return NextResponse.json({ error: 'Cannot connect with yourself' }, { status: 400 });
    }

    // Check if a connection already exists
    const existing = await prisma.connection.findFirst({
      where: {
        OR: [
          { senderId: session.user.id, receiverId },
          { senderId: receiverId, receiverId: session.user.id },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Connection or request already exists', status: existing.status },
        { status: 400 }
      );
    }

    const connection = await prisma.connection.create({
      data: {
        senderId: session.user.id,
        receiverId,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ connection }, { status: 201 });
  } catch (error) {
    console.error('Error creating connection request:', error);
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
    const { connectionId, status } = body; // status: ACCEPTED, BLOCKED, REJECTED

    if (!connectionId || !status) {
      return NextResponse.json({ error: 'Connection ID and status are required' }, { status: 400 });
    }

    const connection = await prisma.connection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    // Verify authorized user is updating (only receiver can ACCEPT/REJECT, either can BLOCK)
    if (status === 'ACCEPTED' || status === 'REJECTED') {
      if (connection.receiverId !== session.user.id) {
        return NextResponse.json({ error: 'Only the receiver can accept or reject requests' }, { status: 403 });
      }
    }

    if (status === 'REJECTED') {
      // Just delete the connection row
      await prisma.connection.delete({
        where: { id: connectionId },
      });
      return NextResponse.json({ message: 'Request rejected and removed' });
    }

    const updated = await prisma.connection.update({
      where: { id: connectionId },
      data: { status },
    });

    return NextResponse.json({ connection: updated });
  } catch (error) {
    console.error('Error updating connection:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
