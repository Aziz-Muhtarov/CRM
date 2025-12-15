import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // 🔒 Проверяем доступ к страницам админки
    if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // 🔐 Пример: защищаем дашборд от неавторизованных
    if (pathname.startsWith("/dashboard") && !token) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Разрешаем только авторизованным пользователям
    },
  }
);

// Применяем middleware только к этим маршрутам:
export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};