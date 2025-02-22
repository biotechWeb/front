import { NextResponse } from "next/server";
import { auth } from "./lib/firebase";

export function middleware(req) {
    const user = auth.currentUser;
    const protectedRoutes = ["/dashboard"];

    if (protectedRoutes.includes(req.nextUrl.pathname) && !user) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/medicos"],
};
