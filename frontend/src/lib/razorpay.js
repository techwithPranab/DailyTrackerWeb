/**
 * Dynamically loads the Razorpay checkout script and opens the payment modal.
 */
export const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

/**
 * Opens the Razorpay checkout modal.
 * @param {object} options - Razorpay options (key, amount, order_id, prefill, handler, etc.)
 */
export const openCheckout = async (options) => {
  const loaded = await loadRazorpay();
  if (!loaded) throw new Error('Razorpay SDK failed to load. Check your internet connection.');
  const rzp = new window.Razorpay(options);
  rzp.open();
  return rzp;
};
