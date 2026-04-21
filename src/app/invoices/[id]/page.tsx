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
    // Specifically target the hidden 1:1 version for a perfect render
    const element = document.getElementById('invoice-download-version');
    if (!element) return;

    // Ensure all fonts are fully loaded before capturing
    await document.fonts.ready;
    
    // Tiny delay to ensure layout has settled in the hidden container
    await new Promise(resolve => setTimeout(resolve, 300));

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2, // More stable scale
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        imageTimeout: 5000,
        windowWidth: 1200, // Wider viewport for better font calculation
        // Match browser rendering as closely as possible
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('invoice-download-version');
          if (el) {
             el.style.fontFamily = "'Outfit', sans-serif";
             el.style.textRendering = "optimizeLegibility";
             el.style.webkitFontSmoothing = "antialiased";
          }
        }
      });

      const fileName = `mvee-invoice-${invoice?.id.replace('INV-', '')}`;

      if (type === 'jpeg') {
        const link = document.createElement('a');
        link.download = `${fileName}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.98);
        link.click();
      } else {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
          compress: true
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
        pdf.save(`${fileName}.pdf`);
      }
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to generate file. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    const qrElement = document.getElementById('qr-share-card');
    if (!qrElement || !invoice) return;

    setIsGenerating(true);
    const fileName = `mvee_qr_${invoice.id.replace('INV-', '')}.jpg`;
    const shareText = `Invoice from mvee.cuts\nInvoice No: #${invoice.id.replace('INV-', '')}\nTotal: ₹${invoice.amount}\nLink: ${window.location.origin}/invoices/${invoice.id}`;

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        const canvas = await html2canvas(qrElement, { 
          scale: 4, 
          backgroundColor: '#ffffff',
          useCORS: true,
          logging: false
        });
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
        
        if (blob) {
          const file = new File([blob], fileName, { type: 'image/jpeg' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
             await navigator.share({
               title: `Invoice #${invoice.id}`,
               text: shareText,
               files: [file],
             });
             return;
          }
        }
        
        await navigator.share({
           title: 'Invoice Details',
           text: shareText
        });
      } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
      }
    } catch (error) {
      console.warn('Share error:', error);
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
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

  const InvoiceContent = ({ isDownload = false }) => {
    const containerStyle: React.CSSProperties = {
      color: COLORS.TEXT_DARK, 
      fontSize: '14px', 
      fontFamily: "'Outfit', sans-serif", 
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      width: isDownload ? '794px' : '210mm',
      minHeight: isDownload ? '1123px' : '297mm',
      background: 'white',
      boxShadow: isDownload ? 'none' : '0 0 20px rgba(0,0,0,0.1)',
      position: 'relative',
      letterSpacing: '0.01em',
      lineHeight: '1.4',
      textRendering: 'geometricPrecision',
      WebkitFontSmoothing: 'antialiased'
    };

    return (
      <div className="a4-page" style={containerStyle}>
        {/* Header Image */}
        <div style={{ position: 'relative', width: '100%' }}>
          <img src="/logo head.png" alt="header" style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>

        {/* Client & Info */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          padding: '30px 60px 20px',
          alignItems: 'start'
        }}>
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

          <div style={{ textAlign: 'right' }}>
            {logoUrl && (
              <img src={logoUrl} alt="studio-logo" style={{ maxHeight: '60px', width: 'auto', marginBottom: '8px', marginLeft: 'auto' }} />
            )}
            <h2 style={{ fontSize: '24px', fontWeight: '900', margin: '0 0 5px', letterSpacing: '0.5px' }}>mvee.cuts</h2>
            <p style={{ fontSize: '13px', fontWeight: '400', color: COLORS.TEXT_DARK, margin: 0 }}>INVOICE NO: #{invoice.id.replace('INV-', '')}</p>
            
            <div style={{ marginTop: '25px', display: 'grid', gap: '8px', justifyItems: 'end' }}>
              <div style={{ display: 'flex', gap: '40px' }}>
                <span style={{ color: COLORS.TEXT_MUTED, fontWeight: '600' }}>Invoice Date</span>
                <span style={{ fontWeight: '700', width: '100px', textAlign: 'right' }}>{invoice.date}</span>
              </div>
              <div style={{ display: 'flex', gap: '40px' }}>
                <span style={{ color: COLORS.TEXT_MUTED, fontWeight: '600' }}>Invoice Due</span>
                <span style={{ fontWeight: '700', width: '100px', textAlign: 'right' }}>{invoice.dueDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Item Table */}
        <div style={{ padding: '20px 60px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) 90px 110px 110px', background: COLORS.GREEN, color: 'white' }}>
            <div style={{ padding: '15px 25px', textAlign: 'left', fontWeight: '700' }}>Item description</div>
            <div style={{ padding: '15px 10px', textAlign: 'center', fontWeight: '700', background: '#3b4321' }}>Quantity</div>
            <div style={{ padding: '15px 10px', textAlign: 'center', fontWeight: '700' }}>Unite Price</div>
            <div style={{ padding: '15px 10px', textAlign: 'center', fontWeight: '700', background: '#3b4321' }}>Total Price</div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {invoice.items.map((item, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) 90px 110px 110px', borderBottom: '1px solid #eee' }}>
                <div style={{ padding: '20px 25px', fontWeight: '700', fontSize: '15px' }}>{item.description}</div>
                <div style={{ padding: '20px 10px', textAlign: 'center', fontWeight: '700', background: '#f8f8f8' }}>{String(item.quantity).padStart(2, '0')}</div>
                <div style={{ padding: '20px 10px', textAlign: 'center', fontWeight: '700' }}>₹{item.price}</div>
                <div style={{ padding: '20px 10px', textAlign: 'center', fontWeight: '700', background: '#f8f8f8' }}>₹{item.quantity * item.price}</div>
              </div>
            ))}
            {[...Array(Math.max(0, 4 - invoice.items.length))].map((_, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) 90px 110px 110px', height: '80px', borderBottom: '1px solid #eee' }}>
                <div />
                <div style={{ background: '#f8f8f8' }} />
                <div />
                <div style={{ background: '#f8f8f8' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Summary Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', padding: '20px 60px', alignItems: 'end', marginTop: '10px' }}>
          <div>
            <p style={{ fontWeight: '700', margin: '0 0 10px' }}>Payment method</p>
            <div style={{ position: 'relative', border: '1px solid #eee', padding: '15px', borderRadius: '12px', display: 'inline-block', background: 'white' }}>
              <QRCodeSVG value={upiLink} size={130} level="H" />
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '40px', height: '40px', background: '#6b8341', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                <div style={{ width: '30px', height: '30px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <img src="/scscsc.jpg" alt="logo" style={{ width: '190%', height: '190%', objectFit: 'cover', objectPosition: 'center 60%' }} />
                </div>
              </div>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', padding: '0 10px' }}>
              <span style={{ fontWeight: '600', color: COLORS.TEXT_MUTED }}>Sub Total</span>
              <span style={{ fontWeight: '700' }}>₹{(invoice.amount + (invoice.discount || 0)).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', padding: '0 10px' }}>
              <span style={{ fontWeight: '600', color: COLORS.TEXT_MUTED }}>Discount</span>
              <span style={{ fontWeight: '700' }}>₹{(invoice.discount || 0).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', borderRadius: '4px', overflow: 'hidden', height: '50px' }}>
              <div style={{ flex: 1, background: COLORS.GREEN, color: 'white', display: 'flex', alignItems: 'center', paddingLeft: '20px', fontWeight: '800', fontSize: '20px' }}>Grand Total</div>
              <div style={{ width: '130px', background: COLORS.BLUE, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '20px' }}>₹{invoice.amount.toLocaleString()}/-</div>
            </div>
          </div>
        </div>

        {/* Footer Image */}
        <div style={{ marginTop: 'auto' }}>
          <img src="/contact.png" alt="footer" style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Top Nav */}
      <div className="flex justify-between items-center no-print" style={{ marginBottom: '24px', position: 'relative', zIndex: 10 }}>
        <Link href="/invoices" className="btn-outline" style={{ padding: '8px' }}>
          <ArrowLeft size={18} /> <span className="hide-mobile">Back</span>
        </Link>
        <div className="flex gap-1 md:gap-2">
           <button onClick={handleShare} disabled={isGenerating} className="btn-outline" style={{ background: '#25D366', color: 'white', border: 'none' }}>
             <Phone size={18} fill="white" /> <span className="hide-mobile">Share</span>
           </button>
           <div className="flex bg-white/10 dark:bg-black/10 rounded-xl p-1 gap-1 border border-black/5 dark:border-white/5">
             <button onClick={() => handleDownload('pdf')} disabled={isGenerating} className="btn-outline" style={{ border: 'none', padding: '8px 12px', fontSize: '13px' }}>
               {isGenerating ? '...' : <Download size={16} />} <span className="hide-mobile">PDF</span>
             </button>
             <button onClick={() => handleDownload('jpeg')} disabled={isGenerating} className="btn-outline" style={{ border: 'none', padding: '8px 12px', fontSize: '13px' }}>
               {isGenerating ? '...' : <Download size={16} />} <span className="hide-mobile">JPEG</span>
             </button>
           </div>
           <button onClick={() => window.print()} className="btn-outline">
             <Printer size={18} /> <span className="hide-mobile">Print</span>
           </button>
           <button onClick={() => updateInvoice(invoice.id, { status: invoice.status === 'Paid' ? 'Pending' : 'Paid' })} className="btn-primary" style={{ background: invoice.status === 'Paid' ? 'var(--success)' : 'var(--primary)', marginLeft: '10px' }}>
            {invoice.status === 'Paid' ? <CheckCircle2 size={18} /> : null}
            <span className="hide-mobile">Mark as </span>{invoice.status === 'Paid' ? 'Pending' : 'Paid'}
          </button>
        </div>
      </div>

      {/* Scaling Wrapper for Browser View */}
      <div style={{ width: '100%', overflow: 'hidden', display: 'flex', justifyContent: 'center', padding: '0 10px' }} className="no-print">
        <div style={{ 
          transform: `scale(${scale})`, 
          transformOrigin: 'top center',
          width: '210mm',
          height: `${297 * scale}mm`, 
          transition: 'transform 0.2s ease-out'
        }}>
          <InvoiceContent />
        </div>
      </div>

      {/* HIDDEN 1:1 VERSION FOR DOWNLOAD */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <div id="invoice-download-version">
          <InvoiceContent isDownload={true} />
        </div>
      </div>
    </div>
  );
}
