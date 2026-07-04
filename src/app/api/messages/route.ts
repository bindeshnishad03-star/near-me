import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');

    if (!roomId) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
    }

    // Verify user is a participant of this room
    const isParticipant = await prisma.participant.findFirst({
      where: {
        roomId,
        userId: session.user.id,
      },
    });

    if (!isParticipant) {
      return NextResponse.json({ error: 'Not authorized to access this chat room' }, { status: 403 });
    }

    // Fetch messages
    const messages = await prisma.message.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' },
    });

    // Mark messages as read by this user on SQLite (sequential update to keep it compatible)
    for (const msg of messages) {
      const readSet = new Set(msg.readBy ? msg.readBy.split(',').filter(Boolean) : []);
      if (!readSet.has(session.user.id)) {
        readSet.add(session.user.id);
        await prisma.message.update({
          where: { id: msg.id },
          data: {
            readBy: Array.from(readSet).join(','),
          },
        });
      }
    }

    const formattedMessages = messages.map((msg) => ({
      ...msg,
      readBy: msg.readBy ? msg.readBy.split(',').filter(Boolean) : [],
    }));

    return NextResponse.json({ messages: formattedMessages });
  } catch (error) {
    console.error('Error fetching messages:', error);
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
    const { roomId, content, mediaUrl, mediaType } = body;

    if (!roomId || (!content && !mediaUrl)) {
      return NextResponse.json({ error: 'Room ID and content/media are required' }, { status: 400 });
    }

    // Verify user is participant
    const isParticipant = await prisma.participant.findFirst({
      where: {
        roomId,
        userId: session.user.id,
      },
    });

    if (!isParticipant) {
      return NextResponse.json({ error: 'Not authorized to send messages to this room' }, { status: 403 });
    }

    const message = await prisma.message.create({
      data: {
        roomId,
        senderId: session.user.id,
        content: content || '',
        mediaUrl: mediaUrl || null,
        mediaType: mediaType || null,
        readBy: session.user.id, // Initial read by sender
      },
    });

    const formattedMessage = {
      ...message,
      readBy: [session.user.id],
    };

    return NextResponse.json({ message: formattedMessage }, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
