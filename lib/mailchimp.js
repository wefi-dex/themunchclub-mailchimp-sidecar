import mailchimpTransactional from '@mailchimp/mailchimp_transactional';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Mailchimp Transactional (Mandrill) client
const mcTx = process.env.MAILCHIMP_TRANSACTIONAL_API_KEY
  ? mailchimpTransactional(process.env.MAILCHIMP_TRANSACTIONAL_API_KEY)
  : null;

export const sendTransactionalEmail = async ({
  to,
  from,
  subject,
  htmlContent,
  templateId = null,
  dynamicData = {}
}) => {
  try {
    if (!mcTx) {
      throw new Error('MAILCHIMP_TRANSACTIONAL_API_KEY is not set');
    }

    const message = {
      from_email: from,
      to: [{ email: to, type: 'to' }],
      subject,
      html: htmlContent,
    };

    // If you use stored templates in Mandrill, you can use messages.sendTemplate instead.
    const response = await mcTx.messages.send({ message });
    
    console.log('Mailchimp email sent:', response);
    return response;
  } catch (error) {
    console.error('Mailchimp send error:', error);
    throw error;
  }
};

export const sendAdminNotification = async (orderInfo) => {
  const htmlContent = `
    <h1>New Order Received</h1>
    <h2>Order Details:</h2>
    <p><strong>Order ID:</strong> ${orderInfo.orderId}</p>
    <p><strong>Printer Order ID:</strong> ${orderInfo.printerOrderId}</p>
    <p><strong>Order Date:</strong> ${new Date(orderInfo.orderDate).toLocaleString()}</p>
    
    <h2>Customer Information:</h2>
    <p><strong>Name:</strong> ${orderInfo.customerName}</p>
    <p><strong>Email:</strong> ${orderInfo.customerEmail}</p>
    
    <h2>Shipping Address:</h2>
    <p>${orderInfo.shippingAddress.firstName} ${orderInfo.shippingAddress.lastName}</p>
    <p>${orderInfo.shippingAddress.addressLine1}</p>
    ${orderInfo.shippingAddress.addressLine2 ? `<p>${orderInfo.shippingAddress.addressLine2}</p>` : ''}
    <p>${orderInfo.shippingAddress.town}, ${orderInfo.shippingAddress.county}</p>
    <p>${orderInfo.shippingAddress.postCode}, ${orderInfo.shippingAddress.country}</p>
    
    <h2>Order Items:</h2>
    <ul>
      ${orderInfo.items.map(item => `
        <li>
          <strong>${item.bookTitle}</strong><br>
          Type: ${item.type} (${item.productCode})<br>
          Quantity: ${item.quantity}<br>
          Value: £${item.value.toFixed(2)}
        </li>
      `).join('')}
    </ul>
    
    <h2>Order Summary:</h2>
    <p><strong>Total Value:</strong> £${orderInfo.totalValue.toFixed(2)}</p>
  `;

  return sendTransactionalEmail({
    to: process.env.ADMIN_EMAIL,
    from: process.env.FROM_EMAIL,
    subject: `New Order Received - Order ID: ${orderInfo.orderId}`,
    htmlContent
  });
};

export const sendOrderConfirmation = async (user, order) => {
  const htmlContent = `
    <h1>Order Confirmation</h1>
    <p>Dear ${user.name},</p>
    <p>Thank you for your order! We've received your order and will process it shortly.</p>
    
    <h2>Order Details:</h2>
    <p><strong>Order ID:</strong> ${order.id}</p>
    <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
    <p><strong>Status:</strong> ${order.orderStatus}</p>
    
    <p>We'll send you another email when your order ships.</p>
    <p>Best regards,<br>The Munch Club Team</p>
  `;

  return sendTransactionalEmail({
    to: user.email,
    from: process.env.FROM_EMAIL,
    subject: "Your Order Has Been Received",
    htmlContent
  });
};

export const sendOrderShipped = async (user, order, trackingUrl) => {
  const htmlContent = `
    <h1>Your Order Has Shipped!</h1>
    <p>Dear ${user.name},</p>
    <p>Great news! Your order has been shipped and is on its way to you.</p>
    
    <h2>Order Details:</h2>
    <p><strong>Order ID:</strong> ${order.id}</p>
    <p><strong>Tracking:</strong> <a href="${trackingUrl}">Track Your Package</a></p>
    
    <p>Thank you for choosing The Munch Club!</p>
    <p>Best regards,<br>The Munch Club Team</p>
  `;

  return sendTransactionalEmail({
    to: user.email,
    from: process.env.FROM_EMAIL,
    subject: "Your Order Has Shipped",
    htmlContent
  });
};

export const sendPasswordReset = async (user, resetUrl) => {
  const htmlContent = `
    <h1>Password Reset Request</h1>
    <p>Dear ${user.name},</p>
    <p>You requested a password reset for your The Munch Club account.</p>
    
    <p><a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Your Password</a></p>
    
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
    
    <p>Best regards,<br>The Munch Club Team</p>
  `;

  return sendTransactionalEmail({
    to: user.email,
    from: process.env.FROM_EMAIL,
    subject: "Password Reset Request",
    htmlContent
  });
};

export const sendRegistrationWelcome = async (user) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2c3e50; margin-bottom: 10px;">Welcome to The Munch Club!</h1>
        <p style="color: #7f8c8d; font-size: 16px;">Your culinary journey starts here</p>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #2c3e50; margin-top: 0;">Hello ${user.name}!</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #34495e;">
          Thank you for joining The Munch Club! We're excited to have you as part of our community of food lovers and home chefs.
        </p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h3 style="color: #2c3e50;">What you can do now:</h3>
        <ul style="color: #34495e; line-height: 1.6;">
          <li>🍳 <strong>Create your first cookbook</strong> - Start collecting your favorite recipes</li>
          <li>📚 <strong>Browse our recipe library</strong> - Discover amazing dishes from our community</li>
          <li>👨‍🍳 <strong>Share your own recipes</strong> - Inspire others with your culinary creations</li>
          <li>📖 <strong>Order custom cookbooks</strong> - Get your recipes printed in beautiful books</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.MAIN_APP_URL}/library" 
           style="background-color: #e74c3c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Start Creating Your Cookbook
        </a>
      </div>
      
      <div style="border-top: 1px solid #ecf0f1; padding-top: 20px; margin-top: 30px;">
        <p style="color: #7f8c8d; font-size: 14px; text-align: center;">
          Need help getting started? Check out our <a href="${process.env.MAIN_APP_URL}/faq" style="color: #3498db;">FAQ page</a> or 
          <a href="${process.env.MAIN_APP_URL}/contact-us" style="color: #3498db;">contact us</a>.
        </p>
        <p style="color: #7f8c8d; font-size: 14px; text-align: center; margin-top: 10px;">
          Happy cooking!<br>
          <strong>The Munch Club Team</strong>
        </p>
      </div>
    </div>
  `;

  return sendTransactionalEmail({
    to: user.email,
    from: process.env.FROM_EMAIL,
    subject: "Welcome to The Munch Club! 🍳",
    htmlContent
  });
};
