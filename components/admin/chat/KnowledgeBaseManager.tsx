/**
 * Knowledge Base Manager Component
 *
 * Features:
 * - List all KB articles
 * - Trigger website crawl
 * - View crawl status
 * - Create/Edit/Delete KB entries
 * - View article metadata
 * - Search articles
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Database,
  Globe,
  Plus,
  Trash2,
  Edit,
  RefreshCw,
  Search,
  Clock,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Loader,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface KBArticle {
  id: string;
  url: string;
  title: string;
  content: string;
  last_crawled_at: string;
  created_at: string;
  metadata?: {
    wordCount?: number;
    crawlDuration?: number;
  };
}

interface CrawlStatus {
  status: 'idle' | 'crawling' | 'completed' | 'error';
  progress?: {
    total: number;
    crawled: number;
    failed: number;
  };
  lastCrawl?: string;
  error?: string;
}

export default function KnowledgeBaseManager() {
  const [articles, setArticles] = useState<KBArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [crawlStatus, setCrawlStatus] = useState<CrawlStatus>({ status: 'idle' });

  // Modal states
  const [editingArticle, setEditingArticle] = useState<KBArticle | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    content: '',
  });

  useEffect(() => {
    fetchArticles();
    fetchCrawlStatus();
  }, []);

  async function fetchArticles() {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/knowledge-base');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setArticles(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast.error('Failed to load articles');
    } finally {
      setLoading(false);
    }
  }

  async function fetchCrawlStatus() {
    try {
      const response = await fetch('/api/admin/knowledge-base/crawl');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCrawlStatus(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching crawl status:', error);
    }
  }

  async function handleStartCrawl() {
    try {
      setCrawlStatus({ status: 'crawling' });
      toast.loading('Starting website crawl...', { id: 'crawl' });

      const response = await fetch('/api/admin/knowledge-base/crawl', {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Crawl completed successfully!', { id: 'crawl' });
        fetchArticles();
        fetchCrawlStatus();
      } else {
        toast.error('Crawl failed', { id: 'crawl' });
        setCrawlStatus({ status: 'error' });
      }
    } catch (error) {
      console.error('Error starting crawl:', error);
      toast.error('Failed to start crawl', { id: 'crawl' });
      setCrawlStatus({ status: 'error' });
    }
  }

  async function handleCreateArticle() {
    if (!formData.url || !formData.title || !formData.content) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('/api/admin/knowledge-base', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Article created successfully');
        setIsCreating(false);
        setFormData({ url: '', title: '', content: '' });
        fetchArticles();
      } else {
        toast.error('Failed to create article');
      }
    } catch (error) {
      console.error('Error creating article:', error);
      toast.error('Failed to create article');
    }
  }

  async function handleUpdateArticle() {
    if (!editingArticle) return;

    try {
      const response = await fetch(`/api/admin/knowledge-base/${editingArticle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Article updated successfully');
        setEditingArticle(null);
        setFormData({ url: '', title: '', content: '' });
        fetchArticles();
      } else {
        toast.error('Failed to update article');
      }
    } catch (error) {
      console.error('Error updating article:', error);
      toast.error('Failed to update article');
    }
  }

  async function handleDeleteArticle(id: string) {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      const response = await fetch(`/api/admin/knowledge-base/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Article deleted successfully');
        fetchArticles();
      } else {
        toast.error('Failed to delete article');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error('Failed to delete article');
    }
  }

  function openEditModal(article: KBArticle) {
    setEditingArticle(article);
    setFormData({
      url: article.url,
      title: article.title,
      content: article.content,
    });
  }

  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(search.toLowerCase()) ||
      article.url.toLowerCase().includes(search.toLowerCase()) ||
      article.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Crawl Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/80 rounded-2xl p-6 shadow-xl border border-white/50"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Website Crawler</h3>
              <div className="flex items-center gap-2 mt-1">
                {crawlStatus.status === 'crawling' ? (
                  <>
                    <Loader className="h-4 w-4 text-blue-600 animate-spin" />
                    <span className="text-sm text-blue-600 font-medium">Crawling...</span>
                  </>
                ) : crawlStatus.status === 'completed' ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">Last crawl successful</span>
                  </>
                ) : crawlStatus.status === 'error' ? (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-600 font-medium">Crawl failed</span>
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {crawlStatus.lastCrawl
                        ? `Last crawl: ${new Date(crawlStatus.lastCrawl).toLocaleString()}`
                        : 'No crawl yet'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={handleStartCrawl}
            disabled={crawlStatus.status === 'crawling'}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-5 w-5 ${crawlStatus.status === 'crawling' ? 'animate-spin' : ''}`} />
            {crawlStatus.status === 'crawling' ? 'Crawling...' : 'Start Crawl'}
          </button>
        </div>

        {crawlStatus.progress && (
          <div className="mt-4 p-4 bg-blue-50 rounded-xl">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Progress</span>
              <span className="font-semibold text-gray-900">
                {crawlStatus.progress.crawled} / {crawlStatus.progress.total} pages
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all"
                style={{
                  width: `${
                    (crawlStatus.progress.crawled / crawlStatus.progress.total) * 100
                  }%`,
                }}
              />
            </div>
            {crawlStatus.progress.failed > 0 && (
              <p className="text-xs text-red-600 mt-2">
                {crawlStatus.progress.failed} pages failed
              </p>
            )}
          </div>
        )}
      </motion.div>

      {/* Search and Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="backdrop-blur-xl bg-white/80 rounded-2xl p-6 shadow-xl border border-white/50"
      >
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles by title, URL, or content..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => {
              setIsCreating(true);
              setFormData({ url: '', title: '', content: '' });
            }}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all whitespace-nowrap"
          >
            <Plus className="h-5 w-5" />
            Add Article
          </button>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} found
        </div>
      </motion.div>

      {/* Articles Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {loading ? (
          <div className="col-span-2 flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent mb-4" />
              <p className="text-gray-600">Loading articles...</p>
            </div>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="col-span-2 backdrop-blur-xl bg-white/80 rounded-2xl p-12 shadow-xl border border-white/50 text-center">
            <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No articles found</p>
            <button
              onClick={() => setIsCreating(true)}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Add Your First Article
            </button>
          </div>
        ) : (
          filteredArticles.map((article) => (
            <div
              key={article.id}
              className="backdrop-blur-xl bg-white/80 rounded-2xl p-6 shadow-xl border border-white/50 hover:shadow-2xl transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-bold text-gray-900 mb-2 truncate">
                    {article.title}
                  </h4>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline truncate"
                  >
                    <ExternalLink className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{article.url}</span>
                  </a>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => openEditModal(article)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit article"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteArticle(article.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete article"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600 line-clamp-3 mb-4">{article.content}</p>

              <div className="flex items-center gap-4 text-xs text-gray-500 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Last crawled: {new Date(article.last_crawled_at).toLocaleDateString()}
                </div>
                {article.metadata?.wordCount && (
                  <div>{article.metadata.wordCount} words</div>
                )}
              </div>
            </div>
          ))
        )}
      </motion.div>

      {/* Create/Edit Modal */}
      {(isCreating || editingArticle) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {isCreating ? 'Add New Article' : 'Edit Article'}
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com/article"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Article title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Article content..."
                  rows={10}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingArticle(null);
                  setFormData({ url: '', title: '', content: '' });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={isCreating ? handleCreateArticle : handleUpdateArticle}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                {isCreating ? 'Create Article' : 'Update Article'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
