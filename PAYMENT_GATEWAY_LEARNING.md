# Payment Gateway Learning Guide - Learn & Implement Yourself

## 📚 Table of Contents
1. [Payment Gateway Basics](#payment-gateway-basics)
2. [How Payment Processing Works](#how-payment-processing-works)
3. [Popular Payment Gateways](#popular-payment-gateways)
4. [Architecture & Flow](#architecture--flow)
5. [Step-by-Step Implementation](#step-by-step-implementation)
6. [Security Fundamentals](#security-fundamentals)
7. [Testing & Debugging](#testing--debugging)

---

## Payment Gateway Basics

### What is a Payment Gateway?

Think of a payment gateway like a **digital intermediary** between your customer and their bank. When a customer wants to pay on your website:

```
Customer's Card/UPI → Payment Gateway → Bank → Confirms/Denies → Your App
```

### Key Terms You Should Know

| Term | Meaning |
|------|---------|
| **Payment Gateway** | Service that processes online payments |
| **Merchant** | You (the business accepting payments) |
| **Customer/Cardholder** | Person paying you |
| **Acquirer** | Bank that processes merchant transactions |
| **Issuer** | Bank that issued customer's card |
| **PSP** | Payment Service Provider (like Razorpay) |
| **Authorization** | Verification that customer has funds |
| **Settlement** | Money transferred to your account |
| **Webhook** | Notification from gateway to your server |
| **API Key** | Secret credential to authenticate requests |

### Why You Need a Payment Gateway

❌ **You CANNOT:**
- Directly handle credit card data (illegal without special licenses)
- Store card numbers in your database
- Process raw bank transfers via HTTP

✅ **Payment Gateway DOES:**
- Encrypts sensitive data
- Complies with PCI-DSS security standards
- Handles fraud detection
- Manages refunds
- Provides settlement

---

## How Payment Processing Works

### The Complete Payment Flow (8 Steps)

```
STEP 1: INITIATION
┌─────────────────────────────────────────┐
│ Customer clicks "Pay Now" button        │
│ Amount: ₹500, Order: #12345            │
└─────────────────────────────────────────┘
                    ↓
STEP 2: CREATE ORDER (Backend)
┌─────────────────────────────────────────┐
│ Your Backend calls:                      │
│ POST /api/payments/create-order         │
│ {orderId: "12345", amount: 500}         │
└─────────────────────────────────────────┘
                    ↓
STEP 3: GATEWAY CREATES ORDER
┌─────────────────────────────────────────┐
│ Razorpay/Stripe receives request        │
│ Returns: Order ID, Key ID               │
│ {razorpay_order_id: "order_abc123"}     │
└─────────────────────────────────────────┘
                    ↓
STEP 4: CHECKOUT MODAL OPENS
┌─────────────────────────────────────────┐
│ Frontend opens payment modal            │
│ Shows: Amount, Payment methods          │
│ Customer selects: UPI/Card              │
└─────────────────────────────────────────┘
                    ↓
STEP 5: PAYMENT PROCESSING
┌─────────────────────────────────────────┐
│ Customer enters details/OTP             │
│ Gateway communicates with bank          │
│ Bank approves/denies                    │
└─────────────────────────────────────────┘
                    ↓
STEP 6: PAYMENT RESPONSE
┌─────────────────────────────────────────┐
│ Gateway returns to frontend:            │
│ {                                       │
│   razorpay_payment_id: "pay_xyz789",   │
│   razorpay_signature: "hash_here"      │
│ }                                       │
└─────────────────────────────────────────┘
                    ↓
STEP 7: VERIFY ON BACKEND
┌─────────────────────────────────────────┐
│ Frontend sends verification to backend  │
│ Backend verifies signature              │
│ Updates database                        │
└─────────────────────────────────────────┘
                    ↓
STEP 8: CONFIRMATION
┌─────────────────────────────────────────┐
│ Customer sees success message           │
│ Order status: Paid                      │
│ Email confirmation sent                 │
└─────────────────────────────────────────┘
```

### Why This Flow?

**Security Question:** Why verify on the backend (Step 7) instead of trusting the frontend?

**Answer:** The frontend is controlled by the user. They could fake the response! So we:
1. Get payment ID from frontend
2. Generate a signature on backend using SECRET KEY (hidden from frontend)
3. Compare with signature from gateway
4. If signatures match → payment is REAL

---

## Popular Payment Gateways

### 1. Razorpay (Best for India)

**Pros:**
- ✅ Easy UPI integration
- ✅ LocalAccount bank transfer support
- ✅ Excellent documentation
- ✅ Good for Indian customers
- ✅ Low fees (2.36% + ₹5)

**Cons:**
- ❌ Limited international support
- ❌ Only processes INR

**Supported Payment Methods:**
- Credit/Debit Cards
- UPI
- NetBanking
- Wallets

**Website:** https://razorpay.com

### 2. Stripe

**Pros:**
- ✅ Global support
- ✅ Excellent API documentation
- ✅ Advanced features
- ✅ 180+ countries

**Cons:**
- ❌ Higher fees (~3.2%)
- ❌ Complex setup
- ❌ Not ideal for India-only

**Website:** https://stripe.com

### 3. PayPal

**Pros:**
- ✅ Customer trusted brand
- ✅ Global reach

**Cons:**
- ❌ PayPal account required
- ❌ Higher fees

---

## Architecture & Flow

### Your Project Structure

```
Your App (Dukaan)
│
├── Frontend (React)
│   ├── Cart Page
│   ├── Checkout Modal
│   └── RazorpayCheckout Component
│
├── Backend (Node.js)
│   ├── /api/orders (existing)
│   ├── /api/payments (NEW - you'll create)
│   │   ├── POST /create-order (step 3)
│   │   ├── POST /verify (step 7)
│   │   ├── GET /status (check payment)
│   │   └── POST /webhook (async notifications)
│   │
│   ├── Database
│   │   ├── Order collection (modified)
│   │   ├── PaymentMethod collection
│   │   └── PaymentLog collection (audit trail)
│   │
│   └── .env (store API keys)
│
└── Payment Gateway (Razorpay)
    ├── Test Mode (for testing)
    └── Live Mode (for production)
```

### Data Flow Diagram

```
Frontend                Backend              Razorpay            Bank
   │                      │                      │                │
   ├─ Create Order ────────────────────────────>│                │
   │                      │<─ Order ID ─────────│                │
   │                      │                      │                │
   ├─ Open Checkout ──────────────────────────>│                │
   │ (Razorpay Modal)     │                      │                │
   │                      │                      ├─ Verify Card ──>│
   │ Customer pays        │                      │<─ Approved ────│
   │                      │                      │                │
   │<─ Payment ID ────────│                      │                │
   │                      │                      │                │
   ├─ Send Payment ID ────>│                      │                │
   │                      │                      │                │
   │                      ├─ Verify Signature ──>│                │
   │                      │<─ Confirmation ─────│                │
   │                      │                      │                │
   │                      ├─ Update Database     │                │
   │                      │                      │                │
   │<─ Success ───────────│                      │                │
```

---

## Step-by-Step Implementation

### Step 0: Prerequisites

Before you start, you need:

1. **Razorpay Account**
   - Go to https://razorpay.com
   - Sign up → Verify → Get API keys

2. **NPM Package**
   ```bash
   cd server
   npm install razorpay
   ```

3. **Environment Variables**
   Create `.env` file in server folder:
   ```env
   RAZORPAY_KEY_ID=your_key_id_here
   RAZORPAY_KEY_SECRET=your_key_secret_here
   ```

### Step 1: Understand the Backend Endpoint Structure

You need to create these endpoints:

```
POST /api/payments/create-order
├── Input: {orderId}
├── What it does: Sends request to Razorpay
└── Output: {razorpayOrderId, keyId, amount}

POST /api/payments/verify
├── Input: {razorpayOrderId, razorpayPaymentId, razorpaySignature}
├── What it does: Verifies payment is real
└── Output: {success, order}

GET /api/payments/status/:paymentId
├── Input: paymentId (URL param)
├── What it does: Check payment status
└── Output: {payment status}
```

### Step 2: Create Payment Service (Backend Logic)

**Concept:** A Service file contains reusable logic. Think of it as helper functions.

**File:** `server/src/services/paymentService.js`

**What you need to learn:**

1. **Razorpay SDK Initialization**
   ```javascript
   const Razorpay = require('razorpay');
   const razorpay = new Razorpay({
       key_id: process.env.RAZORPAY_KEY_ID,
       key_secret: process.env.RAZORPAY_KEY_SECRET,
   });
   ```

2. **Create Order Method**
   - Takes: amount (in rupees), orderID
   - Calls Razorpay API: `razorpay.orders.create()`
   - Converts rupees to paise (multiply by 100)
   - Returns: Razorpay order ID

3. **Signature Verification**
   ```javascript
   // Concept: Hash-based validation
   const crypto = require('crypto');
   const hmac = crypto.createHmac('sha256', SECRET_KEY);
   hmac.update(data);
   const signature = hmac.digest('hex');
   ```
   **Why?** Frontend sends payment ID. Could be fake. We verify using secret key stored only on backend.

4. **Refund Logic**
   - Calls Razorpay API: `razorpay.payments.refund()`
   - Updates database: mark payment as refunded

### Step 3: Create Payment Controller (API Handlers)

**Concept:** Controller receives HTTP requests and uses service to process them.

**File:** `server/src/controllers/paymentController.js`

**Functions to create:**

1. **createPaymentOrder()**
   ```javascript
   exports.createPaymentOrder = async (req, res) => {
       const { orderId } = req.body;
       
       // 1. Find order in DB
       // 2. Call paymentService.createOrder()
       // 3. Return razorpay order ID
       // 4. Send response
   }
   ```

2. **verifyPayment()**
   ```javascript
   exports.verifyPayment = async (req, res) => {
       const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;
       
       // 1. Verify signature using paymentService
       // 2. If invalid → return error
       // 3. If valid → update Order in DB
       //    - Set isPaid = true
       //    - Set paymentMethod = "ONLINE"
       //    - Save payment details
       // 4. Return success
   }
   ```

3. **getPaymentStatus()**
   - Query database for payment
   - Return payment details

### Step 4: Create Payment Routes

**File:** `server/src/routes/paymentRoutes.js`

**Routes to create:**
```javascript
POST   /api/payments/create-order  (protected, needs user auth)
POST   /api/payments/verify        (protected)
GET    /api/payments/status/:id    (protected)
```

**Connect in app.js:**
```javascript
const paymentRoutes = require('./src/routes/paymentRoutes');
app.use('/api/payments', paymentRoutes);
```

### Step 5: Frontend Payment Modal Component

**File:** `client/src/components/RazorpayPayment.jsx`

**What to do:**

1. **Load Razorpay Script**
   ```javascript
   useEffect(() => {
       const script = document.createElement('script');
       script.src = 'https://checkout.razorpay.com/v1/checkout.js';
       document.body.appendChild(script);
   }, []);
   ```

2. **Handle Payment Click**
   ```javascript
   const handlePayment = async () => {
       // Step 1: Call /api/payments/create-order
       // Step 2: Get razorpayOrderId back
       // Step 3: Open Razorpay modal
       // Step 4: Customer pays
       // Step 5: On success, call /api/payments/verify
       // Step 6: Show confirmation
   }
   ```

3. **Razorpay Options Object**
   ```javascript
   const options = {
       key: keyId,                    // Public key from backend
       amount: totalAmount * 100,     // In paise
       currency: 'INR',
       order_id: razorpayOrderId,
       handler: (response) => {       // On success
           // Verify on backend
       }
   };
   const rzp = new window.Razorpay(options);
   rzp.open();
   ```

### Step 6: Update Order Model

**File:** `server/src/models/Order.js`

**Fields to add:**
```javascript
paymentMethod: {
    type: String,
    enum: ['COD', 'ONLINE'],
    default: 'COD'
},
paymentResult: {
    id: String,           // Razorpay payment ID
    status: String,       // paid, failed, pending
    updateTime: String
},
isPaid: {
    type: Boolean,
    default: false
},
paidAt: Date              // When payment completed
```

---

## Security Fundamentals

### 🔐 Rule #1: Never Trust the Frontend

**Wrong approach:**
```javascript
// Frontend sends: "I paid ₹500, I'm done!"
// Backend just updates database
// ❌ HACKER ALERT! Anyone can fake this
```

**Correct approach:**
```javascript
// Frontend sends payment ID from Razorpay
// Backend verifies with Razorpay servers
// Only then update database
// ✅ SECURE
```

### 🔐 Rule #2: Keep Secret Keys Secret

```env
# ✅ CORRECT: In .env file
RAZORPAY_KEY_SECRET=xyz123secret

# ❌ WRONG: In frontend code
const secret = "xyz123secret"; // Anyone can see this!

# ❌ WRONG: In GitHub
git push to GitHub with secret → Hacked!
```

### 🔐 Rule #3: Always Verify Signatures

When Razorpay sends data to your backend, verify it's actually from Razorpay:

```javascript
// Concept: HMAC-SHA256 signature
// Razorpay generates: HMAC(data, SECRET_KEY)
// You verify: Does YOUR_HMAC match RAZORPAY_HMAC?

const crypto = require('crypto');
const receivedSignature = req.body.razorpay_signature;
const expectedSignature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(orderId + '|' + paymentId)
    .digest('hex');

if (receivedSignature !== expectedSignature) {
    return res.status(400).json({error: 'Invalid payment'});
}
```

### 🔐 Rule #4: HTTPS Only

- Never process payments over HTTP
- Always use HTTPS in production
- Razorpay requires HTTPS

### 🔐 Rule #5: Database Security

Store payment data securely:
```javascript
// ✅ Store in database
{
    orderId: "12345",
    paymentId: "pay_xyz",
    status: "completed",
    amount: 500
}

// ❌ Never store
{
    cardNumber: "1234567890123456",  // ILLEGAL
    cvv: "123"                        // ILLEGAL
}
```

---

## Testing & Debugging

### Test Mode vs Live Mode

**Razorpay Dashboard:**
- **Test Mode:** Use fake card numbers, no real money
- **Live Mode:** Real transactions (only after full setup)

### Test Card Numbers

```
✅ Success:      4111 1111 1111 1111
❌ Failure:      4444 3333 2222 1111
⏱️  Timeout:      4000 0000 0000 0002

OTP:             Any 6 digits
Expiry:          Any future date
CVV:             Any 3 digits
```

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Order not found" | OrderID doesn't exist | Check order ID is correct |
| "Invalid signature" | Frontend modified data | Verify signature verification logic |
| "Key ID missing" | Frontend didn't receive key | Check backend /create-order endpoint |
| "Payment failed" | Card number wrong | Use correct test card |
| "Webhook not received" | URL not configured | Setup webhook in Razorpay dashboard |

### Debugging Checklist

- [ ] Razorpay account created?
- [ ] API keys in `.env`?
- [ ] `npm install razorpay`?
- [ ] Payment routes added to `app.js`?
- [ ] Razorpay script loaded in frontend?
- [ ] Using test card numbers?
- [ ] Signature verification working?

---

## Quick Reference: Implementation Checklist

- [ ] Create `paymentService.js` with Razorpay initialization
- [ ] Create `paymentController.js` with 3 functions
- [ ] Create `paymentRoutes.js` and add to `app.js`
- [ ] Update `Order.js` model with payment fields
- [ ] Create `RazorpayPayment.jsx` component
- [ ] Add Razorpay script loader in component
- [ ] Test with sandbox keys
- [ ] Test complete payment flow
- [ ] Add error handling
- [ ] Set up webhooks
- [ ] Go live with real keys

---

## Key Learning Points Summary

1. **Payment Gateway = Secure Intermediary** between customer & bank
2. **Never handle raw card data** - Let gateway do it
3. **Always verify signatures** - Don't trust frontend
4. **Keep API keys secret** - Use .env files
5. **Test first** - Use sandbox mode before live
6. **HTTPS required** - Security standard
7. **Webhooks for notifications** - Handle async events
8. **Database updates after verification** - Ensure security

---

## Next: Implement It Yourself!

Now that you understand:
- What payment gateways do
- How the flow works
- Security principles
- Architecture needed

**Try implementing:**
1. Start with backend (paymentService.js)
2. Add routes and controller
3. Then work on frontend
4. Test with sandbox

Feel free to ask questions as you implement! 🚀
