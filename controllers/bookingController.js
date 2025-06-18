// eslint-disable-next-line import/no-extraneous-dependencies
const crypto = require('crypto');
const cashfree = require('../utils/cashfree');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);
  if (!tour) return next(new AppError('Tour not found', 404));

  const orderId = `natours_${Date.now()}`;

  const tourId = tour.id;
  const userId = req.user.id;
  const { price } = tour;

  const orderPayload = {
    order_id: orderId,
    order_amount: tour.price,
    order_currency: 'INR',
    customer_details: {
      customer_id: req.user.id,
      customer_email: req.user.email,
      customer_phone: req.user.phone || '9999999999',
      customer_name: req.user.name,
    },
    order_meta: {
      // `${req.protocol}://${req.get('host')}/my-tours`,
      // return_url: `${req.protocol}://${req.get('host')}/?tour=${tourId}&user=${userId}&price=${price}&alert=payment`,
      return_url: `${req.protocol}://${req.get('host')}/my-tours`,
      tour_id: tour.id,
    },
  };

  const orderRes = await cashfree.PGCreateOrder(orderPayload);

  res.status(200).json({
    status: 'success',
    session: {
      paymentSessionId: orderRes.data.payment_session_id,
      orderId,
    },
  });
});

// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//   // console.log('🔁 Redirected to / with query:', req.query);
//   // console.log('👤 User from cookie/session:', req.user);

//   const { tour, user, price } = req.query;
//   if (!tour || !user || !price) return next();

//   const existingBooking = await Booking.findOne({ tour, user, price });
//   if (!existingBooking) {
//     await Booking.create({ tour, user, price });
//     console.log('✅ Booking created!');
//   } else {
//     console.log('ℹ️ Booking already exists');
//   }

//   // res.redirect(req.originalUrl.split('?')[0]);
//   res.redirect(`/?alert=payment`);
// });

const createBookingCheckout = async (order, customerEmail) => {
  console.log('✅ CREATE BOOKING TRIGGERED via webhook:', order.order_id);
  const tourId = order.order_meta.tour_id;
  const user = (await User.findOne({ email: customerEmail })).id;
  const price = order.order_amount;
  await Booking.create({ tour: tourId, user, price });
};

exports.webhookCheckout = async (req, res) => {
  console.log('🚨 Webhook endpoint HIT');

  try {
    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];
    const secret = process.env.CASHFREE_CLIENT_SECRET;

    const rawBody = req.body.toString('utf8'); // <- Make sure req.body is a Buffer
    console.log('🟡 Raw Body:', rawBody);

    const signedPayload = timestamp + rawBody;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('base64');

    if (signature !== expectedSignature) {
      console.log('❌ Signature mismatch');
      return res.status(400).send('Signature mismatch');
    }

    const eventData = JSON.parse(rawBody);
    console.log('✅ Verified Webhook Data:', eventData);

    if (
      eventData.event === 'PAYMENT_SUCCESS_WEBHOOK' &&
      eventData.payload?.order?.order_status === 'PAID'
    ) {
      const { order } = eventData.payload;
      const customerEmail = order.customer_details.customer_email;

      await createBookingCheckout(order, customerEmail);
    } else {
      console.log(
        '⚠️ Order status not PAID:',
        eventData.payload?.order?.order_status,
      );
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(500).send('Internal Server Error');
  }
};

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
