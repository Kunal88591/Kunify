import { supabase } from '../../../lib/supabase';



export async function DELETE(request, { params }) {
  const songId = params.id;
  // const userId = request.headers.get('x-user-id'); // Uncomment when you add auth

  // Verify admin status (optional, uncomment when you add auth)
  /*
  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();

  if (roleError || roleData?.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Admin access required' }), { status: 403 });
  }
  */

  // Delete song
  const { error } = await supabase
    .from('songs')
    .delete()
    .eq('id', songId);
  
  if (error) return new Response(JSON.stringify({ error }), { status: 500 });
  return new Response(null, { status: 204 });
}
