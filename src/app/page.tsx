'use client'
import React, { useState, useMemo, useRef, useEffect } from 'react';

type PaycenterMessage = {
  source: 'paycenter';
  status: number;
  clientRef: string;
  reqid: string;
  data: any;
};

export default function Home() {

  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaycenterMessage | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const bridgeReturnUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/api/paycenter/return?bridge=1`;
  }, []);

  // Listen for return bridge → save in state
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (typeof window === 'undefined') return;
      if (event.origin !== window.location.origin) return;
      if (event.data?.source !== 'paycenter') return;
      setPaymentResult(event.data as PaycenterMessage); // <-- save first
      setIframeUrl(null); // close overlay
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  // After state updated, alert it
  useEffect(() => {
    if (!paymentResult) return;
    alert(
      `Payment result:
status=${paymentResult.status}
clientRef=${paymentResult.clientRef}
reqid=${paymentResult.reqid}
payload=${JSON.stringify(paymentResult.data, null, 2)}`
    );
  }, [paymentResult]);

  async function sendInitRequest() {
    setLoading(true);
    try {
      const payload = {
        version: '1.5',
        msgId: crypto.randomUUID(),
        operation: 'PAYMENT_INIT',
        requestDate: new Date().toISOString(),
        validateOnly: false,
        requestData: {
          clientId: '14007313',
          transactionType: 'PURCHASE',
          transactionAmount: {
            totalAmount: 0,
            paymentAmount: 200,
            serviceFeeAmount: 0,
            currency: 'LKR',
          },
          redirect: {
            returnUrl: bridgeReturnUrl,   // bridge posts JSON to parent
            cancelUrl: bridgeReturnUrl,   // optional
            returnMethod: 'GET',
          },
          clientRef: `ORDER-${crypto.randomUUID()}`,
          comment: `Test ${new Date().toISOString()}`,
          tokenize: false,
          useReliability: true,
          extraData: { st_id: '123456', batch_id: '102348748', group: '1231458' },
        },
      };

      const res = await fetch('/api/paycenter', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data: any;
      try { data = JSON.parse(text); } catch { data = { raw: text }; }

      const url =
        data?.responseData?.paymentPageUrl ||
        data?.paymentPageUrl ||
        data?.redirectUrl;

      if (!url) {
        alert('No payment page URL received.');
        return;
      }
      setIframeUrl(url);
    } catch (e: any) {
      console.error(e);
      alert(`Init failed: ${e?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', padding: 20, display: 'flex', flexDirection: 'column', gap: 16, background: '#f9f9f9', color: '#333', fontFamily: 'Arial, sans-serif' }}>
      <h1>Paycenter API Test (Save then Alert)</h1>

      <button onClick={sendInitRequest} disabled={loading} style={{ alignSelf: 'flex-start', padding: '10px 20px', fontSize: 16 }}>
        {loading ? 'Sending…' : 'Send Init Request'}
      </button>

      {paymentResult && (
        <pre style={{ background: '#fff', padding: 12, borderRadius: 8, maxWidth: 900, overflow: 'auto' }}>
          {JSON.stringify(paymentResult, null, 2)}
        </pre>
      )}

      {iframeUrl && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ position: 'relative', width: '90%', height: '90%' }}>
            <button onClick={() => setIframeUrl(null)} style={{ position: 'absolute', top: 10, right: 10, background: '#fff', border: 'none', fontSize: 24, borderRadius: '50%', padding: '4px 10px', zIndex: 10000 }}>
              &times;
            </button>
            <iframe ref={iframeRef} src={iframeUrl} style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }} />
          </div>
        </div>
      )}
    </main>
  );
}
