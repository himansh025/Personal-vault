import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import VaultItem from '@/models/VaultItem';
import { authService } from '@/lib/auth';
import { encryptionService } from '@/lib/crypto';

interface VaultItemData {
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  masterPassword: string;
}

// GET - Fetch all vault items for the current user
export async function GET(_request: NextRequest) {
  try {
    const user = await authService.getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const vaultItems = await VaultItem.find({ userId: user.userId }).sort({ createdAt: -1 });

    const items = vaultItems.map((item) => ({
      id: item._id.toString(),
      title: item.title,
      username: item.username,
      password: '••••••••', // Don't send encrypted password to client
      url: item.url,
      notes: item.notes,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));

    return NextResponse.json({ items });

  } catch (error) {
    console.error('Get vault items error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new vault item
export async function POST(request: NextRequest) {
  try {
    const user = await authService.getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body: VaultItemData = await request.json();
    const { title, username, password, url, notes, masterPassword } = body;

    if (!title || !username || !password || !masterPassword) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Encrypt the password before storing
    const encryptedPassword = encryptionService.encrypt(password, masterPassword);

    const newItem = await VaultItem.create({
      userId: user.userId,
      title,
      username,
      password: encryptedPassword,
      url: url || '',
      notes: notes || '',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const responseItem = {
      id: newItem._id.toString(),
      title: newItem.title,
      username: newItem.username,
      password: '••••••••',
      url: newItem.url,
      notes: newItem.notes,
      createdAt: newItem.createdAt,
      updatedAt: newItem.updatedAt
    };

    return NextResponse.json(
      { 
        item: responseItem,
        message: 'Password saved successfully' 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Create vault item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}