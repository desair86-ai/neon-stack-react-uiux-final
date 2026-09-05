# Neon Stack Project Documentation

This file documents the frontend architecture, integrations, and customizations implemented for the Neon Stack project.

## Table of Contents
1. [Project Overview](#project-overview)
2. [WordPress & WooCommerce Integration](#wordpress--woocommerce-integration)
3. [AI Chatbot Integration](#ai-chatbot-integration)
4. [UI & UX Customizations](#ui--ux-customizations)
5. [Environment Variables](#environment-variables)

---

## 1. Project Overview
This project is a custom headless storefront for Neon Stack, built with React and Next.js. It features a fully custom UI/UX specifically designed for neon sign products, including dynamic catalog filtering, responsive footers, and a built-in AI assistant.

---

## 2. WordPress & WooCommerce Integration
The frontend is decoupled from the backend and fetches live catalog data from a WordPress/WooCommerce installation.

### GraphQL Implementation
We use the **WPGraphQL** plugin on the WordPress side to query products and categories efficiently. 
- **`src/lib/api.js`**: Centralized API functions (`fetchGraphQL`, `getProducts`, `getCategories`).
- **Product Data**: We query simple and variable products, parsing their price (`regularPrice`, `salePrice`), images, and attributes (specifically extracting `size` variants and maximum prices dynamically).
- **Categories**: We fetch hierarchical category trees directly from WordPress.

### Live Filtering System
The `CatalogGrid` component uses the dynamically extracted `maxPrice` and `sizesSet` from the WooCommerce API to populate the left-sidebar filter.
- Instead of hardcoding max prices or available sizes, the filter checks the available products from WordPress and updates itself accordingly.

---

## 3. AI Chatbot Integration
We built a custom floating AI chat widget (`NeonChatBot.jsx`) to assist customers with design ideas and queries.

### Architecture & Security
- **Frontend Widget**: A toggleable chat UI positioned at the bottom right. It maintains a local chat history (`messages` state).
- **Security**: To prevent exposing sensitive API keys (like Gemini or OpenAI keys) to the public, the frontend NEVER calls the AI provider directly.
- **Backend Proxy**: The frontend sends requests to a custom URL (`NEXT_PUBLIC_AI_API_URL`). This URL points to a backend proxy (like a Cloudflare Worker or a Vercel API Route) which holds the actual secure API keys and communicates with the AI.
- **Context Injection**: Every request sent to the proxy includes a hint (`context: 'neon_signs'`) so the AI knows to restrict its responses strictly to Neon Stack products, neon signs, and related queries.

---

## 4. UI & UX Customizations
Extensive custom styling was implemented across the application to match the brand identity:

- **Lucide Icons & SVG Brand Logos**: Implemented crisp, clean 1.5px stroke icons for UI elements (using `lucide-react`). For brand social media icons (Instagram, Facebook, LinkedIn, YouTube), we injected exact SVG paths and styled their borders and strokes with real brand hex colors.
- **Responsive Navigation**: Re-engineered the Mega Menu to expand on hover (desktop). The mobile hamburger menu uses an accordion system to elegantly display sub-categories with corresponding icons.
- **Mobile vs Desktop Footer**: 
  - **Desktop**: Features a classic 4-column layout (`SHOP`, `CUSTOMER CARE`, `COMPANY`, `CONTACT US`) with pink brand icons without circles.
  - **Mobile**: Transforms into a space-saving accordion layout with circular brand-colored social icons and optimized layouts for the Chat CTA, ensuring smooth mobile navigation.
- **Custom CTA Banners**: Injected a full-width gradient call-to-action banner ("CAN'T FIND WHAT YOU'RE LOOKING FOR?") dynamically at the bottom of category and shop views.
- **Styling Details**: Standardized "Save Design" gradient borders, updated form fields, and refined product cards.

---

## 5. Environment Variables
To connect the frontend to your data sources, the following variables must be set in your Vercel Environment Variables settings (or your local `.env.local` file):

- \`NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL\`: The endpoint for your WPGraphQL API (e.g., \`https://your-wordpress-site.com/graphql\`).
- \`NEXT_PUBLIC_WORDPRESS_REST_URL\`: The endpoint for your standard WP REST API, used for fetching configurator data (e.g., \`https://your-wordpress-site.com/wp-json\`).
- \`NEXT_PUBLIC_AI_API_URL\`: The endpoint for your secure backend proxy that handles AI requests (e.g., \`https://your-api-worker.workers.dev/chat\`).
