import axios from 'axios';
import { getDb } from './db.js';

// Wowbooks printer integration
export const sendToPrinter = async ({
  email,
  order,
  multipleAddress,
  userShippingAddress,
  pdfUrls,
  promocode = null,
}) => {
  try {
    console.log('Starting printer integration for order:', order.id);

    // Prepare order data for printer
    const orderRef = order.id;
    const address = multipleAddress || userShippingAddress;

    // Create order info for printer
    const orderInfo = {
      orderId: orderRef,
      printerOrderId: `PRINTER-${Date.now()}`, // Generate printer order ID
      customerName: `${address.firstName} ${address.lastName}`,
      customerEmail: email,
      orderDate: order.createdAt,
      shippingAddress: {
        firstName: address.firstName,
        lastName: address.lastName,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2 || '',
        town: address.town,
        county: address.county,
        postCode: address.postCode,
        country: address.country || 'United Kingdom'
      },
      items: order.basketItems || [],
      totalValue: order.payment?.amount || 0,
      promocode: promocode
    };

    // Send to printer via Wowbooks API
    const printerResponse = await createPrinterOrder(orderInfo, pdfUrls);
    
    if (printerResponse.success) {
      // Update order with printer order ID (push to array)
      const db = await getDb();
      await db.collection('Order').updateOne(
        { _id: order.id },
        { $push: { printerOrderIds: String(orderInfo.printerOrderId) } }
      );

      // Create order shipping record
      await createOrderShipping(order.id, orderInfo.printerOrderId, address.id);

      console.log('✅ Printer order created successfully:', orderInfo.printerOrderId);
      return {
        success: true,
        printerOrderId: orderInfo.printerOrderId,
        orderInfo
      };
    } else {
      throw new Error('Failed to create printer order');
    }

  } catch (error) {
    console.error('❌ Printer integration failed:', error);
    throw error;
  }
};

// Create printer order via Wowbooks API
const createPrinterOrder = async (orderInfo, pdfUrls) => {
  try {
    const payload = preparePrinterPayload(orderInfo, pdfUrls);
    
    // Call printer API (proxied through main app or direct)
    const response = await axios.post(
      `${process.env.MAIN_APP_URL}/api/printer/createOrder`,
      {
        orderDetails: payload,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      }
    );

    return {
      success: true,
      data: response.data,
      printerOrderId: orderInfo.printerOrderId
    };

  } catch (error) {
    console.error('Printer API error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

// Prepare payload for printer API
const preparePrinterPayload = (orderInfo, pdfUrls) => {
  return {
    orderId: orderInfo.orderId,
    printerOrderId: orderInfo.printerOrderId,
    customerName: orderInfo.customerName,
    customerEmail: orderInfo.customerEmail,
    shippingAddress: orderInfo.shippingAddress,
    items: orderInfo.items.map((item, index) => ({
      bookTitle: item.bookTitle || 'Custom Book',
      type: item.type || 'Hardcover',
      productCode: item.productCode || 'CUSTOM-001',
      jobReference: item.jobReference || `JOB-${Date.now()}-${index}`,
      quantity: item.quantity || 1,
      pageCount: item.pageCount || 50,
      value: item.value || 25.99,
      files: {
        cover: pdfUrls[index]?.cover || pdfUrls[0] || '',
        text: pdfUrls[index]?.text || pdfUrls[1] || ''
      }
    })),
    promocode: orderInfo.promocode,
    totalValue: orderInfo.totalValue
  };
};

// Create order shipping record
const createOrderShipping = async (orderId, printerOrderId, shippingAddressId) => {
  try {
    await axios.post(`${process.env.MAIN_APP_URL}/api/order/orderShipping`, {
      orderId,
      printerOrderId: printerOrderId.toString(),
      shippingAddressId,
    });
    
    console.log('✅ Order shipping record created');
  } catch (error) {
    console.error('❌ Failed to create shipping record:', error.message);
  }
};

// Handle printer status updates
export const handlePrinterStatusUpdate = async (printerOrderId, status, trackingUrl) => {
  try {
    console.log('Processing printer status update:', { printerOrderId, status, trackingUrl });

    // Find order by printer order ID
    const db = await getDb();
    const order = await db.collection('Order').findOne({
      printerOrderIds: { $elemMatch: { $eq: String(printerOrderId) } }
    }, { projection: { _id: 1, userId: 1 } });

    if (!order) {
      console.log('Order not found for printer ID:', printerOrderId);
      return { success: false, error: 'Order not found' };
    }

    // Update order status
    await db.collection('Order').updateOne(
      { _id: order._id },
      { $set: { orderStatus: status } }
    );

    // Add status history
    await db.collection('OrderStatusHistory').insertOne({
      orderId: order._id,
      status: status,
      timestamp: new Date(),
      message: { 
        printerOrderId,
        trackingUrl,
        timestamp: new Date().toISOString()
      }
    });

    console.log('✅ Order status updated:', order._id, status);
    return { success: true, orderId: order._id };

  } catch (error) {
    console.error('❌ Failed to update order status:', error);
    return { success: false, error: error.message };
  }
};

// Test printer integration
export const testPrinterIntegration = async () => {
  const testOrder = {
    id: 'TEST-ORDER-' + Date.now(),
    createdAt: new Date(),
    basketItems: [{
      bookTitle: 'Test Recipe Book',
      type: 'Hardcover',
      productCode: 'TEST-001',
      quantity: 1,
      pageCount: 50,
      value: 25.99
    }],
    payment: {
      amount: 25.99
    }
  };

  const testAddress = {
    id: 'test-address-id',
    firstName: 'Test',
    lastName: 'Customer',
    addressLine1: '123 Test Street',
    addressLine2: 'Apt 1',
    town: 'Test City',
    county: 'Test County',
    postCode: 'TE1 1ST',
    country: 'United Kingdom'
  };

  const testPdfUrls = [
    { cover: 'https://example.com/cover.pdf', text: 'https://example.com/text.pdf' }
  ];

  try {
    const result = await sendToPrinter({
      email: 'test@example.com',
      order: testOrder,
      userShippingAddress: testAddress,
      pdfUrls: testPdfUrls
    });

    console.log('✅ Printer integration test successful:', result);
    return result;
  } catch (error) {
    console.error('❌ Printer integration test failed:', error);
    throw error;
  }
};
