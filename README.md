# 🛒 Dukaan

> A full-stack MERN e-commerce platform with a dedicated admin dashboard for managing products, orders, and users.

Dukaan delivers a seamless shopping experience for customers while equipping admins with powerful tools to manage inventory, track orders, and handle user interactions. It demonstrates end-to-end system design—from frontend UI to backend APIs and database integration.

---

## 🌐 Live Demo

🔗 https://dukaan-liard.vercel.app/

---

## 🚀 Key Features

* ⚡ **End-to-End E-commerce Flow:** Product browsing, cart management, and order tracking
* 🔐 **JWT Authentication & RBAC:** Secure login with role-based access (User/Admin)
* 📊 **Admin Dashboard:** Manage products, update order statuses, monitor users, and handle queries
* 📱 **Responsive UI:** Optimized across devices using Tailwind CSS
* ⚙️ **Efficient State Management:** Lightweight global state using Zustand
* 🖼️ **Cloud Image Handling:** Integrated Cloudinary for scalable asset management

---

## 🧠 What I Learned

* Implemented **role-based access control (RBAC)** for secure API authorization
* Managed **global state efficiently** using Zustand instead of Redux
* Integrated **Cloudinary** for reliable image storage and retrieval
* Designed **RESTful APIs with middleware architecture** for scalability
* Built a **full-stack SPA**, synchronizing frontend routing with backend services

---

## 🛠️ Tech Stack

**Frontend:** React (Vite), Tailwind CSS v4, Zustand, React Router DOM, Lucide React
**Backend:** Node.js, Express, JWT, Bcryptjs, Helmet, CORS
**Database:** MongoDB (Mongoose)
**Media Storage:** Cloudinary
**Deployment:** Vercel

---

## ⚙️ Installation

```bash
# Clone the repository
git clone https://github.com/your-username/dukaan
cd dukaan

# Backend setup
cd server
npm install

# Create a .env file in /server
MONGO_URI=your_mongo_uri
JWT_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
PORT=5000

# Start backend server
npm run dev

# Frontend setup
cd ../client
npm install
npm run dev
```

---

## 📌 Future Improvements

* Payment gateway integration (Stripe/Razorpay)
* Product reviews & ratings system
* Order analytics dashboard
* Caching & performance optimization

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first.

---

## 👤 Author

**Bineet Gupta**
🔗 https://github.com/Bineet08
