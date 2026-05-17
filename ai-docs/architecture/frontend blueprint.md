# FRONTEND + MOBILE ARCHITECTURE BLUEPRINT

## Happy Home Restaurant Ecosystem

---

# 1. FRONTEND ECOSYSTEM OVERVIEW

The frontend ecosystem consists of:

1. Restaurant Website
2. Customer Mobile App
3. Rider Mobile App
4. Admin Dashboard
5. Kitchen Dashboard

All frontend systems communicate with:

* Express backend APIs
* Socket.io realtime server
* Firebase notifications

---

# 2. FRONTEND ARCHITECTURE PRINCIPLES

## MUST FOLLOW

* TypeScript only
* Component-driven architecture
* Feature-based folder structure
* Reusable UI system
* Responsive-first design
* Mobile-first approach
* Clean state management
* Scalable routing
* Production-grade code structure
* API-first frontend architecture

---

# 3. FRONTEND TECHNOLOGY STACK

# WEBSITE

## Core Stack

* Next.js
* React.js
* TypeScript
* Tailwind CSS
* Framer Motion
* TanStack Query
* Axios
* Zod
* React Hook Form
* Socket.io Client

---

# MOBILE APPS

## Core Stack

* React Native
* Expo
* TypeScript
* NativeWind
* React Navigation
* TanStack Query
* Redux Toolkit
* Axios
* Socket.io Client
* Expo Notifications
* Expo Location
* React Native Maps

---

# 4. STATE MANAGEMENT ARCHITECTURE

# IMPORTANT PRINCIPLE

Use:

* TanStack Query for server state
* Redux Toolkit for app/global state

---

# TANSTACK QUERY RESPONSIBILITIES

Use for:

* foods
* orders
* notifications
* reservations
* rider tracking
* analytics
* caching
* realtime synchronization

---

# REDUX RESPONSIBILITIES

Use for:

* authentication state
* app settings
* theme state
* language state
* temporary UI state

---

# NEVER STORE IN REDUX

* foods
* orders
* cart server data
* analytics

Use TanStack Query instead.

---

# 5. WEBSITE ARCHITECTURE

# PURPOSE

Website is:

* branding platform
* SEO platform
* app promotion platform
* reservation platform

Website is NOT:

* food ordering system

---

# WEBSITE FEATURES

## Pages

### Home Page

* premium hero section
* featured foods
* app CTA
* customer reviews
* restaurant story
* promotions
* delivery info

---

### Menu Page

* food showcase
* categories
* food cards
* search/filter
* app deep link CTA

---

### About Page

* restaurant story
* chefs
* restaurant culture

---

### Reservation Page

* table booking form
* reservation status

---

### Contact Page

* maps
* opening hours
* WhatsApp
* social links

---

# 6. WEBSITE FOLDER STRUCTURE

website/
│
├── app/
│   ├── (public)/
│   ├── menu/
│   ├── about/
│   ├── reservations/
│   ├── contact/
│   └── layout.tsx
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── sections/
│   ├── food/
│   ├── reservation/
│   └── shared/
│
├── services/
│   ├── api/
│   ├── queries/
│   └── mutations/
│
├── hooks/
│
├── store/
│
├── lib/
│
├── constants/
│
├── types/
│
├── styles/
│
└── utils/

---

# 7. MOBILE APP ARCHITECTURE

# CUSTOMER APP PURPOSE

Customer app handles:

* authentication
* ordering
* payments
* tracking
* loyalty system

---

# CUSTOMER APP FEATURES

## Authentication

* onboarding
* register/login
* forgot password
* OTP verification

---

## Food Ordering

* categories
* food listing
* food details
* variants
* cart
* checkout

---

## Tracking

* realtime order tracking
* rider live location
* delivery ETA

---

## User Features

* loyalty points
* saved addresses
* saved payments
* notifications
* order history

---

# 8. CUSTOMER APP FOLDER STRUCTURE

customer-app/
│
├── src/
│   ├── screens/
│   │   ├── auth/
│   │   ├── home/
│   │   ├── menu/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── tracking/
│   │   ├── profile/
│   │   └── loyalty/
│   │
│   ├── navigation/
│   │   ├── stacks/
│   │   ├── tabs/
│   │   └── root-navigation.tsx
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── food/
│   │   ├── cart/
│   │   ├── tracking/
│   │   └── shared/
│   │
│   ├── services/
│   │   ├── api/
│   │   ├── queries/
│   │   ├── mutations/
│   │   └── socket/
│   │
│   ├── hooks/
│   │
│   ├── store/
│   │
│   ├── constants/
│   │
│   ├── types/
│   │
│   ├── theme/
│   │
│   └── utils/
│
├── app.json
├── package.json
└── tsconfig.json

---

# 9. RIDER APP ARCHITECTURE

# PURPOSE

Rider app manages:

* delivery assignments
* navigation
* live tracking
* delivery completion

---

# RIDER APP FEATURES

## Authentication

* rider login
* online/offline mode

---

## Delivery System

* available deliveries
* accept delivery
* route navigation
* delivery completion

---

## Tracking

* realtime GPS updates
* customer location

---

## Rider Dashboard

* completed deliveries
* delivery history
* earnings

---

# 10. RIDER APP FOLDER STRUCTURE

rider-app/
│
├── src/
│   ├── screens/
│   │   ├── auth/
│   │   ├── deliveries/
│   │   ├── maps/
│   │   ├── earnings/
│   │   └── profile/
│   │
│   ├── navigation/
│   │
│   ├── components/
│   │
│   ├── services/
│   │
│   ├── hooks/
│   │
│   ├── store/
│   │
│   ├── socket/
│   │
│   └── utils/
│
├── package.json
└── app.json

---

# 11. ADMIN DASHBOARD ARCHITECTURE

# PURPOSE

Admin dashboard handles:

* food management
* order management
* analytics
* rider management
* reservations
* inventory

---

# ADMIN FEATURES

## Order Management

* realtime incoming orders
* order statuses
* rider assignment

---

## Food Management

* CRUD foods
* categories
* pricing
* availability

---

## Analytics

* revenue charts
* order metrics
* customer metrics

---

## Inventory

* stock levels
* alerts

---

# 12. KITCHEN DASHBOARD ARCHITECTURE

# PURPOSE

Kitchen dashboard handles:

* realtime kitchen queue
* cooking statuses
* preparation timers

---

# FEATURES

* live incoming orders
* preparation workflow
* ready notifications
* order priorities

---

# 13. FRONTEND ROUTING ARCHITECTURE

# WEBSITE ROUTING

Use:

* Next.js App Router

---

# CUSTOMER APP NAVIGATION

Use:

* React Navigation

---

# Navigation Structure

Root Stack
│
├── Auth Stack
├── Main Tabs
│   ├── Home
│   ├── Menu
│   ├── Orders
│   ├── Loyalty
│   └── Profile
│
└── Modal Screens

---

# RIDER APP NAVIGATION

Root Stack
│
├── Auth Stack
├── Delivery Stack
├── Earnings Stack
└── Profile Stack

---

# 14. DESIGN SYSTEM ARCHITECTURE

# DESIGN STYLE

* modern minimal
* premium
* elegant
* clean spacing
* luxury restaurant aesthetic

---

# DESIGN PRINCIPLES

* consistency
* accessibility
* responsive layouts
* smooth interactions
* subtle animations

---

# 15. COLOR SYSTEM

# PRIMARY COLORS

Primary:

* #0F172A

Accent:

* #F97316

Background:

* #020617

Surface:

* #111827

Text Primary:

* #FFFFFF

Text Secondary:

* #CBD5E1

Success:

* #10B981

Error:

* #EF4444

---

# 16. TYPOGRAPHY SYSTEM

# Fonts

Headings:

* Poppins

Body:

* Inter

---

# Font Scale

Heading XL
Heading LG
Heading MD
Body LG
Body MD
Body SM
Caption

---

# 17. SPACING SYSTEM

Use consistent spacing scale.

4px
8px
12px
16px
20px
24px
32px
40px
48px

---

# 18. COMPONENT ARCHITECTURE

# UI COMPONENT TYPES

## Base Components

* Button
* Input
* Modal
* Card
* Badge
* Loader
* Toast

---

## Business Components

* FoodCard
* CartItem
* OrderCard
* RiderTracker
* ReservationForm

---

## Layout Components

* Navbar
* Sidebar
* BottomTabs
* Header
* Footer

---

# 19. FRONTEND DATA FLOW

# STANDARD FLOW

UI Component
↓
TanStack Query Hook
↓
Axios Service
↓
Express API
↓
MongoDB

---

# 20. AXIOS SERVICE LAYER

# PURPOSE

Centralize:

* API requests
* token handling
* interceptors
* error handling

---

# Example Structure

services/api/
│
├── client.ts
├── auth.service.ts
├── foods.service.ts
├── orders.service.ts
└── payments.service.ts

---

# 21. TANSTACK QUERY STRUCTURE

# QUERIES

Use for:

* foods
* orders
* notifications
* analytics

---

# MUTATIONS

Use for:

* login
* register
* create order
* update profile

---

# Query Keys

['foods']
['orders']
['order', orderId]
['notifications']

---

# 22. SOCKET.IO FRONTEND ARCHITECTURE

# PURPOSE

Realtime communication.

---

# SOCKET CONNECTION FLOW

1. User authenticates
2. Frontend connects socket
3. User joins room
4. Listen for realtime events

---

# CUSTOMER EVENTS

* order_status_updated
* rider_location_updated
* notification_received

---

# ADMIN EVENTS

* new_order
* payment_received

---

# RIDER EVENTS

* delivery_assigned

---

# 23. AUTHENTICATION FRONTEND FLOW

# LOGIN FLOW

1. User submits login
2. Backend validates
3. Access token received
4. Refresh token stored securely
5. User data cached
6. Protected routes enabled

---

# TOKEN STRATEGY

## Website

Use:

* HTTP-only cookies

---

## Mobile Apps

Use:

* SecureStore / AsyncStorage

---

# 24. DEEP LINKING ARCHITECTURE

# PURPOSE

Website button behavior:

If app installed:
→ open app

If app not installed:
→ open Play Store/App Store

---

# EXAMPLE LINKS

happyhome://menu
happyhome://offers
happyhome://cart

---

# 25. MOBILE UI/UX PRINCIPLES

# CUSTOMER APP

Must feel:

* fast
* premium
* minimal
* smooth

---

# IMPORTANT UX RULES

* minimize taps
* large touch targets
* clear checkout flow
* quick reorder access
* smooth loading states
* instant feedback

---

# 26. ANIMATION SYSTEM

Use:

* Framer Motion (website)
* React Native Reanimated (mobile)

---

# Animation Types

* page transitions
* hover effects
* skeleton loaders
* button feedback
* card transitions

---

# 27. RESPONSIVE DESIGN RULES

# WEBSITE

Support:

* mobile
* tablet
* desktop
* ultra-wide

---

# MOBILE APPS

Support:

* Android phones
* iPhones
* different screen sizes

---

# 28. ACCESSIBILITY REQUIREMENTS

Must support:

* readable typography
* proper contrast
* accessible buttons
* keyboard navigation (website)
* screen readers

---

# 29. FRONTEND SECURITY RULES

## NEVER STORE

* payment secrets
* backend secrets
* raw card data

---

## ALWAYS VALIDATE

* forms
* inputs
* uploads

---

# 30. PERFORMANCE OPTIMIZATION

# WEBSITE

Use:

* Next.js image optimization
* lazy loading
* code splitting
* SSR where needed

---

# MOBILE APPS

Use:

* optimized lists
* lazy images
* pagination
* memoization

---

# 31. ERROR HANDLING ARCHITECTURE

# GLOBAL ERROR BOUNDARIES

Use:

* React Error Boundaries

---

# API ERROR HANDLING

Show:

* toast notifications
* fallback UI
* retry options

---

# 32. NOTIFICATION SYSTEM

Use:

* Firebase Cloud Messaging

---

# CUSTOMER NOTIFICATIONS

* order updates
* promotions
* rider nearby

---

# RIDER NOTIFICATIONS

* new delivery
* delivery updates

---

# 33. TESTING STRATEGY

# WEBSITE TESTING

Use:

* Playwright
* React Testing Library

---

# MOBILE TESTING

Use:

* Expo testing
* device testing
* responsiveness testing

---

# 34. LOVABLE AI RESPONSIBILITIES

Use Lovable AI for:

* landing pages
* UI components
* dashboard layouts
* mobile screen UIs
* animations
* reusable sections

---

# NEVER USE LOVABLE FOR

* backend logic
* auth systems
* payment systems
* database logic
* realtime architecture

---

# 35. CLAUDE RESPONSIBILITIES

Use Claude for:

* API integration
* architecture refactoring
* folder restructuring
* state management integration
* service layers
* production cleanup

---

# 36. CURSOR RESPONSIBILITIES

Use Cursor for:

* code integration
* debugging
* codebase refactoring
* AI-assisted editing
* file generation
* project-wide updates

---

# 37. GLOBAL FRONTEND ENGINEERING RULES

* TypeScript only
* Tailwind/NativeWind only
* reusable components only
* no inline styles
* clean folder structures
* TanStack Query for server state
* Redux only for app state
* centralized API layer
* scalable architecture
* responsive-first development

---

# 38. MVP FRONTEND FEATURES

# WEBSITE

* homepage
* menu showcase
* reservations
* app CTA

---

# CUSTOMER APP

* auth
* food ordering
* cart
* checkout
* tracking
* loyalty

---

# RIDER APP

* delivery management
* tracking
* delivery completion

---

# ADMIN DASHBOARD

* orders
* foods
* analytics
* riders

---

# 39. FUTURE FRONTEND FEATURES

Future upgrades:

* multilingual support
* dark/light mode toggle
* AI chatbot
* voice ordering
* customer subscriptions
* advanced analytics dashboards

---

# 40. FINAL FRONTEND ENGINEERING GOAL

The frontend ecosystem must feel:

* enterprise-grade
* modern
* luxurious
* responsive
* realtime-enabled
* scalable
* maintainable
* AI-development friendly

The experience should compete with:

* Uber Eats
* DoorDash
* PickMe Food
* Foodpanda

while maintaining the identity of Happy Home Restaurant.

---

# END OF FRONTEND + MOBILE ARCHITECTURE BLUEPRINT
