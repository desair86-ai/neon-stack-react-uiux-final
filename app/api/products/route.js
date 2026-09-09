import { NextResponse } from 'next/server';
import { getProducts } from '../../../src/lib/api';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const category = new URL(request.url).searchParams.get('category');
  if (category !== 'uv-printed') {
    return NextResponse.json({ message: 'Only the UV Printed category is available through this route.' }, { status: 400 });
  }

  try {
    return NextResponse.json(await getProducts(category));
  } catch (error) {
    return NextResponse.json({ message: error.message || 'Unable to load products.' }, { status: 502 });
  }
}
