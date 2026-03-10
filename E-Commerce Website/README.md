# NovaCart - Dependency-Free E-Commerce Website

A static e-commerce project built with only HTML, CSS, and vanilla JavaScript.

## Features
- Product browsing with card-based catalog
- Product filtering by search, category, max price, and sort
- Cart management (add, update quantity, remove)
- Persistent cart using `localStorage`
- Simulated signup/login flow (front-end only)
- Simulated checkout/payment validation and order confirmation
- Responsive layout for desktop and mobile

## Tech Stack
- HTML5
- CSS3
- Vanilla JavaScript (ES modules)

No frameworks, no package manager, and no external runtime dependencies are required.

## Run Locally
1. Open `index.html` directly in a modern browser.
2. Or use any simple static server and open the served URL.

## Local Storage Keys
- `ecom_cart_v1`
- `ecom_session_v1`
- `ecom_users_v1` (simulated users only)

## Limitations
- Authentication is simulated and not secure for production.
- Payment is a simulated front-end form validation flow only.
- No backend database or real payment gateway integration.

## Deploy to GitHub Pages
1. Create a new GitHub repository.
2. Push all files from this project root.
3. On GitHub, open `Settings -> Pages`.
4. Set source to `Deploy from a branch`.
5. Choose branch `main` and folder `/ (root)`.
6. Save and wait for deployment.
7. Add the live URL here after deployment:
   - Live URL: `https://<your-username>.github.io/<repo-name>/`

## Suggested Submission Notes
- Mention that the project intentionally avoids dependencies.
- Note that auth and payment are simulated to satisfy no-backend constraints.
