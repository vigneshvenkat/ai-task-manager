import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import TaskModel from '@/models/Task';
import { validateCreateTask } from '@/lib/validations';
import type { CreateTaskInput } from '@/types';

export async function GET() {
  try {
    await connectToDatabase();
    const tasks = await TaskModel.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ tasks }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const validation = validateCreateTask(body);

    if (!validation.valid) {
      return NextResponse.json({ errors: validation.errors }, { status: 400 });
    }

    await connectToDatabase();
    const task = await TaskModel.create(body as CreateTaskInput);
    return NextResponse.json({ task }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
