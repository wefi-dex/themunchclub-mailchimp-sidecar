import mailchimpTransactional from '@mailchimp/mailchimp_transactional';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Mailchimp Transactional (Mandrill) client
const mcTx = process.env.MAILCHIMP_TRANSACTIONAL_API_KEY
  ? mailchimpTransactional(process.env.MAILCHIMP_TRANSACTIONAL_API_KEY)
  : null;

// Mailchimp Template Configuration (prefer template NAME; fallback to legacy *_ID envs)
export const MAILCHIMP_TEMPLATES = {
  WELCOME_NEW_CONTACTS: process.env.MAILCHIMP_WELCOME_NEW_CONTACTS_TEMPLATE_NAME || process.env.MAILCHIMP_WELCOME_NEW_CONTACTS_TEMPLATE_ID || 'welcome-new-contacts-template-name',
  ORDER_RECEIVED: process.env.MAILCHIMP_ORDER_RECEIVED_TEMPLATE_NAME || process.env.MAILCHIMP_ORDER_RECEIVED_TEMPLATE_ID || 'order-received-template-name',
  ORDER_SHIPPED: process.env.MAILCHIMP_ORDER_SHIPPED_TEMPLATE_NAME || process.env.MAILCHIMP_ORDER_SHIPPED_TEMPLATE_ID || 'order-shipped-template-name',
  FORGOT_PASSWORD: process.env.MAILCHIMP_FORGOT_PASSWORD_TEMPLATE_NAME || process.env.MAILCHIMP_FORGOT_PASSWORD_TEMPLATE_ID || 'forgot-password-template-name',
  REGISTRATION: process.env.MAILCHIMP_REGISTRATION_TEMPLATE_NAME || process.env.MAILCHIMP_REGISTRATION_TEMPLATE_ID || 'registration-template-name',
  SMS_SIGNUP: process.env.MAILCHIMP_SMS_SIGNUP_TEMPLATE_NAME || process.env.MAILCHIMP_SMS_SIGNUP_TEMPLATE_ID || 'sms-signup-template-name',
  TERMS_CONDITIONS: process.env.MAILCHIMP_TERMS_CONDITIONS_TEMPLATE_NAME || process.env.MAILCHIMP_TERMS_CONDITIONS_TEMPLATE_ID || 'terms-conditions-template-name',
  PRIVACY_POLICY: process.env.MAILCHIMP_PRIVACY_POLICY_TEMPLATE_NAME || process.env.MAILCHIMP_PRIVACY_POLICY_TEMPLATE_ID || 'privacy-policy-template-name',
  BULK_SELECT_FORGOT_PASSWORD: process.env.MAILCHIMP_BULK_SELECT_FORGOT_PASSWORD_TEMPLATE_NAME || process.env.MAILCHIMP_BULK_SELECT_FORGOT_PASSWORD_TEMPLATE_ID || 'bulk-select-forgot-password-template-name'
};

export const sendTransactionalEmail = async ({
  to,
  from,
  subject,
  htmlContent,
  templateName = null,
  templateId = null, // legacy support
  dynamicData = {}
}) => {
  try {
    if (!mcTx) {
      throw new Error('MAILCHIMP_TRANSACTIONAL_API_KEY is not set');
    }

    let response;
    
    const resolvedTemplateName = templateName || templateId || null;
    if (resolvedTemplateName) {
      // Use Mailchimp template
      const message = {
        from_email: from,
        to: [{ email: to, type: 'to' }],
        merge_vars: Object.keys(dynamicData).map(key => ({
          name: key,
          content: dynamicData[key]
        }))
      };
      if (process.env.MANDRILL_SUBACCOUNT) {
        message.subaccount = process.env.MANDRILL_SUBACCOUNT;
      }
      
      response = await mcTx.messages.sendTemplate({
        template_name: resolvedTemplateName,
        template_content: [],
        message: message
      });
    } else {
      // Use custom HTML content
      const message = {
        from_email: from,
        to: [{ email: to, type: 'to' }],
        subject,
        html: htmlContent,
      };
      if (process.env.MANDRILL_SUBACCOUNT) {
        message.subaccount = process.env.MANDRILL_SUBACCOUNT;
      }
      
      response = await mcTx.messages.send({ message });
    }
    
    console.log('Mailchimp email sent:', response);
    return response;
  } catch (error) {
    console.error('Mailchimp send error:', error);
    throw error;
  }
};

export const sendAdminNotification = async (orderInfo) => {
  return sendTransactionalEmail({
    to: process.env.ADMIN_EMAIL,
    from: process.env.FROM_EMAIL,
    templateId: MAILCHIMP_TEMPLATES.ORDER_RECEIVED,
    dynamicData: {
      order_id: orderInfo.orderId,
      printer_order_id: orderInfo.printerOrderId,
      order_date: new Date(orderInfo.orderDate).toLocaleString(),
      customer_name: orderInfo.customerName,
      customer_email: orderInfo.customerEmail,
      shipping_address: `${orderInfo.shippingAddress.firstName} ${orderInfo.shippingAddress.lastName}, ${orderInfo.shippingAddress.addressLine1}, ${orderInfo.shippingAddress.town}, ${orderInfo.shippingAddress.postCode}`,
      order_items: orderInfo.items.map(item => 
        `${item.bookTitle} (${item.type}) - Qty: ${item.quantity} - £${item.value.toFixed(2)}`
      ).join('\n'),
      total_value: `£${orderInfo.totalValue.toFixed(2)}`
    }
  });
};

export const sendOrderConfirmation = async (user, order) => {
  return sendTransactionalEmail({
    to: user.email,
    from: process.env.FROM_EMAIL,
    templateId: MAILCHIMP_TEMPLATES.ORDER_RECEIVED,
    dynamicData: {
      customer_name: user.name,
      order_id: order.id,
      order_date: new Date(order.createdAt).toLocaleString(),
      order_status: order.orderStatus,
      order_items: order.basketItems?.map(item => 
        `${item.book?.title || 'Book'} (${item.type}) - Qty: ${item.quantity}`
      ).join('\n') || 'No items',
      total_amount: order.payment?.amount ? `£${order.payment.amount.toFixed(2)}` : 'TBD'
    }
  });
};

export const sendOrderShipped = async (user, order, trackingUrl, shippingAddress) => {
  return sendTransactionalEmail({
    to: user.email,
    from: process.env.FROM_EMAIL,
    templateName: MAILCHIMP_TEMPLATES.ORDER_SHIPPED,
    dynamicData: {
      // Only fields required by the Order Shipped template
      first_name: shippingAddress?.firstName || '',
      last_name: shippingAddress?.lastName || '',
      address: shippingAddress?.addressLine1 || '',
      town: shippingAddress?.town || '',
      county: shippingAddress?.county || '',
      post_code: shippingAddress?.postCode || '',
      trackingUrl: trackingUrl
    }
  });
};

export const sendPasswordReset = async (user, resetUrl) => {
  return sendTransactionalEmail({
    to: user.email,
    from: process.env.FROM_EMAIL,
    templateId: MAILCHIMP_TEMPLATES.FORGOT_PASSWORD,
    dynamicData: {
      customer_name: user.name,
      reset_url: resetUrl,
      user_email: user.email
    }
  });
};

export const sendRegistrationWelcome = async (user) => {
  return sendTransactionalEmail({
    to: user.email,
    from: process.env.FROM_EMAIL,
    templateId: MAILCHIMP_TEMPLATES.REGISTRATION,
    dynamicData: {
      customer_name: user.name,
      user_email: user.email,
      main_app_url: process.env.MAIN_APP_URL
    }
  });
};

// Additional email functions for all Mailchimp templates

export const sendWelcomeNewContacts = async (user) => {
  return sendTransactionalEmail({
    to: user.email,
    from: process.env.FROM_EMAIL,
    templateId: MAILCHIMP_TEMPLATES.WELCOME_NEW_CONTACTS,
    dynamicData: {
      customer_name: user.name,
      user_email: user.email,
      main_app_url: process.env.MAIN_APP_URL
    }
  });
};

export const sendSmsSignup = async (user, phoneNumber) => {
  return sendTransactionalEmail({
    to: user.email,
    from: process.env.FROM_EMAIL,
    templateId: MAILCHIMP_TEMPLATES.SMS_SIGNUP,
    dynamicData: {
      customer_name: user.name,
      user_email: user.email,
      phone_number: phoneNumber
    }
  });
};

export const sendTermsConditions = async (user) => {
  return sendTransactionalEmail({
    to: user.email,
    from: process.env.FROM_EMAIL,
    templateId: MAILCHIMP_TEMPLATES.TERMS_CONDITIONS,
    dynamicData: {
      customer_name: user.name,
      user_email: user.email,
      main_app_url: process.env.MAIN_APP_URL
    }
  });
};

export const sendPrivacyPolicy = async (user) => {
  return sendTransactionalEmail({
    to: user.email,
    from: process.env.FROM_EMAIL,
    templateId: MAILCHIMP_TEMPLATES.PRIVACY_POLICY,
    dynamicData: {
      customer_name: user.name,
      user_email: user.email,
      main_app_url: process.env.MAIN_APP_URL
    }
  });
};

export const sendBulkSelectForgotPassword = async (users) => {
  // For bulk operations, send individual emails
  const results = [];
  for (const user of users) {
    try {
      const result = await sendTransactionalEmail({
        to: user.email,
        from: process.env.FROM_EMAIL,
        templateId: MAILCHIMP_TEMPLATES.BULK_SELECT_FORGOT_PASSWORD,
        dynamicData: {
          customer_name: user.name,
          user_email: user.email,
          reset_url: user.resetUrl || `${process.env.MAIN_APP_URL}/reset-password`
        }
      });
      results.push({ user: user.email, success: true, result });
    } catch (error) {
      results.push({ user: user.email, success: false, error: error.message });
    }
  }
  return results;
};

// Book download notification via Mandrill template name: MAILCHIMP_BOOK_DOWNLOAD_TEMPLATE_NAME
export const sendBookDownload = async (user, bookTitle) => {
  const templateName = process.env.MAILCHIMP_BOOK_DOWNLOAD_TEMPLATE_NAME || null;
  if (!templateName) {
    // Fallback: send simple HTML if template not configured
    return sendTransactionalEmail({
      to: user.email,
      from: process.env.FROM_EMAIL,
      subject: 'Your book download',
      htmlContent: `<p>Hi ${user.name || ''},</p><p>Your book ${bookTitle || ''} was downloaded.</p>`
    });
  }
  return sendTransactionalEmail({
    to: user.email,
    from: process.env.FROM_EMAIL,
    templateName,
    dynamicData: {
      customer_name: user.name,
      book_title: bookTitle || 'Recipe Book'
    }
  });
};
