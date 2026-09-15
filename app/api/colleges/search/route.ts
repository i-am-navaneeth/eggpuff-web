import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim();

  console.log('🔎 COLLEGE API QUERY:', q);

  if (!q) {
    return NextResponse.json({
      source: 'none',
      results: [],
    });
  }

  try {
    const url =
      `http://universities.hipolabs.com/search?name=${encodeURIComponent(q)}`;

    console.log('🌐 HIPO URL:', url);

    const response = await fetch(url, {
      cache: 'no-store',
    });

    console.log('🌐 HIPO STATUS:', response.status);

    const data = await response.json();

    console.log('🌐 HIPO DATA:', data);

    if (!Array.isArray(data)) {
      console.error('❌ HIPO DID NOT RETURN ARRAY');

      return NextResponse.json({
        source: 'hipo',
        results: [],
      });
    }

    const results = data.map((college: any) => ({
      name: college.name,
      country: college.country,
      state_province: college['state-province'] ?? null,
      alpha_two_code: college.alpha_two_code ?? null,
      domains: college.domains ?? [],
      web_pages: college.web_pages ?? [],
    }));

    console.log('✅ HIPO RESULTS:', results);

    return NextResponse.json({
      source: 'hipo',
      results,
    });
  } catch (error) {
    console.error('❌ HIPO FETCH ERROR:', error);

    return NextResponse.json({
      source: 'none',
      results: [],
    });
  }
}