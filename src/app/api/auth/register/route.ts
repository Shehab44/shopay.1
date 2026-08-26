import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import bcrypt from 'bcrypt';
import { otpCache, checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, phone, fullName, password, otpCode } = body;

    if (!phone) {
      return NextResponse.json({ error: 'رقم الهاتف مطلوب' }, { status: 400 });
    }

    // Get IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown-ip';
    const rateLimitKey = `${ip}_${phone}`;

    if (action === 'request_otp') {
      const { success } = checkRateLimit(otpCache, rateLimitKey, 3);
      if (!success) {
        return NextResponse.json({ error: 'لقد تجاوزت الحد الأقصى لطلب الرمز. يرجى المحاولة بعد 15 دقيقة.' }, { status: 429 });
      }

      const existingUser = await prisma.user.findUnique({ where: { phone } });

      if (existingUser && existingUser.passwordHash !== 'GUEST_NO_LOGIN') {
        return NextResponse.json({ error: 'هذا الرقم مسجل مسبقاً، يرجى تسجيل الدخول' }, { status: 400 });
      }

      // Fail Closed Logic for Guest Merge in Production
      if (existingUser && existingUser.passwordHash === 'GUEST_NO_LOGIN') {
        if (process.env.NODE_ENV === 'production' && !process.env.SMS_API_KEY) {
          console.error("CRITICAL: Attempted to merge guest account in production without SMS API KEY!");
          return NextResponse.json({ error: 'هذا الرقم مرتبط بطلبات سابقة. يرجى التواصل مع الدعم لتوثيق الرقم وإعداد كلمة مرور.' }, { status: 403 });
        }
      }

      // Generate 4 digit OTP
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      
      // Delete old codes for this phone
      await prisma.otpCode.deleteMany({ where: { phone } });

      // Save new code (expires in 5 minutes)
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      await prisma.otpCode.create({
        data: { phone, code, expiresAt }
      });

      // Send SMS
      if (process.env.NODE_ENV === 'production' && process.env.SMS_API_KEY) {
        // TODO: Implement Real SMS Provider here
        console.log(`[SMS API MOCK - PROD] Sending ${code} to ${phone}`);
      } else {
        // Development Mock
        console.log(`\n\n========================================`);
        console.log(`[MOCK SMS] Your OTP for ${phone} is: ${code}`);
        console.log(`========================================\n\n`);
      }

      return NextResponse.json({ success: true, message: 'تم إرسال رمز التحقق' });
    } 
    
    else if (action === 'verify_otp') {
      if (!fullName || !password || !otpCode) {
        return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 });
      }

      // Verify OTP
      const otpRecord = await prisma.otpCode.findFirst({
        where: { phone },
        orderBy: { createdAt: 'desc' }
      });

      if (!otpRecord) {
        return NextResponse.json({ error: 'رمز التحقق غير موجود أو منتهي الصلاحية' }, { status: 400 });
      }

      if (otpRecord.code !== otpCode) {
        return NextResponse.json({ error: 'رمز التحقق غير صحيح' }, { status: 400 });
      }

      if (new Date() > otpRecord.expiresAt) {
        return NextResponse.json({ error: 'رمز التحقق منتهي الصلاحية' }, { status: 400 });
      }

      const existingUser = await prisma.user.findUnique({ where: { phone } });
      const passwordHash = await bcrypt.hash(password, 10);

      if (existingUser && existingUser.passwordHash === 'GUEST_NO_LOGIN') {
        // Merge!
        await prisma.user.update({
          where: { phone },
          data: { 
            fullName, 
            passwordHash,
            role: 'customer' // ensure role is correct
          }
        });
      } else if (!existingUser) {
        // Create new
        await prisma.user.create({
          data: {
            phone,
            fullName,
            passwordHash,
            role: 'customer'
          }
        });
      } else {
         return NextResponse.json({ error: 'هذا الرقم مسجل مسبقاً' }, { status: 400 });
      }

      // Clean up OTP
      await prisma.otpCode.deleteMany({ where: { phone } });

      return NextResponse.json({ success: true, message: 'تم التسجيل بنجاح' });
    }

    return NextResponse.json({ error: 'إجراء غير معروف' }, { status: 400 });

  } catch (error: any) {
    console.error('Registration API Error:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
