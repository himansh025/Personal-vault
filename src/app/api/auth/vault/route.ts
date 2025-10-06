import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import VaultItem from '@/models/VaultItem';
import { authService } from '@/lib/auth';
import { encryptionService } from '@/lib/crypto';

interface Params {
  id: string;
}

// PUT - Update a vault item
export async function PUT(request: NextRequest, context: { params: Params }) {
  const { params } = context;
  const itemId = params.id;

  const user = await authService.getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { title, username, password, url, notes, masterPassword } = await request.json();
  await connectToDatabase();

  const existingItem = await VaultItem.findOne({ _id: itemId, userId: user.userId });
  if (!existingItem) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

  const updateData: any = { title, username, url, notes, updatedAt: new Date() };
  if (password && masterPassword) {
    updateData.password = encryptionService.encrypt(password, masterPassword);
  }

  const updatedItem = await VaultItem.findByIdAndUpdate(itemId, updateData, { new: true });

  return NextResponse.json({
    item: {
      id: updatedItem._id.toString(),
      title: updatedItem.title,
      username: updatedItem.username,
      password: '••••••••',
      url: updatedItem.url,
      notes: updatedItem.notes,
      createdAt: updatedItem.createdAt,
      updatedAt: updatedItem.updatedAt
    },
    message: 'Password updated successfully'
  });
}

// DELETE - Delete a vault item
export async function DELETE(request: NextRequest, context: { params: Params }) {
  const { params } = context;
  const itemId = params.id;

  const user = await authService.getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  await connectToDatabase();
  const existingItem = await VaultItem.findOne({ _id: itemId, userId: user.userId });
  if (!existingItem) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

  await VaultItem.findByIdAndDelete(itemId);
  return NextResponse.json({ message: 'Password deleted successfully' });
}
