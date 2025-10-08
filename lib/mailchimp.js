import mailchimpTransactional from '@mailchimp/mailchimp_transactional';

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
