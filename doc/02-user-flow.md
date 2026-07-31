# 02 - User Flow

# Suqly MVP User Flow

This document describes how Business Owners and Customers interact with the Suqly platform from registration to order completion.

---

# 1. Authentication

## Landing Page

Users visit the landing page and can choose to:

- Sign In
- Create an Account

During registration, users select one of the following roles:

- Business Owner
- Customer

After successful authentication, users are redirected based on their role.

---

# 2. Business Owner Flow

## First Login

After logging in for the first time, the Business Owner is redirected to the Dashboard.

If no store exists, the dashboard displays a **Create Store** button.

↓

Create Store

↓

Fill in business information:

- Store Name
- Logo
- Motto
- Description
- Address
- Phone Number

↓

Store Created Successfully

↓

Dashboard

---

## Dashboard

The dashboard provides a quick overview of:

- Total Products
- Pending Orders
- Processing Orders
- Ready Orders
- Completed Orders

From the dashboard, the owner can navigate to:

- Products
- Orders
- History
- Settings

---

## Product Management

Owner opens Products.

↓

Click Add Product.

↓

Enter:

- Product Name
- Description
- Price
- Stock Quantity
- Category
- Product Image

↓

Save Product

↓

Product is created as Draft.

↓

Owner chooses:

- Publish
- Edit
- Delete

Only published products are visible to customers.

---

## Order Management

Customer places an order.

↓

Owner receives a notification.

↓

Owner opens Orders.

↓

View Order Details.

↓

Owner chooses:

- Processing
- Ready
- Cancelled

↓

If Ready

↓

Customer is notified.

↓

Customer completes payment outside the platform.

↓

Owner changes status to Completed.

↓

Order moves to History.

---

# 3. Customer Flow

## Home

After logging in, customers are taken to the Home page.

They can:

- Browse products
- Search products
- Open product details

---

## Product Details

Customer views:

- Product images
- Description
- Price
- Available stock

↓

Choose quantity.

↓

Click Add to Zembil.

↓

Product is added to the store-specific cart.

---

## Zembil

Customer can:

- Increase quantity
- Decrease quantity
- Remove product

↓

Click Place Order.

↓

Order is created.

↓

Owner receives notification.

↓

Customer is redirected to My Orders.

---

## My Orders

Customers can view:

- Pending
- Processing
- Ready
- Completed
- Cancelled

Each order displays:

- Order Number
- Products
- Quantity
- Current Status
- Order Date

---

# 4. Order Lifecycle

Customer places order.

↓

Status = Pending

↓

Owner starts processing.

↓

Status = Processing

↓

Order is prepared.

↓

Status = Ready

↓

Customer pays and collects the order.

↓

Status = Completed

If the owner cannot fulfill the order:

↓

Status = Cancelled

↓

Order moves to History.

---

# 5. Notifications

Business Owner receives notifications when:

- A new order is placed.

Customer receives notifications when:

- Order status changes to Processing.
- Order status changes to Ready.
- Order is Completed.
- Order is Cancelled.

---

# 6. History

Completed and Cancelled orders are automatically moved to History.

Both Business Owners and Customers can view their own order history.