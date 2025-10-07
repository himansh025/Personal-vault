import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import VaultItem from '@/models/VaultItem';
import { authService } from '@/lib/auth';
import { encryptionService } from '@/lib/crypto';

interface UpdateData {
  title: string;
  username: string;
  url?: string;
  notes?: string;
  password?: string;
  updatedAt: Date;
}

// PUT - Update vault item
export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const user = await authService.getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { title, username, password, url, notes, masterPassword } = await request.json();
    const itemId = params.id;

    await connectToDatabase();

    // Find the item and verify ownership
    const existingItem = await VaultItem.findOne({ _id: itemId, userId: user.userId });
    if (!existingItem) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Prepare update data with proper typing
    const updateData: UpdateData = {
      title,
      username,
      url,
      notes,
      updatedAt: new Date()
    };

    // If password is being updated, encrypt it
    if (password && masterPassword) {
      updateData.password = encryptionService.encrypt(password, masterPassword);
    }

    const updatedItem = await VaultItem.findByIdAndUpdate(
      itemId,
      updateData,
      { new: true }
    );

    if (!updatedItem) {
      return NextResponse.json(
        { error: 'Failed to update item' },
        { status: 500 }
      );
    }

    const responseItem = {
      id: updatedItem._id.toString(),
      title: updatedItem.title,
      username: updatedItem.username,
      password: '••••••••',
      url: updatedItem.url,
      notes: updatedItem.notes,
      createdAt: updatedItem.createdAt,
      updatedAt: updatedItem.updatedAt
    };

    return NextResponse.json(
      { item: responseItem, message: 'Password updated successfully' }
    );

  } catch (error) {
    console.error('Update vault item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete vault item
export async function DELETE(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const user = await authService.getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const itemId = params.id;

    await connectToDatabase();

    // Find the item and verify ownership
    const existingItem = await VaultItem.findOne({ _id: itemId, userId: user.userId });
    if (!existingItem) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    await VaultItem.findByIdAndDelete(itemId);

    return NextResponse.json(
      { message: 'Password deleted successfully' }
    );

  } catch (error) {
    console.error('Delete vault item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}