import { useEffect, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import SmsListener from 'react-native-android-sms-listener';
import { useDrafts } from '@/hooks/useDrafts';
import { PaymentMethod } from '@/types/budget';

export function usePaymentListener() {
  const { addDraft, refreshDrafts } = useDrafts();
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    let subscription: any;

    const setupListener = async () => {
      if (Platform.OS !== 'android') return;

      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
          {
            title: 'SMS Permission',
            message: 'App needs access to SMS to auto-detect payments',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setHasPermission(true);
          
          // Refresh drafts just in case
          refreshDrafts();

          subscription = SmsListener.addListener((message: any) => {
            handleIncomingSms(message.originatingAddress, message.body);
          });
        } else {
          console.log('SMS permission denied');
        }
      } catch (err) {
        console.warn(err);
      }
    };

    setupListener();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  const handleIncomingSms = (sender: string, body: string) => {
    // Only process if it looks like a debit/payment
    const isDebit = /(debited|sent|paid|spent|deducted)/i.test(body);
    const isCredit = /(credited|received|refunded)/i.test(body);

    if (isDebit || isCredit) {
      // Try to extract amount
      const amountMatch = body.match(/(?:Rs\.?|INR)\s*(\d+(?:,\d+)*(?:\.\d+)?)/i);
      if (!amountMatch) return; // No amount found

      const amountStr = amountMatch[1].replace(/,/g, '');
      const amount = parseFloat(amountStr);

      if (isNaN(amount) || amount <= 0) return;

      // Try to extract payee (rudimentary)
      let note = 'Unknown Merchant';
      const toMatch = body.match(/to\s+([A-Za-z0-9\s@.]+)(?:\s+on|\s+ref|\.|$)/i);
      if (toMatch && toMatch[1]) {
        note = toMatch[1].trim();
      } else {
        const fromMatch = body.match(/from\s+([A-Za-z0-9\s@.]+)(?:\s+on|\s+ref|\.|$)/i);
        if (fromMatch && fromMatch[1]) {
          note = fromMatch[1].trim();
        }
      }

      if (isCredit && !isDebit) {
        note = note !== 'Unknown Merchant' ? `${note} (Received)` : 'Received';
      }

      // Determine payment method (default UPI for simplicity if VPA is present, else debit)
      let paymentMethod: PaymentMethod = 'debit';
      if (/upi|vpa|@/i.test(body) || /upi/i.test(note)) {
        paymentMethod = 'upi';
      } else if (/credit card/i.test(body)) {
        paymentMethod = 'credit';
      }

      addDraft({
        amount,
        note,
        paymentMethod,
        dateISO: new Date().toISOString(),
        originalMessage: body,
        sender,
      });
    }
  };

  return { hasPermission };
}
