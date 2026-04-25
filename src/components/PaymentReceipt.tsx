import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { PaymentReceipt as PaymentReceiptType } from '@/data/types';

interface PaymentReceiptProps {
  userId: string;
  courseId: string;
  paymentId?: string;
}

export const PaymentReceipt = ({ userId, courseId, paymentId }: PaymentReceiptProps) => {
  const [receipts, setReceipts] = useState<PaymentReceiptType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchReceipts();
  }, [userId, courseId]);

  const fetchReceipts = async () => {
    try {
      const url = new URL('/api/payment/receipt', window.location.origin);
      url.searchParams.append('userId', userId);
      url.searchParams.append('courseId', courseId);
      if (paymentId) {
        url.searchParams.append('paymentId', paymentId);
      }

      const response = await fetch(url.toString());
      const data = await response.json();

      if (response.ok && data.success) {
        setReceipts(data.receipts || []);
      }
    } catch (error) {
      console.error('Fetch receipts error:', error);
    }
  };

  const generateReceiptHTML = (receipt: PaymentReceiptType): string => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Payment Receipt - ${receipt.courseName}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 40px;
      background: #f5f5f5;
    }
    .receipt-container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #d4af37;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #1e293b;
      margin-bottom: 8px;
    }
    .receipt-title {
      font-size: 20px;
      color: #d4af37;
      margin-bottom: 5px;
    }
    .receipt-subtitle {
      color: #64748b;
      font-size: 14px;
    }
    .success-badge {
      background: #dcfce7;
      color: #166534;
      padding: 8px 16px;
      border-radius: 20px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 20px;
    }
    .info-section {
      margin-bottom: 25px;
    }
    .section-title {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #94a3b8;
      margin-bottom: 8px;
    }
    .info-value {
      font-size: 16px;
      color: #1e293b;
      font-weight: 500;
    }
    .amount-section {
      background: #f8fafc;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      margin: 25px 0;
    }
    .amount-label {
      font-size: 14px;
      color: #64748b;
      margin-bottom: 8px;
    }
    .amount-value {
      font-size: 32px;
      font-weight: bold;
      color: #1e293b;
    }
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 25px;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      color: #94a3b8;
      font-size: 12px;
    }
    @media print {
      body { background: white; }
      .receipt-container { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="header">
      <div class="logo">Erudition Infinite</div>
      <div class="receipt-title">PAYMENT RECEIPT</div>
      <div class="receipt-subtitle">Thank you for your purchase!</div>
    </div>

    <div style="text-align: center;">
      <div class="success-badge">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        Payment Successful
      </div>
    </div>

    <div class="amount-section">
      <div class="amount-label">Amount Paid</div>
      <div class="amount-value">₹${receipt.amount.toLocaleString()}</div>
    </div>

    <div class="info-section">
      <div class="section-title">Student Name</div>
      <div class="info-value">${receipt.userName}</div>
    </div>

    <div class="info-section">
      <div class="section-title">Course Name</div>
      <div class="info-value">${receipt.courseName}</div>
    </div>

    <div class="info-section">
      <div class="section-title">Instructor</div>
      <div class="info-value">${receipt.instructor}</div>
    </div>

    <div class="details-grid">
      <div class="info-section">
        <div class="section-title">Payment ID</div>
        <div class="info-value" style="font-size: 13px; word-break: break-all;">${receipt.paymentId}</div>
      </div>

      <div class="info-section">
        <div class="section-title">Order ID</div>
        <div class="info-value" style="font-size: 13px; word-break: break-all;">${receipt.orderId}</div>
      </div>

      <div class="info-section">
        <div class="section-title">Receipt ID</div>
        <div class="info-value" style="font-size: 13px; word-break: break-all;">${receipt.receiptId}</div>
      </div>

      <div class="info-section">
        <div class="section-title">Payment Date</div>
        <div class="info-value">${new Date(receipt.paymentDate).toLocaleDateString('en-IN', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</div>
      </div>
    </div>

    <div class="footer">
      <p>For any queries, please contact support@eruditioninfinite.com</p>
      <p style="margin-top: 8px;">This is a computer-generated receipt and does not require a signature.</p>
    </div>
  </div>
</body>
</html>
    `;
  };

  const downloadReceipt = (receipt: PaymentReceiptType) => {
    const html = generateReceiptHTML(receipt);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${receipt.receiptId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Receipt downloaded successfully');
  };

  if (receipts.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-5 w-5 text-gold" />
          <h4 className="font-semibold text-card-foreground">Payment Receipts</h4>
        </div>
        
        <div className="space-y-3">
          {receipts.map((receipt) => (
            <div 
              key={receipt.paymentId} 
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                  <span className="text-sm font-medium text-card-foreground truncate">
                    ₹{receipt.amount.toLocaleString()} paid
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(receipt.paymentDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => downloadReceipt(receipt)}
                className="shrink-0 ml-2"
              >
                <Download className="h-4 w-4 mr-1" />
                Receipt
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaymentReceipt;
