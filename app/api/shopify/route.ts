import { NextResponse } from 'next/server';
import { shopifyFetch } from '@/lib/shopify';

export async function POST(request: Request) {
  try {
    const { query, variables } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Missing GraphQL query.' },
        { status: 400 }
      );
    }

    const data = await shopifyFetch(query, variables);

    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    console.error('API Proxy Error:', error);

    if (error instanceof Error && error.name === 'ShopifyServerError') {
      const shopifyError = error as Error & {
        statusCode?: number;
        type?: string;
        graphqlErrors?: unknown[];
      };

      return NextResponse.json(
        {
          message: shopifyError.message,
          type: shopifyError.type,
          graphqlErrors: shopifyError.graphqlErrors ?? null,
        },
        { status: shopifyError.statusCode || 500 }
      );
    }

    // fallback generic error
    return NextResponse.json(
      { message: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}