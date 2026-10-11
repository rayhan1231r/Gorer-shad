import React, { useState } from 'react';
import { Search, Filter, Eye, Printer, CheckCircle, Clock, Truck, XCircle, AlertTriangle, UserCheck } from 'lucide-react';
import { Order, OrderStatus, BusinessConfig } from '../../types/index.ts';
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
  const [deliveryPerson, setDeliveryPerson] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const filteredOrders = orders.filter(o => {
    if (statusFilter !== 'all' && o.orderStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNo = o.orderNumber.toLowerCase().includes(q);
      const matchName = o.customerName.toLowerCase().includes(q);
      const matchPhone = o.customerPhone.includes(q);
      const matchZone = o.deliveryZoneName.toLowerCase().includes(q);
      if (!matchNo && !matchName && !matchPhone && !matchZone) return false;
    }
    return true;
  });

  const openOrderDrawer = (order: Order) => {
    setSelectedOrder(order);
    setEditStatus(order.orderStatus);
    setDeliveryPerson(order.assignedDeliveryPerson || '');
    setAdminNotes(order.adminNotes || '');
  };

  const handleSaveOrderUpdates = async () => {
    if (!selectedOrder) return;
    try {
      setIsUpdating(true);
      await api.updateOrderStatus(selectedOrder.id, editStatus, 'Updated via Admin Order Manager', {
        assignedDeliveryPerson: deliveryPerson.trim() || undefined,
        adminNotes: adminNotes.trim() || undefined
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
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors shrink-0"
            >
              {language === 'en' ? 'Refresh' : 'রিফ্রেশ'}
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

              {/* Customer Info */}
              <div className="py-4 border-b border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">{language === 'en' ? 'Customer Name:' : 'গ্রাহকের নাম:'}</span>
                  <span className="font-semibold text-slate-900">{selectedOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{language === 'en' ? 'Phone Number:' : 'ফোন নম্বর:'}</span>
                  <a href={`tel:${selectedOrder.customerPhone}`} className="font-mono text-emerald-700 underline font-semibold">
                    {selectedOrder.customerPhone}
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{language === 'en' ? 'Delivery Zone:' : 'ডেলিভারি এলাকা:'}</span>
                  <span className="font-semibold text-slate-900">{selectedOrder.deliveryZoneName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">{language === 'en' ? 'Full Address:' : 'সম্পূর্ণ ঠিকানা:'}</span>
                  <span className="font-medium text-slate-800 block mt-0.5">{selectedOrder.deliveryAddress}</span>
                </div>
                {selectedOrder.deliveryLandmark && (
                  <div>
                    <span className="text-slate-500 block">{language === 'en' ? 'Landmark:' : 'ল্যান্ডমার্ক:'}</span>
                    <span className="text-slate-700">{selectedOrder.deliveryLandmark}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">{language === 'en' ? 'Requested Time:' : 'অনুরোধকৃত সময়:'}</span>
                  <span className="font-semibold text-slate-900">{selectedOrder.requestedTimeSlot}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="py-4 border-b border-slate-100 space-y-2 text-xs">
                <span className="font-bold text-slate-900 uppercase tracking-wider block">
                  {language === 'en' ? 'Ordered Items:' : 'খাবারের তালিকা:'}
                </span>
                <div className="divide-y divide-slate-100">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="py-1.5 flex justify-between">
                      <div>
                        <span className="font-semibold text-slate-900">{language === 'en' ? (it.nameEn || it.nameBn) : it.nameBn}</span>
                        <span className="text-slate-500 ml-1">× {it.quantity}</span>
                        {it.selectedVariantName && (
                          <span className="text-[11px] text-slate-400 block">{language === 'en' ? 'Variant: ' : 'ভ্যারিয়েন্ট: '}{it.selectedVariantName}</span>
                        )}
                        {it.selectedAddonsNames && it.selectedAddonsNames.length > 0 && (
                          <span className="text-[11px] text-slate-400 block">{language === 'en' ? 'Addons: ' : 'যুক্ত: '}{it.selectedAddonsNames.join(', ')}</span>
                        )}
                      </div>
                      <span className="font-bold tabular-nums">৳{it.itemTotal}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm">
                  <span>{language === 'en' ? 'Total Payable:' : 'সর্বমোট প্রদেয়:'}</span>
                  <span className="text-emerald-800 tabular-nums">৳{selectedOrder.totalAmount}</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {language === 'en' ? 'Payment Method: ' : 'পেমেন্ট পদ্ধতি: '}<strong>{selectedOrder.paymentMethod.toUpperCase()}</strong> ({selectedOrder.paymentStatus})
                  {selectedOrder.paymentTransactionId && <span> • TrxID: {selectedOrder.paymentTransactionId}</span>}
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
    </div>
  );
};
