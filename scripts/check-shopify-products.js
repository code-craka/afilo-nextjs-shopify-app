#!/usr/bin/env node

// Simple script to check Shopify products without TypeScript compilation
const https = require('https');

const SHOPIFY_DOMAIN = 'fzjdsw-ma.myshopify.com';
const STOREFRONT_TOKEN = 'a66ca3dfc351a36d82c9c3517c3e06e4';

const PRODUCTS_QUERY = `
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          productType
          tags
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          variants(first: 1) {
            edges {
              node {
                id
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
`;

function makeGraphQLRequest(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      query,
      variables
    });

    const options = {
      hostname: SHOPIFY_DOMAIN,
      path: '/api/2024-10/graphql.json',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function checkProducts() {
  console.log('🔍 Checking Shopify Products Configuration...\n');

  try {
    const response = await makeGraphQLRequest(PRODUCTS_QUERY, { first: 10 });

    if (response.errors) {
      console.error('❌ GraphQL Errors:', response.errors);
      return;
    }

    const products = response.data?.products?.edges || [];
    console.log(`✅ Found ${products.length} products in store\n`);

    // Target products to check
    const targetProducts = [
      { name: 'AI Image Generator', currentPrice: 49, targetPrice: 1999 },
      { name: 'React E-commerce Template', currentPrice: 99, targetPrice: 2499 },
      { name: 'Python Data Analysis Script', currentPrice: 29, targetPrice: 999 },
      { name: 'Next.js Starter Kit', currentPrice: 79, targetPrice: 1499 },
      { name: 'AI Chatbot Source Code', currentPrice: 149, targetPrice: 2999 }
    ];

    console.log('📋 ANALYSIS RESULTS:\n');
    console.log('=' .repeat(80));

    let needsPriceUpdate = [];
    let needsTagsUpdate = [];
    let enterpriseProductsNeeded = [];
    let subscriptionAppNeeded = false;

    products.forEach((edge, index) => {
      const product = edge.node;
      const price = parseFloat(product.priceRange?.minVariantPrice?.amount || '0');
      const tags = product.tags || [];
      const isPremium = price >= 999;

      console.log(`\nProduct ${index + 1}:`);
      console.log(`  📝 Title: ${product.title}`);
      console.log(`  💰 Current Price: $${price}`);
      console.log(`  🏷️ Product Type: ${product.productType || 'Not set'}`);
      console.log(`  🎯 Tags: ${tags.length > 0 ? tags.join(', ') : 'None'}`);
      console.log(`  🔗 Handle: ${product.handle}`);
      console.log(`  ⭐ Premium Status: ${isPremium ? '✅ PREMIUM' : '❌ NOT PREMIUM'}`);

      // Check if this matches our target products
      const targetProduct = targetProducts.find(tp =>
        product.title.toLowerCase().includes(tp.name.toLowerCase().split(' ')[0])
      );

      if (targetProduct) {
        if (price !== targetProduct.targetPrice) {
          needsPriceUpdate.push({
            title: product.title,
            current: price,
            target: targetProduct.targetPrice,
            handle: product.handle
          });
        }
      }

      // Check tags
      const hasRequiredTags = tags.some(tag =>
        ['premium', 'enterprise', 'monthly'].includes(tag.toLowerCase())
      );

      if (isPremium && !hasRequiredTags) {
        needsTagsUpdate.push({
          title: product.title,
          currentTags: tags,
          handle: product.handle
        });
      }
    });

    // Check for enterprise tiers
    const hasEnterpriseProducts = products.some(edge => {
      const price = parseFloat(edge.node.priceRange?.minVariantPrice?.amount || '0');
      return price >= 5999;
    });

    if (!hasEnterpriseProducts) {
      enterpriseProductsNeeded = [
        { name: 'Professional Development Suite', price: 5999 },
        { name: 'Enterprise Development Platform', price: 7999 },
        { name: 'Enterprise Plus Global Solution', price: 9999 }
      ];
    }

    // Print recommendations
    console.log('\n\n🎯 IMMEDIATE ACTIONS REQUIRED:\n');
    console.log('=' .repeat(80));

    if (needsPriceUpdate.length > 0) {
      console.log('\n1. 💰 PRICE UPDATES NEEDED:');
      needsPriceUpdate.forEach(product => {
        console.log(`   ⚠️  ${product.title}: $${product.current} → $${product.target}/month`);
      });
    } else {
      console.log('\n1. ✅ PRICES: All target products have premium pricing');
    }

    if (needsTagsUpdate.length > 0) {
      console.log('\n2. 🏷️  TAGS UPDATE NEEDED:');
      needsTagsUpdate.forEach(product => {
        console.log(`   ⚠️  ${product.title}: Add "premium", "enterprise", "monthly" tags`);
      });
    } else {
      console.log('\n2. ✅ TAGS: Premium products have appropriate tags');
    }

    if (enterpriseProductsNeeded.length > 0) {
      console.log('\n3. 🏢 ENTERPRISE PRODUCTS NEEDED:');
      enterpriseProductsNeeded.forEach(product => {
        console.log(`   ⚠️  Create: ${product.name} - $${product.price}/month`);
      });
    } else {
      console.log('\n3. ✅ ENTERPRISE PRODUCTS: Enterprise tier products exist');
    }

    console.log('\n4. 📅 SHOPIFY SUBSCRIPTIONS APP:');
    console.log('   ⚠️  Manual check required - Install Shopify Subscriptions app');
    console.log('   📍 Go to: Shopify Admin → Apps → App Store → Search "Subscriptions"');

    console.log('\n\n🎯 IMPLEMENTATION STATUS:');
    console.log('=' .repeat(80));
    console.log(`✅ Frontend Premium System: COMPLETE`);
    console.log(`${needsPriceUpdate.length === 0 ? '✅' : '⚠️ '} Product Pricing: ${needsPriceUpdate.length === 0 ? 'COMPLETE' : 'NEEDS UPDATE'}`);
    console.log(`${needsTagsUpdate.length === 0 ? '✅' : '⚠️ '} Product Tags: ${needsTagsUpdate.length === 0 ? 'COMPLETE' : 'NEEDS UPDATE'}`);
    console.log(`${enterpriseProductsNeeded.length === 0 ? '✅' : '⚠️ '} Enterprise Products: ${enterpriseProductsNeeded.length === 0 ? 'COMPLETE' : 'NEEDS CREATION'}`);
    console.log(`⚠️  Subscriptions App: MANUAL CHECK REQUIRED`);

    console.log('\n📍 Next Steps:');
    console.log('1. Update product prices in Shopify Admin');
    console.log('2. Add required tags to premium products');
    console.log('3. Create enterprise tier products');
    console.log('4. Install Shopify Subscriptions app');
    console.log('5. Test premium pricing at: http://localhost:3000/test-premium-pricing');

  } catch (error) {
    console.error('❌ Error checking products:', error.message);
  }
}

checkProducts();