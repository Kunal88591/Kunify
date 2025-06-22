import { supabase } from '../../../lib/supabase';

export async function DELETE(request, { params }) {
  const songId = params.id;

  if (
    !songId ||
    !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(songId)
  ) {
    return new Response(
      JSON.stringify({ error: 'Invalid song ID format' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const { data: song, error: fetchError } = await supabase
      .from('songs')
      .select('file_path')
      .eq('id', songId)
      .single();

    if (fetchError || !song) {
      throw new Error(fetchError?.message || 'Song not found');
    }

    const { error: deleteError } = await supabase
      .from('songs')
      .delete()
      .eq('id', songId);

    if (deleteError) throw deleteError;

    const { error: storageError } = await supabase.storage
      .from('music')
      .remove([song.file_path]);

    if (storageError) {
      console.error('Failed to delete file from storage:', storageError);
    }

    return new Response(null, {
      status: 204,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('Delete error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to delete song',
        ...(process.env.NODE_ENV === 'development' && { details: error.stack }),
      }),
      {
        status: error.status || 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      Allow: 'DELETE, OPTIONS',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}