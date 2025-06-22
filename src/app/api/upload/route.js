import { supabase } from '../../lib/supabase';

const SUPPORTED_AUDIO_TYPES = [
  'audio/mpeg', // MP3
  'audio/wav',
  'audio/ogg',
  'audio/x-m4a',
  'audio/aac',
];

export async function POST(request) {
  const contentType = request.headers.get('content-type');
  if (!contentType?.includes('multipart/form-data')) {
    return Response.json(
      { error: 'Invalid content type. Expected multipart/form-data' },
      { status: 415 }
    );
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!file) {
    return Response.json({ error: 'No file provided' }, { status: 400 });
  }

  if (!SUPPORTED_AUDIO_TYPES.includes(file.type)) {
    return Response.json(
      {
        error:
          'Unsupported file type. Please upload an audio file (MP3, WAV, OGG, M4A, AAC)',
      },
      { status: 400 }
    );
  }

  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
  if (file.size > MAX_FILE_SIZE) {
    return Response.json(
      { error: 'File size exceeds maximum limit of 20MB' },
      { status: 400 }
    );
  }

  try {
    const fileExtension = file.name.split('.').pop();
    const fileName = `uploads/${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)}.${fileExtension}`;

    const { data: storageData, error: storageError } = await supabase.storage
      .from('music')
      .upload(fileName, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (storageError) {
      console.error('❌ Storage upload error:', storageError);
      throw new Error(storageError.message || 'Upload to storage failed');
    }

    const { data: publicData } = supabase.storage
      .from('music')
      .getPublicUrl(fileName);

    const publicUrl = publicData?.publicUrl;

    const originalName = file.name.replace(/\.[^/.]+$/, '');

    const { data: dbData, error: dbError } = await supabase
      .from('songs')
      .insert([
        {
          title: originalName,
          file_path: fileName,
          public_url: publicUrl,
          file_type: file.type,
          file_size: file.size,
          uploaded_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (dbError) {
      await supabase.storage.from('music').remove([fileName]);
      console.error('❌ Database insert error:', dbError);
      throw new Error(dbError.message || 'Insert into database failed');
    }

    return Response.json(
      {
        success: true,
        data: dbData,
        message: 'File uploaded successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Upload error:', error);
    return Response.json(
      {
        error: error.message || 'Failed to upload file',
        details:
          process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      Allow: 'POST, OPTIONS',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
