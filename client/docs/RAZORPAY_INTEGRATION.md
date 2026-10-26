# Razorpay Frontend Integration Guide

This guide explains how to integrate Razorpay Checkout with your frontend and call the backend endpoints that your server exposes (`/api/payments/create-order` and `/api/payments/verify`). It focuses on the flow used in this project: server creates the Razorpay order and verifies signatures; the frontend opens the Checkout UI.

## Overview

- Backend responsibilities (already implemented):
  - Create a Razorpay order and return `razorpayOrderId`, `amount`, and `keyId`.
  - Verify the `razorpay_signature` and mark the order paid.
- Frontend responsibilities (implement these):
  1. Request the backend to create a Razorpay order for a given `orderId`.
  2. Load the Razorpay SDK and open the Checkout modal using the returned `keyId` and `razorpayOrderId`.
  3. On successful payment, send the payment response to the backend `/api/payments/verify` endpoint for verification.

> Security note: never put the Razorpay secret key on the frontend. The frontend uses only the `keyId` (publishable).

## Required endpoints (server)

- `POST /api/payments/create-order` — body: `{ orderId }` (authenticated)
  - Response: `{ success: true, razorpayOrderId, amount, keyId, orderId }`
- `POST /api/payments/verify` — body: `{ orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }` (authenticated)

Both endpoints require the user to be authenticated — include your JWT in `Authorization: Bearer <token>` header.

## Key considerations

- Amount units: Razorpay expects amounts in the smallest currency unit (INR → paise). Use the `amount` returned by your backend. Confirm whether your backend returns rupees or paise; if it returns rupees, multiply by 100 before passing to Checkout.
- Do not trust client-side verification. Always call the `/verify` endpoint which validates the signature server-side.
- Load `https://checkout.razorpay.com/v1/checkout.js` once before opening Checkout.

## Helper snippets

1) Create Razorpay order (frontend call to backend)

```js
import axios from 'axios';

async function createRazorpayOrder(orderId, token) {
  const res = await axios.post('/api/payments/create-order', { orderId }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data; // { razorpayOrderId, amount, keyId, orderId }
}
```

2) Load Razorpay SDK (idempotent loader)

```js
function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Razorpay SDK failed to load'));
    document.body.appendChild(script);
  });
}
```

3) Open Razorpay Checkout and handle response

```js
import axios from 'axios';

async function openRazorpay({ keyId, razorpayOrderId, amount, orderId, userEmail, token }) {
  await loadRazorpayScript();

  // If backend returns amount in rupees, convert to paise: amount * 100
  const checkoutAmount = typeof amount === 'number' && amount < 1000000 ? Math.round(amount * 100) : amount;

  const options = {
    key: keyId,
    amount: checkoutAmount,
    currency: 'INR',
    name: 'Your Shop',
    description: `Order ${orderId}`,
    order_id: razorpayOrderId,
    handler: async function (response) {
      // response contains: razorpay_payment_id, razorpay_order_id, razorpay_signature
      try {
        await axios.post('/api/payments/verify', {
          orderId,
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // TODO: show success UI, redirect to order page
      } catch (err) {
        // TODO: show verification error to user
      }
    },
    prefill: { email: userEmail },
    theme: { color: '#F37254' }
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
}
```

## Example flow in React (outline)

```js
// PaymentPage.jsx (outline)
import React from 'react';
import { useUserStore } from 'path/to/useUserStore';
import axios from 'axios';

function PaymentPage({ orderId, orderAmount, orderUserEmail }) {
  const token = useUserStore(state => state.token);
  const userEmail = orderUserEmail || useUserStore(state => state.user?.email);

  const handlePay = async () => {
    try {
      const { razorpayOrderId, amount, keyId } = await createRazorpayOrder(orderId, token);
      await openRazorpay({ keyId, razorpayOrderId, amount, orderId, userEmail, token });
    } catch (err) {
      // handle error (network, validation, etc.)
    }
  };

  return (
    <div>
      <h2>Pay for order</h2>
      <p>Amount: {orderAmount}</p>
      <button onClick={handlePay}>Pay Now</button>
    </div>
  );
}
```

## Integrating with `CartDrawer` or checkout flow

- Option A: Create an `Order` on backend first (your current flow) and navigate to a `PaymentPage` where user triggers payment.
- Option B: From `CartDrawer`, call `create-order` and then immediately open Razorpay Checkout. If you do this, disable the Pay button while the request is in progress and handle errors gracefully.

## Testing

- Use your test keys from `.env` (e.g., `RAZORPAY_KEY_ID` appears in your server `.env`).
- Use Razorpay's test cards (refer to Razorpay docs) to simulate success/failure.
- After successful verify, confirm that `Order.isPaid` is set and a `PaymentRecord` exists in your database.

## Debugging tips

- If Checkout fails to open, ensure the SDK script is loaded and `window.Razorpay` exists.
- If verification fails, inspect server logs; common causes are mismatched order IDs or missing signature.
- Ensure the `Authorization` header is sent for both endpoints (create-order and verify).

## Common pitfalls

- Sending the wrong `amount` unit to Checkout (pass paise to Razorpay).
- Relying on client-side signature validation (always validate server-side).
- Double-clicking Pay causing duplicate attempts — debounce or disable button.

## Useful links

- Razorpay Checkout docs: https://razorpay.com/docs/payments/checkout/
- Signature verification: https://razorpay.com/docs/payments/server-integration/

---

If you want, I can also add a small copy-paste `PaymentPage.jsx` example tailored to your project's structure (no commit). Let me know.
