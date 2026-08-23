import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    
    const validPassword = process.env.ADMIN_PASSWORD;

    if (!validPassword) {
      return NextResponse.json({ error: "خطأ في تكوين النظام: لم يتم إعداد كلمة مرور الإدارة" }, { status: 500 });
    }

    if (password === validPassword) {
      const cookieStore = await cookies();
      cookieStore.set("admin_token", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "كلمة المرور غير صحيحة" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
