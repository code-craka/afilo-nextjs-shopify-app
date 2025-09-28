import { NextResponse } from 'next/server';
import { shopifyFetch } from '@/lib/shopify-server';

export async function POST(request: Request) {
  try {
    const { query, variables } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Missing GraphQL query.' }, { status: 400 });
    }

    const data = await shopifyFetch<any>(query, variables);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API Proxy Error:', error);

    // Check if it's a ShopifyServerError to get more details
    if (error.name === 'ShopifyServerError') {
      return NextResponse.json(
        {
          message: error.message,
          type: error.type,
          graphqlErrors: error.graphqlErrors,
        },
        { status: error.statusCode || 500 }
      );
    }

    // Generic error
    return NextResponse.json(
      { message: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}