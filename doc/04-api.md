========================================
AUTHENTICATION
========================================

POST    /api/auth/register
POST    /api/auth/login
GET     /api/auth/profile
PATCH   /api/auth/profile


========================================
BUSINESS
========================================

POST    /api/business
GET     /api/business/me
GET     /api/business/:id
PATCH   /api/business/:id
GET     /api/business/:id/products


========================================
CATEGORY
========================================

POST    /api/categories
GET     /api/categories
PATCH   /api/categories/:id
DELETE  /api/categories/:id


========================================
PRODUCT
========================================

POST    /api/products
GET     /api/products
GET     /api/products/:id
GET     /api/products/my
GET     /api/products/search
PATCH   /api/products/:id
PATCH   /api/products/:id/status
DELETE  /api/products/:id


========================================
CART (ZEMBIL)
========================================

GET     /api/cart
GET     /api/cart/:businessId
POST    /api/cart/items
PATCH   /api/cart/items/:id
DELETE  /api/cart/items/:id
DELETE  /api/cart/:businessId


========================================
ORDER
========================================

POST    /api/orders
GET     /api/orders/customer
GET     /api/orders/business
GET     /api/orders/history
GET     /api/orders/:id
PATCH   /api/orders/:id/status


========================================
NOTIFICATION
========================================

GET     /api/notifications
PATCH   /api/notifications/:id/read
PATCH   /api/notifications/read-all


========================================
DASHBOARD
========================================

GET     /api/dashboard


========================================
SEARCH
========================================

GET     /api/search/products
GET     /api/search/businesses