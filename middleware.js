import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { routeRoles } from './lib/middleware/roleConfig';
import { upload } from './lib/middleware/uploadConfig';

const SECRET_KEY = process.env.SECRET_KEY;

export async function middleware(req) {
    const { pathname, method } = req.nextUrl;

    // ✅ ตรวจเฉพาะ API
    if (pathname.startsWith('/api')) {
        const token = req.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
        }

        let payload;
        try {
            payload = jwt.verify(token, SECRET_KEY);
        } catch (err) {
            console.error('JWT verify failed:', err.message);
            return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 401 });
        }

        // ✅ Role check
        const requiredRoles = routeRoles[pathname];
        if (requiredRoles && !requiredRoles.includes(payload.role)) {
            return NextResponse.json({ error: 'Access denied. Insufficient role.' }, { status: 403 });
        }

        // ✅ Attach user info to headers
        const headers = new Headers(req.headers);
        headers.set('x-user-id', payload.id);
        headers.set('x-user-role', payload.role);

        // ✅ Auto run multer for POST/PUT requests (ถ้ามี file upload)
        if (['POST', 'PUT'].includes(method)) {
            try {
                await new Promise((resolve, reject) => {
                    upload.any()(req, {}, (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
            } catch (uploadErr) {
                console.error('Upload error:', uploadErr.message);
                return NextResponse.json({ error: 'Upload failed', details: uploadErr.message }, { status: 500 });
            }
        }

        return NextResponse.next({ request: { headers } });
    }

    return NextResponse.next();
}