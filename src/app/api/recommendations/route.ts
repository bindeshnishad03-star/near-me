import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Simple Haversine helper to calculate distance in km between two coordinate pairs
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Parse query params
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city') || '';
    const area = searchParams.get('area') || '';
    const society = searchParams.get('society') || '';
    const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null;
    const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null;
    const radius = searchParams.get('radius') ? parseFloat(searchParams.get('radius')!) : 10;
    const useGps = searchParams.get('useGps') === 'true';

    // 1. Fetch posts with author profiles and stats
    const allPosts = await prisma.post.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profile: {
              select: {
                name: true,
                avatar: true,
                city: true,
                area: true,
                society: true,
                latitude: true,
                longitude: true,
                interests: true,
              },
            },
          },
        },
        likes: true,
        comments: true,
        polls: true,
        votes: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // 2. Filter posts based on Location
    let recommendedPosts = allPosts;

    if (useGps && lat !== null && lng !== null) {
      // Coordinate Proximity matching
      recommendedPosts = allPosts.filter((post) => {
        // If post has coordinates, check distance
        if (post.latitude !== null && post.longitude !== null) {
          const dist = calculateDistance(lat, lng, post.latitude, post.longitude);
          return dist <= radius;
        }
        // Fallback to author's coordinates
        const profile = post.user?.profile;
        if (profile && profile.latitude !== null && profile.longitude !== null) {
          const dist = calculateDistance(lat, lng, profile.latitude, profile.longitude);
          return dist <= radius;
        }
        // Fallback: If no coordinates at all, matches if author is in same city
        return post.user?.profile?.city?.toLowerCase() === city.toLowerCase();
      });
    } else {
      // Hierarchical geographic tag matching (City, Area, Society)
      recommendedPosts = allPosts.filter((post) => {
        const postCity = post.user?.profile?.city || '';
        const postArea = post.user?.profile?.area || '';
        const postSociety = post.user?.profile?.society || '';

        // If specific society filter is selected
        if (society) {
          return postSociety.toLowerCase() === society.toLowerCase();
        }
        // If area filter is selected
        if (area) {
          return postArea.toLowerCase() === area.toLowerCase();
        }
        // Default to city matching
        if (city) {
          return postCity.toLowerCase() === city.toLowerCase();
        }
        return true;
      });
    }

    // 3. Fetch recommended connections (People living nearby with matching interests)
    let suggestedPeople: any[] = [];
    if (userId) {
      // Fetch current user's profile and connections to exclude them
      const userProfile = await prisma.profile.findUnique({
        where: { userId },
        include: { interests: true },
      });

      const userConnections = await prisma.connection.findMany({
        where: {
          OR: [{ senderId: userId }, { receiverId: userId }],
        },
      });

      const connectedUserIds = new Set(
        userConnections.map((c) => (c.senderId === userId ? c.receiverId : c.senderId))
      );
      connectedUserIds.add(userId); // exclude self

      // Query other profiles in the same city
      const otherProfiles = await prisma.profile.findMany({
        where: {
          userId: { notIn: Array.from(connectedUserIds) },
          city: city || userProfile?.city || undefined,
        },
        include: { interests: true },
      });

      // Calculate recommendation score based on overlapping interests and area
      const userInterestNames = new Set(userProfile?.interests.map((i) => i.name) || []);

      suggestedPeople = otherProfiles
        .map((p) => {
          let score = 0;
          
          // Add score for interest overlaps
          p.interests.forEach((interest) => {
            if (userInterestNames.has(interest.name)) {
              score += 2;
            }
          });

          // Add score if they reside in the exact same neighborhood
          if (p.area && userProfile?.area && p.area.toLowerCase() === userProfile.area.toLowerCase()) {
            score += 3;
          }

          // Add score if in the exact same society
          if (p.society && userProfile?.society && p.society.toLowerCase() === userProfile.society.toLowerCase()) {
            score += 5;
          }

          return { profile: p, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 5) // limit to top 5
        .map((item) => item.profile);
    }

    // 4. Fetch local groups
    const localGroups = await prisma.group.findMany({
      where: city ? { city: { equals: city } } : {},
      take: 4,
    });

    // 5. Fetch nearby events
    const localEvents = await prisma.event.findMany({
      where: city ? { city: { equals: city } } : {},
      include: { rsvps: true },
      take: 4,
      orderBy: { eventDate: 'asc' },
    });

    // 6. Fetch marketplace spotlight listings
    const localListings = await prisma.marketplaceListing.findMany({
      where: city ? { city: { equals: city } } : {},
      take: 4,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      posts: recommendedPosts,
      suggestedPeople,
      groups: localGroups,
      events: localEvents,
      listings: localListings,
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
