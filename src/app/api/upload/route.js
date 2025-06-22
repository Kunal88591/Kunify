import { supabase } from '../../lib/supabase';

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get('file');
  
  if (!file) {
    return Response.json({ error: 'No file provided' }, { status: 400 });
  }

  try {
    const fileName = `uploads/${Date.now()}-${file.name}`;
    
    const { data: storageData, error: storageError } = await supabase.storage
      .from('music')
      .upload(fileName, file, {
        contentType: file.type, // Critical for file type recognition
        cacheControl: '3600',
      });
    
    if (storageError) throw storageError;

    const { data: dbData, error: dbError } = await supabase
      .from('songs')
      .insert([{
        title: file.name,
        file_path: storageData.path,
        file_type: file.type // Store file type in DB
      }])
      .single();
    
    if (dbError) throw dbError;

    return Response.json(dbData, { status: 201 });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
