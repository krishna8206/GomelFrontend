import { useState } from 'react';

const BookingModal = ({ open, onClose, booking }) => {
  if (!open || !booking) return null;
  const v = booking.verification || {};
  const att = v.attachments || {};
  const attData = v.attachmentsData || {};

  const [viewerUrl, setViewerUrl] = useState(null);
  const isImage = (dataUrl) => typeof dataUrl === 'string' && dataUrl.startsWith('data:image');

  const handleView = (url) => {
    if (!url) return;
    if (isImage(url)) {
      setViewerUrl(url);
    } else {
      // For PDFs or other types, open in new tab
      window.open(url, '_blank');
    }
  };

  const handleDownload = (url, filename) => {
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full md:max-w-4xl bg-white rounded-xl border border-primary/20 shadow-xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10 rounded-t-xl">
          <h3 className="text-xl font-bold text-primary">Booking Details</h3>
          <button onClick={onClose} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">Close</button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 border border-primary/20"><p className="text-muted text-sm">Booking ID</p><p className="font-semibold">{booking.id || '-'}</p></div>
            <div className="bg-white rounded-xl p-4 border border-primary/20"><p className="text-muted text-sm">User</p><p className="font-semibold">{booking.userId || '-'}</p></div>
            <div className="bg-white rounded-xl p-4 border border-primary/20"><p className="text-muted text-sm">Car</p><p className="font-semibold">{booking.carName || booking.carId}</p></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 border border-primary/20">
              <h4 className="font-semibold text-primary mb-2">Schedule</h4>
              <p className="text-sm"><span className="text-muted">Pickup:</span> {booking.pickupDate}</p>
              <p className="text-sm"><span className="text-muted">Return:</span> {booking.returnDate}</p>
              <p className="text-sm"><span className="text-muted">Pickup Location:</span> {booking.pickupLocation}</p>
              <p className="text-sm"><span className="text-muted">Return Location:</span> {booking.returnLocation}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-primary/20">
              <h4 className="font-semibold text-primary mb-2">Payment</h4>
              <p className="text-sm"><span className="text-muted">Days:</span> {booking.days}</p>
              <p className="text-sm"><span className="text-muted">Total:</span> ₹{booking.totalCost}</p>
              {booking.payment && (
                <>
                  <p className="text-sm"><span className="text-muted">Payment ID:</span> {booking.payment.id}</p>
                  <p className="text-sm"><span className="text-muted">Method:</span> {booking.payment.method}</p>
                  <p className="text-sm"><span className="text-muted">Status:</span> {booking.payment.status}</p>
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-primary/20">
            <h4 className="font-semibold text-primary mb-3">Identity & License</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm"><span className="text-muted">ID Type:</span> {v.idType}</p>
                <p className="text-sm"><span className="text-muted">ID Number:</span> {v.idNumber}</p>
                <p className="text-sm"><span className="text-muted">License No:</span> {v.licenseNumber}</p>
                <p className="text-sm"><span className="text-muted">License Expiry:</span> {v.licenseExpiry}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[{k:'idFront', label:'ID Front'}, {k:'idBack', label:'ID Back'}, {k:'license', label:'License'}].map(({k,label}) => (
                  <div key={k}>
                    <p className="text-sm font-semibold mb-1">{label}</p>
                    {attData[k] ? (
                      <div className="space-y-2">
                        {isImage(attData[k]) ? (
                          <img
                            src={attData[k]}
                            alt={label}
                            className="w-full h-28 object-cover rounded border cursor-pointer"
                            onClick={() => handleView(attData[k])}
                          />
                        ) : (
                          <button
                            onClick={() => handleView(attData[k])}
                            className="px-3 py-2 text-sm bg-white border rounded hover:bg-gray-50"
                          >
                            Open Document
                          </button>
                        )}
                        <button
                          onClick={() => handleDownload(attData[k], `${label.replace(/\s+/g,'_').toLowerCase()}.png`)}
                          className="w-full px-3 py-2 text-sm bg-primary text-white rounded hover:bg-primaryDark"
                        >
                          Download
                        </button>
                      </div>
                    ) : (
                      <p className="text-muted text-xs">Not uploaded</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {viewerUrl && (
          <div className="fixed inset-0 z-[120] bg-black/70 flex items-center justify-center p-4" onClick={() => setViewerUrl(null)}>
            <img src={viewerUrl} alt="Preview" className="max-h-[90vh] max-w-[90vw] rounded shadow-lg border" />
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
