# Kingdom Keychains

This is a starter full-stack Kingdom Keychains website.

## Features
- Plum/gold storefront
- Crosses, Chainlinks, and Ropes with all requested subcategories
- Price filters: $5, $10, $15
- Dynamic color filtering
- Automatic alphabetical product sorting
- Private administrator login
- Server-side authorization for product uploads
- Image uploads
- Product deletion

## Run locally
1. Install Node.js.
2. Open a terminal in this folder.
3. Run `npm install`.
4. Set secure environment variables:
   - `ADMIN_USER`
   - `ADMIN_PASSWORD`
   - `SESSION_SECRET`
5. Run `npm start`.
6. Open `http://localhost:3000`.

IMPORTANT: Change the default admin password and session secret before using this online. Do not put administrator credentials into client-side HTML/JavaScript.


## Included customer-facing images
- `public/images/kingdom-crown.jpg` — supplied Kingdom Keychains crown/logo image.
- `public/images/tori-owner.jpg` — supplied owner photo used in Meet the Maker.


## Changing the administrator login
After signing in at `/admin.html`, use the **Administrator Login** section to change the username and password. The new password must be at least 8 characters. Passwords are stored as bcrypt hashes in the database.

For a brand-new installation, `ADMIN_USER` and `ADMIN_PASSWORD` environment variables can also be set before the first start.
