import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, Bookmark } from '../lib/supabase'
import { BookMarked, Plus, Trash2, ExternalLink, LogOut, Loader2 } from 'lucide-react'
import { Toaster, toast } from 'sonner'

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')

  const fetchBookmarks = useCallback(async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching bookmarks:', error)
      toast.error('Failed to load bookmarks')
    } else {
      setBookmarks(data || [])
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchBookmarks()
  }, [fetchBookmarks])

  // Real-time subscription
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('bookmarks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setBookmarks((prev) => [payload.new as Bookmark, ...prev])
          } else if (payload.eventType === 'DELETE') {
            setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !title.trim() || !url.trim()) return

    // Validate URL
    let validUrl = url.trim()
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = 'https://' + validUrl
    }

    try {
      new URL(validUrl)
    } catch {
      toast.error('Please enter a valid URL')
      return
    }

    setSubmitting(true)

    const { error } = await supabase.from('bookmarks').insert({
      title: title.trim(),
      url: validUrl,
      user_id: user.id,
    })

    setSubmitting(false)

    if (error) {
      console.error('Error adding bookmark:', error)
      toast.error('Failed to add bookmark')
    } else {
      setTitle('')
      setUrl('')
      toast.success('Bookmark added!')
    }
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('bookmarks').delete().eq('id', id)

    if (error) {
      console.error('Error deleting bookmark:', error)
      toast.error('Failed to delete bookmark')
    } else {
      toast.success('Bookmark deleted')
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname
    } catch {
      return url
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <BookMarked className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Smart Bookmark</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {user?.user_metadata?.avatar_url && (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="text-sm text-gray-600 hidden sm:block">
                {user?.user_metadata?.name || user?.email}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Add Bookmark Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Bookmark</h2>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <input
              type="text"
              placeholder="URL (e.g., https://example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              disabled={submitting || !title.trim() || !url.trim()}
              className="px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
              Add
            </button>
          </form>
        </div>

        {/* Bookmarks List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Your Bookmarks ({bookmarks.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
              <p className="text-gray-500 mt-2">Loading bookmarks...</p>
            </div>
          ) : bookmarks.length === 0 ? (
            <div className="p-8 text-center">
              <BookMarked className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No bookmarks yet</p>
              <p className="text-sm text-gray-400 mt-1">Add your first bookmark above</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {bookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0 mr-4">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {bookmark.title}
                    </h3>
                    <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      {getDomain(bookmark.url)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Open link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(bookmark.id)}
                      className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Real-time indicator */}
        <div className="mt-4 text-center text-xs text-gray-400">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Real-time sync enabled
          </span>
        </div>
      </main>
    </div>
  )
}
