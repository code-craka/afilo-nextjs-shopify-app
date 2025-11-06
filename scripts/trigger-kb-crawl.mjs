#!/usr/bin/env node

/**
 * Trigger Knowledge Base Crawl Script
 *
 * This script triggers the initial knowledge base crawl
 * by calling the admin API endpoint.
 */

import fetch from 'node-fetch';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const SITE_URL = 'https://afilo.io'; // The site to crawl
const API_BASE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function triggerKnowledgeBaseCrawl() {
  console.log('🕷️  Triggering Knowledge Base Crawl...');
  console.log(`📍 Target site: ${SITE_URL}`);
  console.log(`🔗 API endpoint: ${API_BASE}/api/admin/knowledge-base/crawl`);

  try {
    // Trigger the crawl
    const response = await fetch(`${API_BASE}/api/admin/knowledge-base/crawl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: SITE_URL,
        maxPages: 50, // Crawl up to 50 pages initially
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ HTTP ${response.status}: ${errorText}`);

      if (response.status === 401) {
        console.log('\n💡 Authentication required. Solutions:');
        console.log('   1. Start your dev server: pnpm dev');
        console.log('   2. Log in as admin user: rihan@techsci.xyz');
        console.log('   3. Navigate to: /dashboard/admin/chat');
        console.log('   4. Click "Knowledge Base" tab');
        console.log('   5. Click "Start Crawl" button');
      }

      return;
    }

    const result = await response.json();
    console.log('✅ Crawl triggered successfully!');
    console.log('📊 Crawl details:', result);

    // Check crawl status
    console.log('\n⏳ Checking crawl status...');
    await checkCrawlStatus();

  } catch (error) {
    console.error('❌ Error triggering crawl:', error.message);

    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Development server not running. Please:');
      console.log('   1. Start the dev server: pnpm dev');
      console.log('   2. Then re-run this script');
    }
  }
}

async function checkCrawlStatus() {
  try {
    const response = await fetch(`${API_BASE}/api/admin/knowledge-base/crawl`);

    if (response.ok) {
      const status = await response.json();
      console.log('📈 Current crawl status:', status);

      if (status.isRunning) {
        console.log('🔄 Crawl is currently running...');
        console.log(`📊 Progress: ${status.pagesProcessed || 0} pages processed`);
      } else {
        console.log('✅ Crawl completed or not running');
      }
    }
  } catch (error) {
    console.log('⚠️  Could not check crawl status:', error.message);
  }
}

async function manualInstructions() {
  console.log('\n📋 Manual Setup Instructions:');
  console.log('═'.repeat(50));
  console.log('1. Start your development server:');
  console.log('   pnpm dev');
  console.log('');
  console.log('2. Open your browser and navigate to:');
  console.log('   http://localhost:3000/dashboard/admin/chat');
  console.log('');
  console.log('3. Login with your admin account:');
  console.log('   rihan@techsci.xyz');
  console.log('');
  console.log('4. Click the "Knowledge Base" tab');
  console.log('');
  console.log('5. Click "Start Crawl" button');
  console.log('');
  console.log('6. The system will crawl https://afilo.io and create embeddings');
  console.log('');
  console.log('🎯 This one-time setup will enable AI-powered customer support!');
}

// Run the script
console.log('🚀 Knowledge Base Crawl Setup\\n');
await triggerKnowledgeBaseCrawl();
await manualInstructions();