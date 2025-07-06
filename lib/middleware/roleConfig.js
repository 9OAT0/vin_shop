export const routeRoles = {
    '/api/getCartDetails': ['USER'],
    '/api/addtoCart': ['USER'],
    '/api/getOrders': ['USER', 'ADMIN'],
    '/api/getOrderAdmin': ['ADMIN'],
    '/api/ProductUpload': ['ADMIN'],
    '/api/ordersFix': ['ADMIN'],
    '/api/recommendation': ['ADMIN', 'USER'],
};