# 🚀 Chat Bot Quick Start Guide

## ⚡ Get Running in 5 Minutes

### Prerequisites
✅ Database migration already executed
✅ Prisma client already generated
✅ All dependencies installed
✅ All files created

### Step 1: Add Environment Variables

Edit `.env.local`:

```bash
# Add these lines (if not already present)
ANTHROPIC_API_KEY=sk-ant-your-key-here
ANTHROPIC_MODEL=claude-sonnet-4-20250514
NEXT_PUBLIC_CHAT_BOT_ENABLED=true
CHAT_BOT_MAX_TOKENS=4096
CHAT_BOT_TEMPERATURE=0.7
```

### Step 2: Start Development Server

```bash
pnpm dev --turbopack
```

### Step 3: Open Browser

Navigate to: `http://localhost:3000`

### Step 4: Look for Chat Button

- **Location**: Bottom-right corner
- **Appearance**: Blue/purple gradient floating button
- **Icon**: MessageSquare icon

### Step 5: Start Chatting!

1. Click the floating button
2. Click "Start Conversation"
3. Type your first message
4. Watch AI stream responses!

---

## 🎨 What You'll See

### Floating Button
```
┌─────────┐
│   💬    │  ← Click this
└─────────┘
Bottom-right corner
```

### Chat Interface
```
┌──────────────────┬────────────────────┐
│  Conversations   │   Chat Messages    │
│  - New Chat      │   User: Hello      │
│  - Search        │   AI: Hi there!    │
│  - History       │   [Type here...]   │
└──────────────────┴────────────────────┘
```

---

## 🧪 Quick Test

Try these messages:

1. **"Hello"** → Should greet you by name
2. **"What are your pricing plans?"** → Should list plans
3. **"How do I cancel my subscription?"** → Should provide instructions
4. **Code example**:
   ```
   "Show me a TypeScript example"
   ```
   Should render with syntax highlighting

---

## 🎯 Features to Test

- ✅ Create conversation
- ✅ Send message
- ✅ Receive streaming response
- ✅ Markdown rendering
- ✅ Code syntax highlighting
- ✅ Search conversations
- ✅ Switch conversations
- ✅ Close/reopen widget

---

## 🐛 Troubleshooting

### Chat button doesn't appear
**Solution**: Check `NEXT_PUBLIC_CHAT_BOT_ENABLED=true` in `.env.local`

### "Authentication required" error
**Solution**: Make sure you're logged in with Clerk

### Streaming doesn't work
**Solution**: Verify `ANTHROPIC_API_KEY` is set correctly

### Database errors
**Solution**: Run `psql $DATABASE_URL -f prisma/migrations/add_chat_tables.sql`

### TypeScript errors
**Solution**: Run `pnpm prisma generate`

---

## 📊 Component Overview

```
ChatWidget (Floating Button)
    ↓
Sheet (Drawer)
    ↓
ChatInterface (Main UI)
    ├── ConversationList (Sidebar)
    │   ├── Search
    │   └── Conversations
    └── Messages Area
        ├── MessageBubble (with Markdown)
        ├── TypingIndicator (while AI responds)
        └── MessageInput (textarea + send)
```

---

## 🎓 Usage Tips

### Keyboard Shortcuts
- **Enter** → Send message
- **Shift + Enter** → New line
- **Esc** → Close chat (when focused)

### Best Practices
- Start specific conversations for different topics
- Use search to find past conversations
- Archive old conversations to keep sidebar clean
- Long messages are auto-formatted with scroll

---

## 📱 Mobile Support

- ✅ Responsive design
- ✅ Touch-friendly
- ✅ Full-screen on small devices
- ✅ Auto-resize keyboard

---

## 🔗 Useful Links

- **API Routes**: `/api/chat/conversations`
- **Types**: `types/chat.ts`
- **Store**: `store/chat-store.ts`
- **Components**: `components/chat/`

---

## 🎉 You're All Set!

The chat bot is now live and ready to use. Start a conversation and enjoy real-time AI support! 🚀

**Need help?** Check the full documentation:
- [CHAT_BOT_SETUP.md](./CHAT_BOT_SETUP.md)
- [PHASE_1_COMPLETE.md](./PHASE_1_COMPLETE.md)
