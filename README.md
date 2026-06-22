# ecart  

## 🚀 Live Demo  
🔗 [ecart Live](https://ecart-rgq6.onrender.com/)  

## 📌 Overview  
**ecart** is a modern and user-friendly e-commerce application designed to streamline online shopping. It provides a seamless shopping experience with features like product browsing, cart management, and secure checkout.  

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
│
├── /src
│   ├── /api
│   │   ├── /controllers
│   │   │   ├── /admin
│   │   │   └── /customer
│   │   ├── /middlewares
│   │   ├── /models
│   │   ├── /routes
│   │   ├── /views
│   │   │   ├── /admin
│   │   │   │   ├── /attributes
│   │   │   │   ├── /banners
│   │   │   │   ├── /brands
│   │   │   │   ├── /categories
│   │   │   │   ├── /coupons
│   │   │   │   ├── /customers
│   │   │   │   └── /products
│   │   │   ├── /client
│   │   │   │   ├── /accounts
│   │   │   │   ├── /auth
│   │   │   │   ├── /orders
│   │   │   │   ├── /products
│   │   │   │   └── /shopping
│   │   │   ├── /layouts
│   │   │   │   └── /partials
│   │   │   └── error.ejs
│   │   ├── /public
│   │   │   └── /js
│   │
│   ├── /config
│   │   ├── db.js
│   │   └── passport.js
│
├── .env
├── .env.example
├── .gitignore
├── README.md
├── package.json
├── package-lock.json
└── server.js
```  

## 📞 Contact  
For any inquiries or support, reach out to [Muhammed Rashid](mailto:mdrd.muhammedrashid@gmail.com).  

