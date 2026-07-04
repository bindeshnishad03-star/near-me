import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id: postId } = resolvedParams;
    const body = await req.json();
    const { optionId } = body;

    if (!optionId) {
      return NextResponse.json({ error: 'Option ID is required' }, { status: 400 });
    }

    // Check if user has already voted on this post
    const existingVote = await prisma.pollVote.findFirst({
      where: {
        userId: session.user.id,
        postId: postId,
      },
    });

    if (existingVote) {
      return NextResponse.json({ error: 'You have already voted on this poll' }, { status: 400 });
    }

    const vote = await prisma.pollVote.create({
      data: {
        userId: session.user.id,
        postId: postId,
        optionId: optionId,
      },
    });

    return NextResponse.json({ vote }, { status: 201 });
  } catch (error) {
    console.error('Error voting on poll:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
