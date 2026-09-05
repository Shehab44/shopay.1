"use server";

export async function submitContactForm(data: {
  fullName: string;
  email: string;
  orderNumber?: string;
  message: string;
}) {
  // Simulate network delay
  await new Promise(res => setTimeout(res, 1000));

  // Log the received data (Mock DB/Email integration)
  console.log("📥 Received Contact Form Submission:");
  console.log(`- Name: ${data.fullName}`);
  console.log(`- Email: ${data.email}`);
  console.log(`- Order Number: ${data.orderNumber || "N/A"}`);
  console.log(`- Message: ${data.message}`);

  return { success: true, message: "تم استلام رسالتك بنجاح، فريقنا سيرد عليك في أقرب وقت" };
}
