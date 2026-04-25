import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import type { RazorpayOrderResponse, RazorpayVerificationResponse, PaymentReceipt } from '@/data/types';

// Load Razorpay script dynamically
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      toast.error('Failed to load payment gateway. Please try again.');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

interface UseRazorpayReturn {
  isLoading: boolean;
  paymentStatus: 'idle' | 'processing' | 'success' | 'failed';
  initiatePayment: (userId: string, courseId: string, onSuccess?: () => void) => Promise<void>;
  getPaymentReceipts: (userId: string, courseId?: string) => Promise<PaymentReceipt[]>;
  resetStatus: () => void;
}

export const useRazorpay = (): UseRazorpayReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const processingRef = useRef(false);

  const resetStatus = useCallback(() => {
    setPaymentStatus('idle');
    processingRef.current = false;
  }, []);

  const initiatePayment = useCallback(async (
    userId: string,
    courseId: string,
    onSuccess?: () => void
  ) => {
    if (processingRef.current) {
      toast.info('Payment already in progress');
      return;
    }

    processingRef.current = true;
    setIsLoading(true);
    setPaymentStatus('processing');

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load payment gateway');
      }

      // Create order
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, courseId })
      });

      // Check for non-JSON response
      const responseText = await orderResponse.text();
      let orderData: any;
      try {
        orderData = JSON.parse(responseText);
      } catch (e) {
        console.error('API response (not JSON):', responseText.substring(0, 500));
        throw new Error(`Server error: ${orderResponse.status}. Check console for details.`);
      }

      console.log('Order API response:', orderData);

      if (!orderResponse.ok || !orderData.success) {
        const errorMessage = orderData.message || orderData.details || `Failed to create order (${orderResponse.status})`;
        throw new Error(errorMessage);
      }

      if (!orderData.orderId) {
        throw new Error('Invalid order response');
      }

      // Configure Razorpay options
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Erudition Infinite',
        description: orderData.courseName,
        order_id: orderData.orderId,
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                courseId,
                userId
              })
            });

            const verifyData: RazorpayVerificationResponse = await verifyResponse.json();

            if (verifyResponse.ok && verifyData.success) {
              setPaymentStatus('success');
              toast.success(verifyData.message || 'Payment successful! You are now enrolled.');
              if (onSuccess) {
                onSuccess();
              }
            } else {
              setPaymentStatus('failed');
              toast.error(verifyData.message || 'Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            setPaymentStatus('failed');
            toast.error('Failed to verify payment. Please contact support.');
          } finally {
            setIsLoading(false);
            processingRef.current = false;
          }
        },
        prefill: {
          name: orderData.userName,
          email: orderData.userEmail,
          contact: ''
        },
        notes: {
          courseId: courseId,
          userId: userId
        },
        theme: {
          color: '#d4af37' // Gold color to match the theme
        },
        modal: {
          ondismiss: function() {
            setIsLoading(false);
            processingRef.current = false;
            setPaymentStatus('idle');
            toast.info('Payment cancelled. You can try again anytime.');
          }
        }
      };

      // Open Razorpay checkout
      const razorpayInstance = new (window as any).Razorpay(options);
      razorpayInstance.open();

    } catch (error) {
      console.error('Payment initiation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to initiate payment';
      toast.error(errorMessage);
      setPaymentStatus('failed');
      setIsLoading(false);
      processingRef.current = false;
    }
  }, []);

  const getPaymentReceipts = useCallback(async (userId: string, courseId?: string): Promise<PaymentReceipt[]> => {
    try {
      const url = new URL('/api/payment/receipt', window.location.origin);
      url.searchParams.append('userId', userId);
      if (courseId) {
        url.searchParams.append('courseId', courseId);
      }

      const response = await fetch(url.toString());
      const data = await response.json();

      if (response.ok && data.success) {
        return data.receipts || [];
      }

      return [];
    } catch (error) {
      console.error('Get receipts error:', error);
      return [];
    }
  }, []);

  return {
    isLoading,
    paymentStatus,
    initiatePayment,
    getPaymentReceipts,
    resetStatus
  };
};

export default useRazorpay;
