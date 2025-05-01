# eCart  

## 🚀 Live Demo  
🔗 [eCart Live](#)  

## 📌 Overview  
**eCart** is a modern and user-friendly e-commerce application designed to streamline online shopping. It provides a seamless shopping experience with features like product browsing, cart management, and secure checkout.  

## ✨ Features  
- ✅ User authentication and authorization  
- ✅ Product listing and categorization  
- ✅ Shopping cart functionality  
- ✅ Order management  
- ✅ Secure payment gateway integration  
- ✅ Responsive and intuitive UI  

## 🛠️ Installation  
To set up the project locally, follow these steps:  

1. **Clone the repository:**  
   ```sh
   git clone https://github.com/devmdrd/ecart.git
   ```

2. **Install dependencies:**  
   ```sh
   npm install
   ```

3. **Set up environment variables:**  
   Create a `.env` file in the root directory and configure the necessary environment variables. Example:  
   ```sh
   # Google OAuth credentials
   GOOGLE_CLIENT_ID=your-google-client-id-here
   GOOGLE_CLIENT_SECRET=your-google-client-secret-here
   
   # MongoDB connection URI
   MONGO_URI=mongodb://your-mongo-uri-here
   
   # Application Port
   PORT=3000
   
   # Twilio credentials
   TWILIO_ACCOUNT_SID=your-twilio-account-sid-here
   TWILIO_AUTH_TOKEN=your-twilio-auth-token-here
   TWILIO_PHONE_NUMBER=your-twilio-phone-number-here
   
   # Google OAuth callback URL
   CALLBACK_URL=http://your-callback-url-here
   
   # Session secret
   SESSION_SECRET=your-session-secret-here
   
   # Nodemailer Email Credentials
   EMAIL_USER=your-email-user-here
   EMAIL_PASS=your-email-password-here
   
   # Stripe API keys
   STRIPE_SECRET_KEY=your-stripe-secret-key
   STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
   ```

4. **Run the development server:**  
   ```sh
   npm run dev
   ```

## 🔧 Technologies Used

### 🖥️ Frontend
- **EJS** – Embedded JavaScript templates for server-side rendering
- **Tailwind CSS** – Utility-first CSS framework for modern UI design

### 🛠️ Backend
- **Node.js** – JavaScript runtime environment
- **Express.js** – Lightweight web application framework

### 🗄️ Database
- **MongoDB** – NoSQL, document-based database for scalable data storage

### 🔐 Authentication
- **Google OAuth 2.0 (via Passport.js)** – Social login with Google
- **Custom Email/Password Authentication** – Manually implemented user login and registration

### 💳 Payment Integration
- **Stripe API** – Secure and developer-friendly payment gateway

### 📱 OTP Service
- **Twilio** – OTP service for user registration verification

### 📧 Email Service
- **Nodemailer** – Email service for "Forgot Password" functionality

## 📂 Project Structure  
```
/ecart
│── /src                      # Source code directory
│   │── /api                  # API-related files
│   │   │── /controllers      # Route controllers
│   │   │   │── admin         # Admin controllers
│   │   │   │── customer      # Customer controllers
│   │   │── /middlewares      # Custom middlewares
│   │   │── /models           # Database models
│   │   │── /routes           # Application routes
│   │   │── /views            # EJS templates for rendering views
│   │   │   │── /admin        # Admin views
│   │   │   │   │── attributes    # Admin attributes views
│   │   │   │   │── banners       # Admin banners views
│   │   │   │   │── brands        # Admin brands views
│   │   │   │   │── categories    # Admin categories views
│   │   │   │   │── coupons       # Admin coupons views
│   │   │   │   │── customers     # Admin customers views
│   │   │   │   │── products      # Admin products views
│   │   │   │── /client           # Client views
│   │   │   │   │── accounts      # Client accounts views
│   │   │   │   │── auth          # Client authentication views
│   │   │   │   │── orders        # Client orders views
│   │   │   │   │── products      # Client products views
│   │   │   │   │── shopping      # Client shopping views
│   │   │   │── /layouts          # Layouts and partials for views
│   │   │   │   │── partials      # Shared partials (header, footer, etc.)
│   │   │   │   └── error.ejs     # Shared error view
│   │   │── /public               # Public folder for images
│   │── /config               # Configuration files
│   │   │── db.js             # Database configuration
│   │   │── passport.js       # Passport authentication config
│── .env                      # Environment variables file 
│── .env.example              # Example environment variable file
│── .gitignore                # Git ignore file to exclude sensitive files
│── README.md                 # Project documentation
│── package.json              # Project dependencies and scripts
│── package-lock.json         # Lock file for npm dependencies
│── server.js                 # Main entry point for the server

```  

## 🖼️ Screenshots

### 🏠 Home Page
![Home](./screenshots/home.png)

### 🔐 Login Page
![Login](./screenshots/login.png)

### 🛍️ Product Listing
![Products List](./screenshots/products-list.png)

### 📄 Product Details
![Product Details](./screenshots/product-details.png)

### 🛒 Cart
![Cart](./screenshots/cart.png)

### ❤️ Wishlist
![Wishlist](./screenshots/wishlist.png)

### 👤 Profile
![Profile](./screenshots/profile.png)

### 📦 Orders
![Orders](./screenshots/orders.png)

### 📍 Address Book
![Address](./screenshots/address.png)

### ➕ Add Address
![Add Address](./screenshots/add-address.png)

### 💳 Checkout
![Checkout](./screenshots/checkout.png)

### 📝 Register
![Register](./screenshots/register.png)

### 🔑 Forgot Password
![Forgot Password](./screenshots/forgot-password.png)

### 📊 Admin Dashboard
![Admin Dashboard](./screenshots/admin-dashboard.png)

### 🧾 Admin Order List
![Admin Orders](./screenshots/admin-order-list-view.png)

### 📋 Admin Reports
![Admin Reports](./screenshots/admin-reports.png)

### 🧩 Manage Attributes
![Manage Attributes](./screenshots/attribute-manage.png)

### 🗂️ Attributes List
![Attributes List](./screenshots/admin-attributes-list.png)

### ➕ Add Product
![Add Product](./screenshots/add-product.png)

### 📦 Products Admin List
![Admin Product List](./screenshots/products-admin-list.png)

## 📞 Contact  
For any inquiries or support, reach out to [Muhammed Rashid](mailto:mdrd.muhammedrashid@gmail.com).  

