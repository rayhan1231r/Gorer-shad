import React, { useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  Printer,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  AlertTriangle,
  UserCheck,
  Copy,
  Check,
  Phone,
  MessageSquare,
  CreditCard,
  MapPin,
  Calendar,
  Tag,
  ShieldCheck
} from 'lucide-react';
import { Order, OrderStatus, PaymentStatus, BusinessConfig } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { PrintSlipModal } from './PrintSlipModal.tsx';

interface OrderManagementProps {
  orders: Order[];
  config?: BusinessConfig;
  onRefreshOrders?: () => void;
  onRefreshData?: () => void;
}

export const OrderManagement: React.FC<OrderManagementProps> = ({ orders, config, onRefreshOrders, onRefreshData }) => {
  const { language } = useLanguage();
  const refreshFn = onRefreshOrders || onRefreshData || (() => {});
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [printModalData, setPrintModalData] = useState<{ order: Order; type: 'kitchen' | 'receipt' } | null>(null);

  // Drawer update state
  const [editStatus, setEditStatus] = useState<OrderStatus>('placed');
  const [editPaymentStatus, setEditPaymentStatus] = useState<PaymentStatus>('pending');
  const [deliveryPerson, setDeliveryPerson] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [copiedTrx, setCopiedTrx] = useState(false);

  // Reset Order Counter & History Modal State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetNotice, setResetNotice] = useState<string | null>(null);

  const handleResetOrders = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = resetConfirmText.trim().toUpperCase();
    if (clean !== 'RESET' && clean !== 'রিসেট') {
      setResetNotice('নিশ্চিত করতে অনুগ্রহ করে ঠিকভাবে "RESET" অথবা "রিসেট" শব্দটি টাইপ করুন।');
      return;
    }

    try {
      setIsResetting(true);
      const res = await api.resetOrderCount(clean, 'all');
      if (res.success) {
        setIsResetModalOpen(false);
        setResetConfirmText('');
        setResetNotice(null);
        refreshFn();
      }
    } catch (err: unknown) {
      setResetNotice(err instanceof Error ? err.message : 'অর্ডার রিসেট করতে সমস্যা হয়েছে');
    } finally {
      setIsResetting(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    if (statusFilter !== 'all' && o.orderStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNo = o.orderNumber.toLowerCase().includes(q);
      const matchName = o.customerName.toLowerCase().includes(q);
      const matchPhone = o.customerPhone.includes(q);
      const matchZone = o.deliveryZoneName.toLowerCase().includes(q);
      const matchTrx = o.paymentTransactionId?.toLowerCase().includes(q);
      if (!matchNo && !matchName && !matchPhone && !matchZone && !matchTrx) return false;
    }
    return true;
  });

  const openOrderDrawer = (order: Order) => {
    setSelectedOrder(order);
    setEditStatus(order.orderStatus);
    setEditPaymentStatus(order.paymentStatus || 'pending');
    setDeliveryPerson(order.assignedDeliveryPerson || '');
    setAdminNotes(order.adminNotes || '');
  };

  const handleCopyTrx = (trx: string) => {
    navigator.clipboard.writeText(trx);
    setCopiedTrx(true);
    setTimeout(() => setCopiedTrx(false), 2000);
  };

  const handleSaveOrderUpdates = async () => {
    if (!selectedOrder) return;
    try {
      setIsUpdating(true);
      await api.updateOrderStatus(selectedOrder.id, editStatus, 'Updated via Admin Order Manager', {
        assignedDeliveryPerson: deliveryPerson.trim() || undefined,
        adminNotes: adminNotes.trim() || undefined,
        paymentStatus: editPaymentStatus
      });
      setIsUpdating(false);
      setSelectedOrder(null);
      refreshFn();
    } catch (err) {
      console.error(err);
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={language === 'en' ? "Order #, customer name, phone number..." : "অর্ডার নং (GS-2601), গ্রাহকের নাম, মোবাইল..."}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-emerald-600 bg-white"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">{language === 'en' ? `All Orders (${orders.length})` : `সব অর্ডার (${orders.length})`}</option>
              <option value="placed">{language === 'en' ? 'New (Placed)' : 'নতুন (Placed)'}</option>
              <option value="accepted">{language === 'en' ? 'Accepted' : 'গৃহীত (Accepted)'}</option>
              <option value="preparing">{language === 'en' ? 'Preparing (Cooking)' : 'রান্না চলছে (Preparing)'}</option>
              <option value="ready">{language === 'en' ? 'Ready for Pickup' : 'প্রস্তুত (Ready)'}</option>
              <option value="out_for_delivery">{language === 'en' ? 'Out for Delivery' : 'ডেলিভারির পথে (Out)'}</option>
              <option value="delivered">{language === 'en' ? 'Delivered' : 'ডেলিভারড (Delivered)'}</option>
              <option value="cancelled">{language === 'en' ? 'Cancelled' : 'বাতিল (Cancelled)'}</option>
            </select>

            <button
              onClick={refreshFn}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors shrink-0 cursor-pointer"
            >
              {language === 'en' ? 'Refresh' : 'রিফ্রেশ'}
            </button>

            <button
              onClick={() => setIsResetModalOpen(true)}
              className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold rounded-xl transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
              title="অর্ডার হিস্টোরি ও কাউন্টার রিসেট করুন"
            >
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>{language === 'en' ? 'Reset Counter' : 'অর্ডার কাউন্ট রিসেট'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">{language === 'en' ? 'Order #' : 'অর্ডার নং'}</th>
                <th className="py-3 px-4">{language === 'en' ? 'Customer & Phone' : 'গ্রাহকের নাম ও ফোন'}</th>
                <th className="py-3 px-4">{language === 'en' ? 'Area / Zone' : 'এলাকা'}</th>
                <th className="py-3 px-4">{language === 'en' ? 'Time Slot' : 'সময় স্লট'}</th>
                <th className="py-3 px-4">{language === 'en' ? 'Bill' : 'বিল'}</th>
                <th className="py-3 px-4">{language === 'en' ? 'Payment' : 'পেমেন্ট'}</th>
                <th className="py-3 px-4">{language === 'en' ? 'Status' : 'অবস্থা'}</th>
                <th className="py-3 px-4 text-right">{language === 'en' ? 'Action' : 'অ্যাকশন'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    {language === 'en' ? 'No orders found matching criteria' : 'কোনো অর্ডার খুঁজে পাওয়া যায়নি'}
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {order.orderNumber}
                      {order.isUrgent && (
                        <span className="block text-[10px] text-rose-600 font-sans font-bold">জরুরি</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900 block">{order.customerName}</span>
                      <span className="text-slate-500 font-mono text-[11px]">{order.customerPhone}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800 block truncate max-w-[120px]">{order.deliveryZoneName}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="block text-slate-900">{order.requestedTimeSlot}</span>
                      <span className="text-[11px] text-slate-400">{order.requestedDate}</span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900 tabular-nums">
                      ৳{order.totalAmount}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold uppercase text-slate-800">{order.paymentMethod}</span>
                      <span className="block text-[10px] text-slate-500">
                        {order.paymentStatus === 'paid' || order.paymentStatus === 'verified' ? 'পরিশোধিত' : 'বাকি'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                        order.orderStatus === 'delivered' ? 'bg-emerald-50 text-emerald-700' :
                        order.orderStatus === 'preparing' ? 'bg-amber-50 text-amber-800' :
                        order.orderStatus === 'out_for_delivery' ? 'bg-blue-50 text-blue-700' :
                        order.orderStatus === 'cancelled' || order.orderStatus === 'rejected' ? 'bg-rose-50 text-rose-700' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {order.orderStatus === 'placed' ? 'নতুন অর্ডার' :
                         order.orderStatus === 'accepted' ? 'গৃহীত' :
                         order.orderStatus === 'preparing' ? 'রান্না হচ্ছে' :
                         order.orderStatus === 'ready' ? 'প্রস্তুত' :
                         order.orderStatus === 'out_for_delivery' ? 'ডেলিভারির পথে' :
                         order.orderStatus === 'delivered' ? 'ডেলিভার সম্পন্ন' : 'বাতিল'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPrintModalData({ order, type: 'kitchen' })}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                          title="কিচেন স্লিপ প্রিন্ট"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openOrderDrawer(order)}
                          className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold flex items-center gap-1 shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>বিবরণ</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex justify-end">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl overflow-y-auto p-6 space-y-6 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs text-slate-400 block">{language === 'en' ? 'Order Details:' : 'অর্ডার বিবরণী:'}</span>
                  <h3 className="text-lg font-mono font-bold text-slate-900">
                    {selectedOrder.orderNumber}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Online Payment & TrxID Card */}
              <div className="p-4 rounded-2xl border bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 border-amber-200/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-amber-500 text-white shadow-2xs">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block">
                        {language === 'en' ? 'Payment Method & Status' : 'পেমেন্ট মাধ্যম ও অবস্থা'}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">
                        {selectedOrder.paymentMethodTitle || selectedOrder.paymentMethod.toUpperCase()}
                      </h4>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    editPaymentStatus === 'paid' || editPaymentStatus === 'verified'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : editPaymentStatus === 'failed'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}>
                    {editPaymentStatus === 'paid' || editPaymentStatus === 'verified' ? '✓ পরিশোধিত (Paid)' : 'অপেক্ষমাণ (Pending)'}
                  </span>
                </div>

                {/* Prominent Transaction ID & Sender Phone */}
                {(selectedOrder.paymentTransactionId || selectedOrder.paymentSenderPhone || selectedOrder.paymentMethod !== 'cod') && (
                  <div className="p-3 bg-white rounded-xl border border-amber-200/70 space-y-2">
                    {selectedOrder.paymentTransactionId ? (
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] text-slate-500 font-semibold block uppercase">
                            ট্রানজেকশন আইডি (Transaction ID / TrxID):
                          </span>
                          <span className="font-mono text-sm font-bold text-emerald-800 tracking-wider">
                            {selectedOrder.paymentTransactionId}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyTrx(selectedOrder.paymentTransactionId!)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {copiedTrx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedTrx ? 'কপি হয়েছে' : 'কপি'}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-amber-800">
                        ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে রাইডারকে মূল্য পরিশোধ করবেন)
                      </div>
                    )}

                    {selectedOrder.paymentSenderPhone && (
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500">প্রেরকের বিকাশ/নগদ নম্বর:</span>
                        <a href={`tel:${selectedOrder.paymentSenderPhone}`} className="font-mono font-bold text-slate-900 underline">
                          {selectedOrder.paymentSenderPhone}
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Quick Payment Status Toggle for Admin */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="font-semibold text-slate-700">পেমেন্ট স্ট্যাটাস আপডেট:</span>
                  <select
                    value={editPaymentStatus}
                    onChange={e => setEditPaymentStatus(e.target.value as PaymentStatus)}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white font-bold text-xs focus:outline-none focus:border-emerald-600"
                  >
                    <option value="pending">অপেক্ষমাণ (Pending)</option>
                    <option value="paid">পরিশোধিত (Paid)</option>
                    <option value="verified">যাচাইকৃত (Verified)</option>
                    <option value="failed">ব্যর্থ / বাতিল (Failed)</option>
                  </select>
                </div>
              </div>

              {/* Customer Info & Contact */}
              <div className="py-4 border-b border-slate-100 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    {language === 'en' ? 'Customer & Contact Details:' : 'গ্রাহক ও ডেলিভারি তথ্য:'}
                  </span>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${selectedOrder.customerPhone}`}
                      className="px-2 py-1 bg-emerald-50 text-emerald-800 rounded-lg font-bold flex items-center gap-1 border border-emerald-200 hover:bg-emerald-100"
                      title="কল করুন"
                    >
                      <Phone className="w-3 h-3" />
                      <span>কল</span>
                    </a>
                    <a
                      href={`https://wa.me/88${selectedOrder.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`আসসালামু আলাইকুম ${selectedOrder.customerName}, আপনার "ঘরের স্বাদ" অর্ডার #${selectedOrder.orderNumber} সম্পর্কে:`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1 hover:bg-emerald-800"
                      title="হোয়াটসঅ্যাপে মেসেজ পাঠান"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">{language === 'en' ? 'Customer Name' : 'গ্রাহকের নাম'}</span>
                    <span className="font-bold text-slate-900">{selectedOrder.customerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">{language === 'en' ? 'Phone Number' : 'ফোন নম্বর'}</span>
                    <span className="font-mono font-bold text-emerald-700">{selectedOrder.customerPhone}</span>
                  </div>
                  {selectedOrder.customerEmail && (
                    <div className="col-span-2">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">{language === 'en' ? 'Email' : 'ইমেইল'}</span>
                      <span className="font-mono text-slate-700">{selectedOrder.customerEmail}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-500 font-semibold">{selectedOrder.deliveryZoneName}</span>
                      {(selectedOrder.district || selectedOrder.division) && (
                        <span className="text-slate-400 ml-1">({[selectedOrder.district, selectedOrder.division].filter(Boolean).join(', ')})</span>
                      )}
                      <p className="font-medium text-slate-800 mt-0.5">{selectedOrder.deliveryAddress}</p>
                      {selectedOrder.deliveryLandmark && (
                        <p className="text-slate-500 text-[11px] mt-0.5">ল্যান্ডমার্ক: {selectedOrder.deliveryLandmark}</p>
                      )}
                      {selectedOrder.courierPartner && (
                        <p className="text-emerald-800 font-semibold text-[11px] mt-0.5">কুরিয়ার পার্টনার: {selectedOrder.courierPartner}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-slate-700">অনুরোধকৃত সময়: <strong>{selectedOrder.requestedTimeSlot}</strong> ({selectedOrder.requestedDate})</span>
                  </div>

                  {selectedOrder.customerNotes && (
                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200/80 text-amber-900">
                      <span className="font-bold block text-[10px] uppercase">গ্রাহকের বিশেষ নির্দেশনা:</span>
                      <p className="mt-0.5">{selectedOrder.customerNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="py-4 border-b border-slate-100 space-y-2 text-xs">
                <span className="font-bold text-slate-900 uppercase tracking-wider block">
                  {language === 'en' ? 'Ordered Items Breakdown:' : 'অর্ডারকৃত খাবারের বিস্তারিত তালিকা:'}
                </span>
                <div className="divide-y divide-slate-100">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="py-2 flex justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{language === 'en' ? (it.nameEn || it.nameBn) : it.nameBn}</span>
                          <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">× {it.quantity}</span>
                        </div>
                        {it.selectedVariantName && (
                          <span className="text-[11px] text-slate-500 block mt-0.5">ভ্যারিয়েন্ট: {it.selectedVariantName}</span>
                        )}
                        {it.selectedAddonsNames && it.selectedAddonsNames.length > 0 && (
                          <span className="text-[11px] text-slate-500 block">যুক্ত আইটেম: {it.selectedAddonsNames.join(', ')}</span>
                        )}
                        {it.specialNotes && (
                          <span className="text-[11px] text-amber-700 italic block">নোট: {it.specialNotes}</span>
                        )}
                        <span className="text-[10px] text-slate-400 block font-mono">একক মূল্য: ৳{it.unitPrice}</span>
                      </div>
                      <span className="font-bold tabular-nums text-slate-900 shrink-0 text-sm">৳{it.itemTotal}</span>
                    </div>
                  ))}
                </div>

                {/* Subtotal, Discount & Total Breakdown */}
                <div className="pt-3 border-t border-slate-200 space-y-1.5">
                  <div className="flex justify-between text-slate-600">
                    <span>খাবারের মোট মূল্য (Subtotal):</span>
                    <span className="tabular-nums font-semibold">৳{selectedOrder.subtotal}</span>
                  </div>
                  {selectedOrder.discountAmount > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>কুপন ছাড় ({selectedOrder.couponCode || 'Promo'}):</span>
                      <span className="tabular-nums font-semibold">-৳{selectedOrder.discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>ডেলিভারি চার্জ:</span>
                    <span className="tabular-nums font-semibold">৳{selectedOrder.deliveryCharge}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-base text-slate-900">
                    <span>সর্বমোট প্রদেয় বিল:</span>
                    <span className="text-emerald-800 tabular-nums">৳{selectedOrder.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Admin Controls */}
              <div className="py-4 space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    {language === 'en' ? 'Update Order Status' : 'অর্ডারের স্ট্যাটাস পরিবর্তন'}
                  </label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-semibold focus:outline-none focus:border-emerald-600"
                  >
                    <option value="placed">{language === 'en' ? 'Order Placed' : 'অর্ডার গৃহীত (Placed)'}</option>
                    <option value="accepted">{language === 'en' ? 'Order Accepted' : 'নিশ্চিত করা হয়েছে (Accepted)'}</option>
                    <option value="preparing">{language === 'en' ? 'Preparing in Kitchen' : 'রান্না চলছে (Preparing)'}</option>
                    <option value="ready">{language === 'en' ? 'Ready for Pickup / Out' : 'প্যাকেজিং প্রস্তুত (Ready)'}</option>
                    <option value="out_for_delivery">{language === 'en' ? 'Out for Delivery' : 'ডেলিভারির পথে (Out for Delivery)'}</option>
                    <option value="delivered">{language === 'en' ? 'Delivered' : 'ডেলিভার সম্পন্ন (Delivered)'}</option>
                    <option value="cancelled">{language === 'en' ? 'Cancelled' : 'অর্ডার বাতিল (Cancelled)'}</option>
                    <option value="rejected">{language === 'en' ? 'Rejected' : 'প্রত্যাখ্যাত (Rejected)'}</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    {language === 'en' ? 'Assigned Delivery Person' : 'দায়িত্বপ্রাপ্ত ডেলিভারি ম্যান'}
                  </label>
                  <input
                    type="text"
                    value={deliveryPerson}
                    onChange={e => setDeliveryPerson(e.target.value)}
                    placeholder={language === 'en' ? "e.g. Delivery Agent 1 (Phone)" : "যেমন: রাকিব হাসান (ডেলিভারি ম্যান ১)"}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    {language === 'en' ? 'Internal Admin Notes' : 'অভ্যন্তরীণ অ্যাডমিন নোট'}
                  </label>
                  <textarea
                    rows={2}
                    value={adminNotes}
                    onChange={e => setAdminNotes(e.target.value)}
                    placeholder={language === 'en' ? "Notes on customer calls, instructions..." : "গ্রাহকের সাথে ফোনে কথা হয়েছে, বিশেষ নির্দেশনা..."}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPrintModalData({ order: selectedOrder, type: 'receipt' })}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Receipt' : 'রসিদ'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrintModalData({ order: selectedOrder, type: 'kitchen' })}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Kitchen Ticket' : 'কিচেন টিকিট'}</span>
                </button>
              </div>

              <button
                type="button"
                disabled={isUpdating}
                onClick={handleSaveOrderUpdates}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
              >
                {isUpdating ? (language === 'en' ? 'Saving...' : 'সংরক্ষিত হচ্ছে...') : (language === 'en' ? 'Save Updates' : 'আপডেট সেভ করুন')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Slip Modal */}
      {printModalData && (
        <PrintSlipModal
          order={printModalData.order}
          config={config}
          type={printModalData.type}
          onClose={() => setPrintModalData(null)}
        />
      )}

      {/* Reset Orders Confirmation Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  অর্ডার কাউন্ট ও হিস্টোরি রিসেট নিশ্চিতকরণ
                </h3>
                <span className="text-xs text-rose-600 font-semibold block">
                  সতর্কতা: এটি অপরিবর্তনযোগ্য (Irreversible)!
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              এই অপশনটি ব্যবহার করলে বর্তমান ওয়েবসাইটের সকল পূর্ববর্তী <strong>{orders.length}টি অর্ডার</strong> মুছে ফেলা হবে এবং অর্ডার নম্বর পুনরায় প্রারম্ভিক অবস্থায় রিসেট হবে। আপনি কি নিশ্চিত?
            </p>

            {resetNotice && (
              <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200 font-semibold">
                {resetNotice}
              </div>
            )}

            <form onSubmit={handleResetOrders} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  নিশ্চিত করতে নিচে <span className="font-mono text-rose-600 font-extrabold">RESET</span> শব্দটি লিখুন:
                </label>
                <input
                  type="text"
                  required
                  value={resetConfirmText}
                  onChange={e => setResetConfirmText(e.target.value)}
                  placeholder="RESET"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs uppercase tracking-wider focus:outline-none focus:border-rose-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsResetModalOpen(false);
                    setResetConfirmText('');
                    setResetNotice(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  বাতিল করুন
                </button>

                <button
                  type="submit"
                  disabled={isResetting || !resetConfirmText.trim()}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{isResetting ? 'রিসেট হচ্ছে...' : 'হ্যাঁ, সম্পূর্ণ রিসেট করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
