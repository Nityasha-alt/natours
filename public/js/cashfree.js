/* eslint-disable */
import { showAlert } from './alerts';

const alertMessage = new URLSearchParams(window.location.search).get('alert');
if (alertMessage === 'payment') showAlert('success', 'Payment successful!');

export async function bookTour(tourId) {
  try {
    const res = await fetch(`/api/v1/bookings/checkout-session/${tourId}`);
    const data = await res.json();

    const { paymentSessionId } = data.session;

    const cashfree = new window.Cashfree({ mode: 'production' });

    // ✅ Use checkout with redirectTarget: '_self' to redirect to payment page
    await cashfree.checkout({
      paymentSessionId,
      redirectTarget: '_self', // ⬅️ performs a full redirect
    });
  } catch (err) {
    console.error('❌ Payment Error:', err);
    showAlert('error', 'Payment failed. Try again!');
  }
}
