import { NextRequest, NextResponse } from 'next/server';
import { supabaseHelpers } from '@/lib/supabase';
import { requireAuth, validateRequestBody } from '@/lib/auth';
import { validateNoteCreation } from '@/lib/usage-limits';
import { ApiResponse, NotesResponse, CreateNoteData, UpdateNoteData } from '@/types/database';

// GET /api/notes - List all notes for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const userPlan = await supabaseHelpers.getUserWithPlan(user.id);
    const notes = await supabaseHelpers.getNotes(user.id);
    const currentCount = await supabaseHelpers.getNotesCount(user.id);
    
    const limit = userPlan.subscription_plan === 'pro' ? Infinity : 10;
    
    const response: ApiResponse<NotesResponse> = {
      success: true,
      data: {
        notes,
        count: currentCount,
        limit
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    console.error('Error fetching notes:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to fetch notes'
    }, { status: 500 });
  }
}

// POST /api/notes - Create a new note
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body: CreateNoteData = await request.json();

    // Validate input
    const validation = validateRequestBody(body, ['title', 'content']);
    if (!validation.isValid) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: validation.error
      }, { status: 400 });
    }

    // Check usage limits
    const limitValidation = await validateNoteCreation(user.id);
    if (!limitValidation.isValid) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: limitValidation.error,
        message: limitValidation.message
      }, { status: 403 });
    }

    const note = await supabaseHelpers.createNote(user.id, body.title.trim(), body.content.trim());
    
    return NextResponse.json<ApiResponse>({
      success: true,
      data: note,
      message: 'Note created successfully'
    });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    console.error('Error creating note:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to create note'
    }, { status: 500 });
  }
}

// PUT /api/notes - Update a note (expects id in query parameters)
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const url = new URL(request.url);
    const noteId = url.searchParams.get('id');
    
    if (!noteId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Note ID is required'
      }, { status: 400 });
    }

    const body: UpdateNoteData = await request.json();
    const { title, content } = body;

    // Validate input
    if (!title && !content) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Title or content is required for update'
      }, { status: 400 });
    }

    // Check if note belongs to user
    const existingNote = await supabaseHelpers.getNote(noteId);
    if (existingNote.user_id !== user.id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Access denied. Note not found or you do not have permission to update it.'
      }, { status: 403 });
    }

    // Validate and prepare updates
    const updates: { title?: string; content?: string } = {};
    if (title !== undefined) {
      if (title.trim().length === 0) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Title cannot be empty'
        }, { status: 400 });
      }
      updates.title = title.trim();
    }
    
    if (content !== undefined) {
      if (content.trim().length === 0) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Content cannot be empty'
        }, { status: 400 });
      }
      updates.content = content.trim();
    }

    const updatedNote = await supabaseHelpers.updateNote(noteId, updates);
    
    return NextResponse.json<ApiResponse>({
      success: true,
      data: updatedNote,
      message: 'Note updated successfully'
    });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    console.error('Error updating note:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to update note'
    }, { status: 500 });
  }
}

// DELETE /api/notes - Delete a note (expects id in query parameters)
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const url = new URL(request.url);
    const noteId = url.searchParams.get('id');
    
    if (!noteId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Note ID is required'
      }, { status: 400 });
    }

    // Check if note belongs to user
    const existingNote = await supabaseHelpers.getNote(noteId);
    if (existingNote.user_id !== user.id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Access denied. Note not found or you do not have permission to delete it.'
      }, { status: 403 });
    }

    await supabaseHelpers.deleteNote(noteId);
    
    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    console.error('Error deleting note:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to delete note'
    }, { status: 500 });
  }
}
