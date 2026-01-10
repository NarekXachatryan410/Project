# 📱 WhatsApp Clone – Real-Time Chat Application (MERN + Socket.io)

A full-stack real-time messaging application inspired by WhatsApp.  
Supports **secure authentication, email verification, private 1-to-1 chats, and group chats** with live message updates.

---

## 🚀 Features

### 🔐 Authentication & Security
- User registration & login  
- Email verification  
- JWT authentication  
- Protected routes  

### 💬 Messaging System
- **Two-way private chats** (1:1)  
- **Group chats**  
- Real-time messaging via Socket.io  
- Online/offline status (optional)  

### 📡 Real-Time Features
- Socket.io for live message updates  
- Instant chat list updates  
- Real-time notifications  

### 🗄️ Backend Logic
- Node.js + Express  
- MongoDB database with Mongoose  
- Models: Users, Conversations, Messages  
- REST API for CRUD operations  

### 🖥️ Frontend
- React  
- Chat interface with real-time updates  

---

## 🛠️ Tech Stack

### **Frontend**
- React  
- Axios  
- Socket.io-client  
- CSS / Tailwind / styled-components  

### **Backend**
- Node.js + Express  
- Socket.io  
- JWT authentication  
- Nodemailer for email verification  

### **Database**
- MongoDB (with Mongoose)

---

## 📦 Installation & Setup

### **1. Clone the repository**
```bash
git clone https://github.com/NarekXachatryan410/Project.git
cd whatsapp-clone


### **2. Install Dependencies**
```bash
Backend:
  npm install
  npm run socket
  npm run dev
Frontend
  npm install
  npm run dev

### **3. File structure**
/backend
  /controllers
  /db
  /middlewares
  /models
  /routes
  /schemas
  /socket-connection
  index.js

/frontend
  /src
    /api
    /auth
    /general
    /lib
    /modals
    main.tsx