'use client';

import { useStore, Invoice, Client } from '@/lib/store';
import { Share2, ArrowLeft, Printer, CheckCircle2, Phone, Mail, MapPin, Download } from 'lucide-react';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function InvoiceDetail({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const { invoices, clients, updateInvoice, logoUrl } = useStore();
  const [mounted, setMounted] = useState(false);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [client, setClient] = useState<Client | null>(null);
   const [scale, setScale] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async (type: 'pdf' | 'jpeg') => {
    const element = document.getElementById('invoice-printable');
    if (!element) return;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 3, // Very high resolution for professional look
        useCORS: true, 
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 800, // Fixed width for A4 consistency
      });

      const fileName = `mvee-invoice-${invoice?.id.replace('INV-', '')}`;

      if (type === 'jpeg') {
        const link = document.createElement('a');
        link.download = `${fileName}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.95);
        link.click();
      } else {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`${fileName}.pdf`);
      }
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    const qrElement = document.getElementById('qr-code-to-share');
    if (!qrElement || !invoice) return;

    setIsGenerating(true);
    const text = `Invoice from mvee.cuts\nInvoice No: #${invoice.id.replace('INV-', '')}\nTotal: ₹${invoice.amount}\nLink: ${window.location.href}`;

    try {
      if (navigator.share) {
        const canvas = await html2canvas(qrElement, { scale: 3, backgroundColor: '#ffffff' });
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
        
        if (blob) {
          const file = new File([blob], `payment_qr_${invoice.id}.jpg`, { type: 'image/jpeg' });
          
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: `Payment QR for Invoice #${invoice.id.replace('INV-', '')}`,
              text: text
            });
            return;
          }
        }
        
        // Fallback share text if files aren't supported but share is
        await navigator.share({
           title: 'Invoice Link',
           text: text
        });
      } else {
        // Fallback for desktop: open WhatsApp link
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      }
    } catch (err) {
      console.warn('Share failed:', err);
      // Final fallback
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    const inv = invoices.find(i => i.id === unwrappedParams.id);
    if (inv) {
      setInvoice(inv);
      const cl = clients.find(c => c.id === inv.clientId);
      if (cl) setClient(cl);
    }
  }, [unwrappedParams.id, invoices, clients]);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window === 'undefined') return;
      const screenWidth = window.innerWidth;
      const sidebarWidth = screenWidth > 768 ? 300 : 40; // Approx sidebar + padding
      const availableWidth = screenWidth - sidebarWidth;
      const a4WidthPx = 820; // 210mm is ~794px, plus some margin
      
      const newScale = Math.min(1, availableWidth / a4WidthPx);
      setScale(newScale);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [mounted, invoices, clients, unwrappedParams.id]);

  if (!mounted || !invoice) return <div className="p-8">Loading...</div>;

  const upiLink = `upi://pay?pa=${invoice.upiId}&pn=${encodeURIComponent(client?.name || 'Designer')}&am=${invoice.amount}&cu=INR&tn=${encodeURIComponent(`Invoice ${invoice.id}`)}`;

  const COLORS = {
    BLUE: '#2b70b6',
    GREEN: '#708238',
    GREEN_DARK: '#5d6b30',
    GREY_LIGHT: '#f3f4f6',
    TEXT_DARK: '#000000',
    TEXT_MUTED: '#666666'
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Top Nav (Hidden in Print) */}
      <div className="flex justify-between items-center no-print" style={{ marginBottom: '24px', position: 'relative', zIndex: 10 }}>
        <Link href="/invoices" className="btn-outline" style={{ padding: '8px' }}>
          <ArrowLeft size={18} /> <span className="hide-mobile">Back</span>
        </Link>
        <div className="flex gap-1 md:gap-2">
           <button 
             onClick={handleShare}
             disabled={isGenerating}
             className="btn-outline"
             style={{ background: '#25D366', color: 'white', border: 'none' }}
           >
             <Phone size={18} fill="white" /> <span className="hide-mobile">Share</span>
           </button>
           <div className="flex bg-white/10 dark:bg-black/10 rounded-xl p-1 gap-1 border border-black/5 dark:border-white/5">
             <button 
                onClick={() => handleDownload('pdf')} 
                disabled={isGenerating}
                className="btn-outline"
                style={{ border: 'none', padding: '8px 12px', fontSize: '13px' }}
             >
               {isGenerating ? '...' : <Download size={16} />} <span className="hide-mobile">PDF</span>
             </button>
             <button 
                onClick={() => handleDownload('jpeg')} 
                disabled={isGenerating}
                className="btn-outline"
                style={{ border: 'none', padding: '8px 12px', fontSize: '13px' }}
             >
               {isGenerating ? '...' : <Download size={16} />} <span className="hide-mobile">JPEG</span>
             </button>
           </div>
           <button onClick={() => window.print()} className="btn-outline">
             <Printer size={18} /> <span className="hide-mobile">Print</span>
           </button>
           <button 
             onClick={() => updateInvoice(invoice.id, { status: invoice.status === 'Paid' ? 'Pending' : 'Paid' })}
             className="btn-primary" 
             style={{ background: invoice.status === 'Paid' ? 'var(--success)' : 'var(--primary)', marginLeft: '10px' }}
           >
            {invoice.status === 'Paid' ? <CheckCircle2 size={18} /> : null}
            <span className="hide-mobile">Mark as </span>{invoice.status === 'Paid' ? 'Pending' : 'Paid'}
          </button>
        </div>
      </div>

      {/* Scaling Wrapper for Browser View */}
      <div style={{ 
        width: '100%', 
        overflow: 'hidden', 
        display: 'flex', 
        justifyContent: 'center',
        padding: '0 10px'
      }} className="no-print">
        <div style={{ 
          transform: `scale(${scale})`, 
          transformOrigin: 'top center',
          width: '210mm',
          height: `${297 * scale}mm`, // Shrink the height of the outer container as well
          transition: 'transform 0.2s ease-out'
        }}>
          {/* A4 INVOICE PAGE */}
          <div className="a4-page" id="invoice-printable" style={{ color: COLORS.TEXT_DARK, fontSize: '14px', fontFamily: "'Outfit', sans-serif", margin: 0 }}>
        {/* Header Image Match */}
        <div style={{ position: 'relative', width: '100%' }}>
          <img src="/logo head.png" alt="header" style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>

        {/* Client & Company Info */}
        <div className="flex justify-between items-start" style={{ padding: '30px 60px 20px' }}>
          <div>
            <p style={{ fontSize: '18px', color: COLORS.TEXT_MUTED, margin: '0 0 5px' }}>Invoice To:</p>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: COLORS.GREEN, margin: '0 0 25px' }}>{client?.name || 'MD ABDULLAH'}</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Phone size={14} fill={COLORS.BLUE} color={COLORS.BLUE} />
                <span style={{ color: COLORS.TEXT_DARK, fontWeight: '500' }}>{client?.phone || '..............................'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={14} fill={COLORS.BLUE} color={COLORS.BLUE} />
                <span style={{ color: COLORS.TEXT_DARK, fontWeight: '500' }}>{client?.email || '..............................'}</span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
             {logoUrl && (
                <img src={logoUrl} alt="studio-logo" style={{ maxHeight: '60px', width: 'auto', marginBottom: '8px' }} />
             )}
            <h2 style={{ fontSize: '24px', fontWeight: '900', margin: '0 0 5px', letterSpacing: '0.5px' }}>mvee.cuts</h2>
            <p style={{ fontSize: '13px', fontWeight: '300', color: COLORS.TEXT_DARK, margin: 0 }}>INVOICE NO: #{invoice.id.replace('INV-', '')}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '25px' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '40px' }}>
                <span style={{ color: COLORS.TEXT_MUTED, fontWeight: '600' }}>Invoice Date</span>
                <span style={{ fontWeight: '700' }}>{invoice.date}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '40px' }}>
                <span style={{ color: COLORS.TEXT_MUTED, fontWeight: '600' }}>Invoice Due</span>
                <span style={{ fontWeight: '700' }}>{invoice.dueDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Item Table */}
        <div style={{ padding: '20px 60px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: 'white', background: COLORS.GREEN }}>
                <th style={{ padding: '15px 25px', textAlign: 'left', fontWeight: '700' }}>Item description</th>
                <th style={{ padding: '15px 20px', textAlign: 'center', fontWeight: '700', background: '#3b4321' }}>Quantity</th>
                <th style={{ padding: '15px 20px', textAlign: 'center', fontWeight: '700' }}>Unite Price</th>
                <th style={{ padding: '15px 20px', textAlign: 'center', fontWeight: '700', background: '#3b4321' }}>Total Price</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '20px 25px' }}>
                    <p style={{ fontWeight: '700', margin: '0', fontSize: '15px' }}>{item.description}</p>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: '700', background: '#f8f8f8' }}>{String(item.quantity).padStart(2, '0')}</td>
                  <td style={{ textAlign: 'center', fontWeight: '700' }}>₹{item.price}</td>
                  <td style={{ textAlign: 'center', fontWeight: '700', background: '#f8f8f8' }}>₹{item.quantity * item.price}</td>
                </tr>
              ))}
              {/* Empty Rows to keep height */}
              {[...Array(Math.max(0, 4 - invoice.items.length))].map((_, i) => (
                <tr key={i} style={{ height: '80px', borderBottom: '1px solid #eee' }}>
                  <td></td>
                  <td style={{ background: '#f8f8f8' }}></td>
                  <td></td>
                  <td style={{ background: '#f8f8f8' }}></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Section */}
        <div className="flex justify-between items-start" style={{ padding: '20px 60px' }}>
          <div>
            <p style={{ fontWeight: '700', margin: '0 0 10px' }}>Payment method</p>
            <div id="qr-code-to-share" style={{ position: 'relative', border: '2px solid #000', padding: '6px', borderRadius: '4px', display: 'inline-block' }}>
              <QRCodeSVG 
                value={upiLink} 
                size={110}
                imageSettings={{
                  src: "/scscsc.jpg",
                  x: undefined,
                  y: undefined,
                  height: 30,
                  width: 30,
                  excavate: true,
                }}
              />
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '32px',
                height: '32px',
                background: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                <img 
                  src="/scscsc.jpg" 
                  alt="qr-center" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                />
              </div>
            </div>
          </div>

          <div style={{ width: '320px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', padding: '0 10px' }}>
              <span style={{ fontWeight: '600', color: COLORS.TEXT_MUTED }}>Sub Total</span>
              <span style={{ fontWeight: '700' }}>₹{(invoice.amount + (invoice.discount || 0)).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', padding: '0 10px' }}>
              <span style={{ fontWeight: '600', color: COLORS.TEXT_MUTED }}>Discount</span>
              <span style={{ fontWeight: '700' }}>₹{(invoice.discount || 0).toLocaleString()}</span>
            </div>

            {/* Grand Total Bar */}
            <div style={{ display: 'flex', borderRadius: '4px', overflow: 'hidden', height: '45px' }}>
              <div style={{ flex: 1, background: COLORS.GREEN, color: 'white', display: 'flex', alignItems: 'center', paddingLeft: '20px', fontWeight: '800', fontSize: '18px' }}>
                Grand Total
              </div>
              <div style={{ width: '120px', background: COLORS.BLUE, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '18px' }}>
                ₹{invoice.amount.toLocaleString()}/-
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width Footer Image (Includes Brand Shapes) */}
        <div style={{ borderTop: '1px solid #eee', marginTop: 'auto', position: 'relative', overflow: 'hidden' }}>
          <img src="/contact.png" alt="footer" style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
      </div>
    </div>
  </div>
</div>
);
}
