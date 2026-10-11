import React, { useState } from 'react';
import { Clock, ChefHat, CheckCircle2, AlertCircle, Printer, ArrowRight, Play, Check } from 'lucide-react';
import { Order, BusinessConfig } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { PrintSlipModal } from './PrintSlipModal.tsx';

interface KitchenDisplayProps {
  orders: Order[];
  config: BusinessConfig;
  onRefreshOrders: () => void;
}

export const KitchenDisplay: React.FC<KitchenDisplayProps> = ({ orders, config, onRefreshOrders }) => {
  const { language } = useLanguage();
  const [printOrder, setPrintOrder] = useState<Order | null>(null);

  // Filter out delivered or cancelled
  const activeOrders = orders.filter(
    o => o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled' && o.orderStatus !== 'rejected'
  );

  const queuedOrders = activeOrders.filter(o => o.orderStatus === 'placed' || o.orderStatus === 'accepted');
  const preparingOrders = activeOrders.filter(o => o.orderStatus === 'preparing');
  const readyOrders = activeOrders.filter(o => o.orderStatus === 'ready' || o.orderStatus === 'out_for_delivery');

  const handleUpdateStatus = async (orderId: string, newStatus: Order['orderStatus']) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      onRefreshOrders();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-lg">
            <ChefHat className="w-5 h-5 text-emerald-700" />
            <span>{language === 'en' ? 'Kitchen Display System (KDS)' : 'কিচেন ডিসপ্লে সিস্টেম (Kitchen Display System)'}</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'en' ? 'Manage real-time order cooking progress, timers, and kitchen tickets.' : 'সরাসরি কিচেনের রান্নার অগ্রগতি, টাইমার এবং টিকিট প্রিন্ট পরিচালনা করুন।'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg">
            {language === 'en' ? `Cooking Now: ${preparingOrders.length}` : `রান্না চলছে: ${preparingOrders.length}টি`}
          </span>
          <button
            onClick={onRefreshOrders}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            {language === 'en' ? 'Refresh' : 'রিফ্রেশ'}
          </button>
        </div>
      </div>

      {/* 3 Main Queues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: New / Queued */}
        <div className="space-y-3">
          <div className="p-3 bg-slate-100/80 rounded-xl border border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {language === 'en' ? `1. New Queued (${queuedOrders.length})` : `১. নতুন অপেক্ষমান (${queuedOrders.length})`}
            </span>
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          </div>

          <div className="space-y-3">
            {queuedOrders.length === 0 ? (
              <div className="p-6 bg-white rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                {language === 'en' ? 'No pending orders waiting' : 'কোনো নতুন অপেক্ষমান অর্ডার নেই'}
              </div>
            ) : (
              queuedOrders.map(order => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono font-bold text-sm text-slate-900 block">
                        {order.orderNumber}
                      </span>
                      <span className="text-xs text-slate-500">
                        {order.customerName} ({order.deliveryZoneName})
                      </span>
                    </div>
                    {order.isUrgent && (
                      <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        {language === 'en' ? 'Urgent' : 'জরুরি'}
                      </span>
                    )}
                  </div>

                  <div className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>{language === 'en' ? 'Time: ' : 'সময়: '}{order.requestedTimeSlot}</span>
                    </div>
                    {order.customerNotes && (
                      <p className="text-rose-700 italic text-[11px]">
                        {language === 'en' ? 'Note: ' : 'নোট: '}{order.customerNotes}
                      </p>
                    )}
                  </div>

                  {/* Food Items */}
                  <div className="space-y-1.5 text-xs divide-y divide-slate-50">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="pt-1 flex justify-between font-medium">
                        <span className="text-slate-800">{language === 'en' ? (it.nameEn || it.nameBn) : it.nameBn}</span>
                        <span className="font-bold tabular-nums">×{it.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center gap-2 border-t border-slate-100">
                    <button
                      onClick={() => setPrintOrder(order)}
                      className="p-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg cursor-pointer"
                      title={language === 'en' ? 'Print Kitchen Slip' : 'কিচেন স্লিপ প্রিন্ট'}
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'preparing')}
                      className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{language === 'en' ? 'Start Cooking' : 'রান্না শুরু করুন'}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: In Kitchen / Cooking */}
        <div className="space-y-3">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              {language === 'en' ? `2. Cooking in Kitchen (${preparingOrders.length})` : `২. রান্না চলছে (${preparingOrders.length})`}
            </span>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          </div>

          <div className="space-y-3">
            {preparingOrders.length === 0 ? (
              <div className="p-6 bg-white rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                {language === 'en' ? 'No orders currently cooking' : 'বর্তমানে কোনো অর্ডার রান্না হচ্ছে না'}
              </div>
            ) : (
              preparingOrders.map(order => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl border-2 border-amber-300 p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono font-bold text-sm text-slate-900 block">
                        {order.orderNumber}
                      </span>
                      <span className="text-xs text-slate-500">
                        {order.customerName} • {order.deliveryZoneName}
                      </span>
                    </div>
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                      {language === 'en' ? 'Cooking' : 'রান্নায় সক্রিয়'}
                    </span>
                  </div>

                  <div className="text-xs bg-amber-50/50 p-2.5 rounded-lg border border-amber-100 space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-950 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-amber-700" />
                      <span>{language === 'en' ? 'Delivery Time: ' : 'ডেলিভারি সময়: '}{order.requestedTimeSlot}</span>
                    </div>
                    {order.customerNotes && (
                      <p className="text-rose-700 font-semibold text-[11px]">
                        {language === 'en' ? 'Note: ' : 'নোট: '}{order.customerNotes}
                      </p>
                    )}
                  </div>

                  {/* Food Items */}
                  <div className="space-y-1.5 text-xs divide-y divide-slate-100">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="pt-1 flex justify-between font-medium">
                        <div>
                          <span className="text-slate-900 font-semibold">{language === 'en' ? (it.nameEn || it.nameBn) : it.nameBn}</span>
                          {it.selectedVariantName && (
                            <span className="text-[11px] text-slate-500 block">[{it.selectedVariantName}]</span>
                          )}
                        </div>
                        <span className="font-bold text-amber-800 tabular-nums">×{it.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Ready Action */}
                  <div className="pt-2 flex items-center gap-2 border-t border-slate-100">
                    <button
                      onClick={() => setPrintOrder(order)}
                      className="p-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg cursor-pointer"
                      title={language === 'en' ? 'Print Kitchen Slip' : 'কিচেন স্লিপ প্রিন্ট'}
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'ready')}
                      className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>{language === 'en' ? 'Mark Ready' : 'রান্না প্রস্তুত (Ready)'}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 3: Ready for Delivery */}
        <div className="space-y-3">
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
              {language === 'en' ? `3. Ready / Out for Delivery (${readyOrders.length})` : `৩. প্রস্তুত / ডেলিভারির পথে (${readyOrders.length})`}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
          </div>

          <div className="space-y-3">
            {readyOrders.length === 0 ? (
              <div className="p-6 bg-white rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                {language === 'en' ? 'No food ready for dispatch' : 'ডেলিভারির জন্য কোনো খাবার প্রস্তুত নেই'}
              </div>
            ) : (
              readyOrders.map(order => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl border border-emerald-200 p-4 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono font-bold text-sm text-slate-900 block">
                        {order.orderNumber}
                      </span>
                      <span className="text-xs text-slate-500">
                        {order.customerName} ({order.customerPhone})
                      </span>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                      {order.orderStatus === 'out_for_delivery'
                        ? (language === 'en' ? 'Out for Delivery' : 'ডেলিভারির পথে')
                        : (language === 'en' ? 'Ready' : 'প্রস্তুত')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    {language === 'en' ? 'Address: ' : 'ঠিকানা: '}{order.deliveryAddress} ({order.deliveryZoneName})
                  </p>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <span className="text-slate-500">{language === 'en' ? 'Bill: ' : 'বিল: '}<strong>৳{order.totalAmount}</strong></span>
                    <button
                      onClick={() => setPrintOrder(order)}
                      className="text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>{language === 'en' ? 'Print Bill' : 'রসিদ প্রিন্ট'}</span>
                    </button>
                  </div>

                  <div className="pt-2">
                    {order.orderStatus === 'ready' ? (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'out_for_delivery')}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        {language === 'en' ? 'Handover to Rider (Out for Delivery)' : 'রাইডারকে হস্তান্তর (Out for Delivery)'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'delivered')}
                        className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        {language === 'en' ? 'Mark Delivered' : 'ডেলিভারি সম্পন্ন মার্ক করুন'}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Print Slip Modal */}
      {printOrder && (
        <PrintSlipModal
          order={printOrder}
          config={config}
          type="kitchen"
          onClose={() => setPrintOrder(null)}
        />
      )}
    </div>
  );
};
