# Booked Profit Tracker — Final

This version is designed for:
- realized/booked stock profits only
- per-trade return and CAGR
- overall realized XIRR using actual buy/sell cash flows
- automatic company logos by Indian stock ticker
- Firebase username/password login
- live multi-device cloud synchronization
- mobile-first standalone PWA design
- JSON export

## One-time setup
1. Create a Firebase project and a Web App.
2. Enable Authentication → Email/Password.
3. Create a Cloud Firestore database.
4. Publish the rules in `firestore.rules`.
5. Copy the Firebase Web App config into `app-config.js`.
6. Get a Logo.dev publishable key and put it in `app-config.js`.
7. Upload the whole folder to the GitHub Pages repository.

Use the same Firebase account on every phone. The app listens to Firestore changes in real time, so a trade added on one phone appears on the others.

Do not put passwords or Firebase service-account/private keys in the app. The browser Firebase config is the normal Web App configuration; Firestore Security Rules protect the user's data.


### Login
Users enter a username and password only. The Firebase email/password provider is used internally with a private synthetic account identifier; the user does not need to provide a Gmail address.

### Trade fields
Each completed trade records share name/ticker, number of shares, average buy price, sell price, total buy value, total sell value, booked profit, return %, and trade CAGR. Overall realized XIRR uses total buy and sell cash flows on the actual dates.
