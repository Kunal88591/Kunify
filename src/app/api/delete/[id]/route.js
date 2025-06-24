export async function DELETE(request, { params }) {
  return new Response(
    JSON.stringify({ message: 'Only admin can delete songs.' }),
    {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    }
  );
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
