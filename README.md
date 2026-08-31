╔══════════════════════════════════════════════════════════════╗
║                      M I Z A A R A                           ║
║              Where Every Flavor Meets                        ║
║         CloudExify Web Development Internship                ║
║              Project 4 — Month 2 FINAL                       ║
╚══════════════════════════════════════════════════════════════╝



STUDENT INFORMATION
────────────────────────────────────────────────────────────

Name:              Saira Sehar
Registration:      CX-INT-2026-GEN-0488
Project:           Restaurant Full Stack Application
Month:             Month 2 — FINAL SUBMISSION



PROJECT OVERVIEW
────────────────────────────────────────────────────────────

Mizaara is a premium restaurant website featuring Pakistani and
Italian cuisine. The application includes customer-facing menu
browsing with ordering system and a full admin panel for
managing orders and menu items.

Brand Concept: Mizaara — "Where Every Flavor Meets"
Cuisine: Pakistani Classics + Italian Kitchen
Theme: Dark Elegant + Gold Accents



LIVE DEMO
────────────────────────────────────────────────────────────

Customer Panel: https://mizaara.vercel.app
Admin Panel: https://mizaara.vercel.app/admin.html

Admin Credentials:
  Email: admin@mizaara.pk
  Password: admin123



FEATURES
────────────────────────────────────────────────────────────

CUSTOMER PANEL FEATURES:

  1. User Authentication
     Registration and login system using Supabase Auth.
     Session persistence across page refreshes.

  2. Menu Display (34 Items)
     Categories: Starters, Pakistani Classics, Tandoor & Grill,
     Salads & Yogurt, Italian Kitchen, Pasta, Desserts, Beverages

  3. Search & Category Filter
     Real-time search by dish name or description.
     Category filter buttons work with search simultaneously.

  4. Shopping Cart
     Add/remove items, adjust quantities.
     Cart persists via sessionStorage.
     Running total auto-calculates.

  5. Order Placement
     Orders saved to Supabase database.
     Success confirmation with order number.
     Cart clears after successful order.

  6. Order History
     View past orders with full details.
     Order timeline: Pending → Preparing → Ready.
     Real-time status updates via Supabase Realtime.
     Printable receipt for each order.



ADMIN PANEL FEATURES:

  1. Admin Authentication Guard
     Role-based access control.
     Non-admin users redirected away.
     URL protection prevents direct access.

  2. Dashboard Statistics
     Today's orders count.
     Today's revenue total.
     Pending orders count.
     Total menu items.

  3. Revenue Chart
     Last 7 days revenue displayed as bar chart.
     Auto-updates every 30 seconds.

  4. Orders Management
     Full orders table with customer info.
     Status dropdown: Pending → Preparing → Ready.
     Live refresh on changes.

  5. Menu Management
     View all menu items.
     Add new items via modal form.
     Toggle item availability.
     Delete menu items.



TECH STACK
────────────────────────────────────────────────────────────

Technology              Usage
────────────────────────────────────────────────────
HTML5                   Semantic structure (6 pages)
CSS3                    Custom Mizaara theme
Bootstrap 5.3           Responsive grid and components
Vanilla JavaScript      All interactive functionality
Supabase                Authentication + PostgreSQL database
Supabase Realtime       Live order status updates
sessionStorage          Cart persistence
Vercel                  Deployment platform



DATABASE SCHEMA
────────────────────────────────────────────────────────────

profiles table:
  id (uuid, references auth.users)
  full_name (text)
  role (text: 'customer' or 'admin')

menu_items table:
  id (serial, primary key)
  name (text)
  description (text)
  price (numeric)
  category (text)
  image_url (text)
  available (boolean)
  created_at (timestamp)

orders table:
  id (serial, primary key)
  user_id (uuid, references auth.users)
  items (jsonb)
  total (numeric)
  status (text: 'Pending', 'Preparing', 'Ready')
  created_at (timestamp)



MENU CATEGORIES (8 Categories, 34 Items)
────────────────────────────────────────────────────────────

  1. Starters (4 items)
  2. Pakistani Classics (5 items)
  3. Tandoor & Grill (5 items)
  4. Salads & Yogurt (3 items)
  5. Italian Kitchen (4 items)
  6. Pasta (4 items)
  7. Desserts (4 items)
  8. Beverages (5 items)



DEPLOYMENT
────────────────────────────────────────────────────────────

Platform: Vercel
Database: Supabase

Deployment Steps:
  1. Create Supabase project
  2. Run SQL to create tables
  3. Insert menu items
  4. Create admin account
  5. Update js/config.js with Supabase credentials
  6. Push to GitHub
  7. Deploy on Vercel
  8. Add Vercel URL to Supabase redirect URLs



TESTING CHECKLIST
────────────────────────────────────────────────────────────

Test Case                                    Status
──────────────────────────────────────────────────────
Register new customer                        PASSED
Login with registered account                PASSED
Browse menu items (34 items)                 PASSED
Search filters real-time                     PASSED
Category filter works                        PASSED
Search + category work together              PASSED
Add items to cart                            PASSED
Cart persists on refresh                     PASSED
Place order successfully                     PASSED
Order saved to Supabase                      PASSED
View order history                           PASSED
Order timeline shows correct status          PASSED
Admin guard redirects non-admin              PASSED
Admin dashboard loads stats                  PASSED
Revenue chart displays                       PASSED
Update order status                          PASSED
Customer sees status update live             PASSED
Add new menu item (admin)                    PASSED
Toggle item availability                     PASSED
Delete menu item                             PASSED
Mobile responsive                            PASSED
No console errors                            PASSED



══════════════════════════════════════════════════════════════
  Built by Saira Sehar — CloudExify Internship 2026
  GitHub: https://github.com/Saira-Sehar
  LinkedIn: https://www.linkedin.com/in/saira-sehar
══════════════════════════════════════════════════════════════