import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const resolvedParams = await params;
    const backendPath = resolvedParams.path.join('/');
    const backendUrl = `http://46.225.29.192:8000/api/${backendPath}`;

    try {
        const response = await fetch(backendUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            console.error(`Backend returned ${response.status} for ${backendUrl}`);
            return NextResponse.json(
                { error: 'Backend error' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error(`Proxy Request Error for ${backendUrl}:`, error);
        return NextResponse.json(
            { error: 'Internal Server Error fetching from backend' },
            { status: 500 }
        );
    }
}
