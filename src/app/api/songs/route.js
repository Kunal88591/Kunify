import { supabase } from "@/app/lib/supabase";

export async function GET(request) {
  try {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: data || [],
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to fetch songs',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
