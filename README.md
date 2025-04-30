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

2. **Navigate to the project directory:**  
   ```sh
   cd ecart
   ```

3. **Install dependencies:**  
   ```sh
   npm install
   ```

4. **Set up environment variables:**  
   Create a `.env` file in the root directory and configure the necessary environment variables. Example:  
   ```sh
  **Set up environment variables:**  
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

5. **Run the development server:**  
   ```sh
   npm start
   ```

## 🔧 Technologies Used  
- **Frontend:** EJS (Embedded JavaScript), Bootstrap  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB  
- **Authentication:** JWT (JSON Web Token)  
- **Payment Integration:** Razorpay  

## 📂 Project Structure  
```
/ecart
│── /src              # Source code directory
│   │── /api          # API-related files
│   │   │── /controllers  # Route controllers
│   │   │── /middlewares  # Custom middleware
│   │   │── /models       # Database models
│   │   │── /public/assets # Static assets (CSS, JS, images)
│   │   │── /routes       # Application routes
│   │   │── /views        # EJS templates
│   │── /config       # Configuration files
│── .gitignore        # Git ignore file
│── README.md        # Project documentation
│── package.json      # Dependencies and scripts
│── package-lock.json # Lockfile for npm dependencies
│── server.js         # Main server file
```  

## 📞 Contact  
For any inquiries or support, reach out to [Muhammed Rashid](mailto:muhammedrashid@gmail.com).  
