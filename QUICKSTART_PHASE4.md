# Phase 4: Quick Start (5 Minutes)

## 1. Verify Environment Variables

In `frontend/.env.local`:

```env
PUBLIC_SUPABASE_URL=https://oihcpqqpmuonxyowsano.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

👉 Get keys from: https://app.supabase.com → Your Project → Settings → API

## 2. Start Development Server

```bash
cd frontend
npm install  # Only needed first time
npm run dev
```

Navigate to: http://localhost:5173

## 3. Test the Feature

1. **Sign Up**: Click "Sign Up" → Create account
2. **Verify Email**: Check console or email (if configured)
3. **Create Scrapboard**: Dashboard → "+ New Scrapboard"
4. **Add Typed Note**: 
   - Click "+ Note"
   - Select "Typed" (default)
   - Enter text
   - Pick theme
   - Click "Create Note"
5. **Add Handwritten Note**:
   - Click "+ Note"
   - Select "Handwritten"
   - Draw on canvas
   - Click "Save & Create Note"
6. **Arrange**: Drag notes around canvas
7. **Edit**: Click note → "⋮" → "Edit Text"
8. **Change Theme**: Click note → "🎨 Theme" (bottom-right)
9. **Delete**: Click note → "⋮" → "Delete"
10. **Undo**: Click "↶ Undo" in toolbar

## 4. Run Tests

```bash
# Unit tests
npm run test

# Expected: All tests pass (20+ test cases)
```

## 5. Build for Production

```bash
npm run build

# Output: .svelte-kit/output/client/
# Deploy to Netlify or any static host
```

## What's Included (Phase 4)

✅ Create typed & handwritten notes  
✅ Drag notes around freely  
✅ Edit text inline  
✅ Change background themes (6 options)  
✅ Delete with undo/redo  
✅ Auto-save positions (debounced 2s)  
✅ Z-order layering for overlaps  
✅ Unit tests (20+ cases)  
✅ Full TypeScript types  

## Troubleshooting

**"Unauthorized" error?**
- Ensure user is signed up and verified
- Check `PUBLIC_SUPABASE_ANON_KEY` in .env.local

**Notes not showing?**
- Refresh page after creating
- Check browser console for errors
- Verify Supabase connection in Network tab

**Drawing canvas not appearing?**
- Clear browser cache (Ctrl+Shift+Delete)
- Ensure JavaScript enabled

**Auto-save not working?**
- Wait 2 seconds after dragging
- Check Network tab for POST requests
- Verify Supabase RLS policies enabled

## Next Steps

- **Deploy**: Follow [PHASE4_DEPLOYMENT.md](./PHASE4_DEPLOYMENT.md) for Netlify setup
- **Test E2E**: Complete integration test scenarios in [tests/integration/](./tests/integration/)
- **Phase 5**: Image upload support (next phase)

---

**Need Help?** See full docs in [PHASE4_DEPLOYMENT.md](./PHASE4_DEPLOYMENT.md)
