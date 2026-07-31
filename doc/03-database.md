# 04 - Database Design

# Suqly MVP Database Overview

The Suqly MVP database is designed to support two main users: Business Owners and Customers. The system manages digital storefronts, products, customer carts (Zembil), orders, and notifications.

---

# Core Entities

## 1. User

Stores all registered users.

Fields:
- id
- name
- email
- phone
- password
- role (OWNER / CUSTOMER)
- createdAt
- updatedAt

Relationships:
- Owner can create one Business
- Customer can have multiple Carts
- Customer can place multiple Orders
- User can receive Notifications

---

## 2. Business

Represents a seller's digital storefront.

Fields:
- id
- ownerId
- name
- logo
- motto
- description
- address
- phone
- createdAt
- updatedAt

Relationships:
- Belongs to one Owner
- Has many Categories
- Has many Products
- Has many Orders

---

## 3. Category

Organizes products inside a business.

Fields:
- id
- businessId
- name
- createdAt
- updatedAt

Relationships:
- Belongs to one Business
- Contains many Products

---

## 4. Product

Represents items sold by businesses.

Fields:
- id
- businessId
- categoryId (optional)
- name
- description
- image
- price
- stock
- isPublished
- isDeleted
- createdAt
- updatedAt

Rules:
- Only published products appear to customers.
- Deleted products are hidden but preserved for previous orders.

---

## 5. Cart (Zembil)

Temporary storage before placing an order.

Fields:
- id
- customerId
- businessId
- createdAt
- updatedAt

Rules:
- Customers have separate carts for different businesses.
- One customer can have only one active cart per business.
- Adding products to Zembil does not reduce stock.

---

## 6. Cart Item

Stores products inside a customer's Zembil.

Fields:
- id
- cartId
- productId
- quantity
- createdAt
- updatedAt

Rules:
- Quantity cannot exceed available stock.

---

## 7. Order

Represents a confirmed purchase.

Fields:
- id
- orderNumber
- customerId
- businessId
- status
- createdAt
- updatedAt

Order Status:

- Pending
- Processing
- Ready
- Completed
- Cancelled

Rules:
- An order belongs to one business only.
- Stock decreases after order placement.
- Cancelled orders return stock.

---

## 8. Order Item

Stores products purchased in an order.

Fields:
- id
- orderId
- productId
- quantity
- priceAtPurchase
- createdAt

Purpose:
Stores the original product price so previous orders remain accurate even if prices change.

---

## 9. Notification

Stores system notifications.

Fields:
- id
- userId
- type
- title
- message
- isRead
- createdAt

Notification Types:

- New Order
- Order Updated
- Order Cancelled
- Order Completed

---

# Database Relationship Summary
User
|
|---- Business
|
|---- Cart
|
|---- Order
|
|---- Notification

Business
|
|---- Category
|
|---- Product
|
|---- Order

Category
|
|---- Product

Cart
|
|---- Cart Item
|
|---- Product

Order
|
|---- Order Item
|
|---- Product


---

# MVP Permissions

## Business Owner

Can:
- Create and manage store
- Add and manage products
- Publish products
- View orders
- Update order status
- View order history

## Customer

Can:
- Browse stores and products
- Add products to Zembil
- Place orders
- Track orders
- View order history