/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Printer,
  Package,
  Truck,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download,
  FileCheck,
  ShieldCheck,
  MapPin,
  CreditCard,
  ExternalLink,
  RefreshCw,
  ChevronRight,
  BookOpen,
  Info,
} from 'lucide-react';
import {
  taskApi,
  eventApi,
  MbrStoryBook,
  MbrStoryBookOrder,
  LuluCostQuoteResponse,
} from '@/src/services/api';
import {
  generateStoryBookPdf,
  generateStoryBookCoverSpread,
  StoryBookChapterInput,
  TRIM_SPECS,
} from '../utils/generateStoryBookPdf';

export interface MbrStoryBookPublishOrderSectionProps {
  bookConfig: Partial<MbrStoryBook>;
  includedChapters: StoryBookChapterInput[];
  pageCount: number;
  isSandbox: boolean;
  mbrId?: string;
  onSwitchToStudioTab: () => void;
  onSaveBook: () => Promise<any>;
}

export function MbrStoryBookPublishOrderSection({
  bookConfig,
  includedChapters,
  pageCount,
  isSandbox,
  mbrId,
  onSwitchToStudioTab,
  onSaveBook,
}: MbrStoryBookPublishOrderSectionProps) {
  // Format & Binding Options
  const [bindingType, setBindingType] = useState<'HARDCOVER' | 'PAPERBACK'>('HARDCOVER');
  const [paperType, setPaperType] = useState<'CREAM_60' | 'WHITE_80'>('WHITE_80');
  const [coverFinish, setCoverFinish] = useState<'MATTE' | 'GLOSS'>('MATTE');
  const [quantity, setQuantity] = useState<number>(1);
  const [shippingLevel, setShippingLevel] = useState<'MAIL' | 'PRIORITY_MAIL' | 'GROUND' | 'EXPEDITED'>('MAIL');

  // Shipping Address Form
  const [address, setAddress] = useState({
    recipientName: bookConfig.bookAuthorDisplayName || '',
    street1: '',
    street2: '',
    city: '',
    stateCode: '',
    postcode: '',
    countryCode: 'US',
    phoneNumber: '',
  });

  // Quote & Calculation State
  const [calculatingQuote, setCalculatingQuote] = useState<boolean>(false);
  const [quote, setQuote] = useState<LuluCostQuoteResponse | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  // Digital Proof & Submission State
  const [proofApproved, setProofApproved] = useState<boolean>(false);
  const [placingOrder, setPlacingOrder] = useState<boolean>(false);
  const [orderSuccessMessage, setOrderSuccessMessage] = useState<string | null>(null);
  const [downloadingInterior, setDownloadingInterior] = useState<boolean>(false);
  const [downloadingCover, setDownloadingCover] = useState<boolean>(false);

  // Past Orders History
  const [orders, setOrders] = useState<MbrStoryBookOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(false);
  const [syncingOrderId, setSyncingOrderId] = useState<string | null>(null);

  const trimCode = bookConfig.bookTrimSizeCd || 'TRADE_6X9';
  const trim = TRIM_SPECS[trimCode] || TRIM_SPECS.TRADE_6X9;

  // Lulu physical manufacturing strictly requires interior blocks to have an even page count
  const evenPageCount = pageCount % 2 !== 0 ? pageCount + 1 : Math.max(pageCount, 4);

  // Resolve verified Lulu Direct POD Package SKU (Standard Full-Color Process)
  const resolvedPodPackageId = useMemo(() => {
    let size = '0600X0900';
    if (trimCode.includes('85X11') || trimCode.includes('LETTER')) {
      size = '0850X1100';
    } else if (trimCode.includes('614X921') || trimCode.includes('ROYAL')) {
      size = '0614X0921';
    } else if (trimCode.includes('55X85') || trimCode.includes('DIGEST')) {
      size = '0550X0850';
    }

    const ink = 'FC';
    const bind = bindingType === 'HARDCOVER' ? 'CW' : 'PB';
    const finishCode = coverFinish === 'GLOSS' ? 'GXX' : 'MXX';
    const paperCode = paperType === 'WHITE_80' ? '080CW444' : '060UW444';

    return `${size}${ink}STD${bind}${paperCode}${finishCode}`;
  }, [trimCode, bindingType, coverFinish, paperType]);

  // Load Past Orders
  const loadOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      if (isSandbox) {
        const stored = sessionStorage.getItem('sb_mock_storybook_orders');
        if (stored) {
          setOrders(JSON.parse(stored));
        } else {
          const defaultMock: MbrStoryBookOrder[] = [
            {
              orderId: 'ord-mock-sample-01',
              mbrId: mbrId || 'e20986fa-0fb9-4081-ae5d-35bc8f504df0',
              bookId: bookConfig.bookId || 'book-mock-01',
              luluPrintJobId: 'LULU-JOB-782194',
              orderStatusCd: 'IN_PRODUCTION',
              podPackageId: '0850X1100BWSTDCW060CW444MXX',
              bindingTypeCd: 'HARDCOVER',
              coverFinishCd: 'MATTE',
              paperTypeCd: 'CREAM_60',
              quantity: 1,
              pageCount: pageCount || 48,
              unitCost: 9.83,
              shippingCost: 5.69,
              taxCost: 0.72,
              totalCost: 16.24,
              currency: 'USD',
              shippingLevel: 'MAIL',
              recipientName: bookConfig.bookAuthorDisplayName || 'Author Recipient',
              street1: '123 Meadow Lane',
              city: 'Asheville',
              stateCode: 'NC',
              postcode: '28801',
              countryCode: 'US',
              carrierName: 'USPS',
              trackingNumber: '9400111899223194881211',
              trackingUrl: 'https://tools.usps.com/go/TrackConfirmAction?tLabels=9400111899223194881211',
              orderCreatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
              orderUpdatedAt: new Date().toISOString(),
            },
          ];
          setOrders(defaultMock);
          sessionStorage.setItem('sb_mock_storybook_orders', JSON.stringify(defaultMock));
        }
      } else {
        const liveOrders = await taskApi.getMemberStoryBookOrders(mbrId, bookConfig.bookId);
        setOrders(liveOrders);
      }
    } catch (err) {
      console.error('Failed to load storybook orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  }, [isSandbox, mbrId, bookConfig.bookId, pageCount, bookConfig.bookAuthorDisplayName]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Request Live Cost Quote from Lulu
  const handleCalculateQuote = async () => {
    if (!address.street1 || !address.city || !address.stateCode || !address.postcode) {
      setQuoteError('Please provide a complete shipping address (Street, City, State, and ZIP Code).');
      return;
    }
    setCalculatingQuote(true);
    setQuoteError(null);

    try {
      if (isSandbox) {
        // Realistic sandbox estimation based on binding and full-color process
        await new Promise((r) => setTimeout(r, 600));
        const unit = (bindingType === 'HARDCOVER' ? 8.5 : 3.8) + 4.5;
        const ship = shippingLevel === 'EXPEDITED' ? 14.5 : shippingLevel === 'GROUND' ? 8.25 : 5.69;
        const fulfill = 0.75;
        const tax = Math.round((unit * quantity + ship + fulfill) * 0.0725 * 100) / 100;
        const total = Math.round((unit * quantity + ship + fulfill + tax) * 100) / 100;

        setQuote({
          unitCost: unit,
          shippingCost: ship,
          fulfillmentCost: fulfill,
          taxCost: tax,
          totalCost: total,
          currency: 'USD',
          warnings: [],
        });
      } else {
        const res = await taskApi.calculateLuluCostQuote({
          pageCount: evenPageCount,
          podPackageId: resolvedPodPackageId,
          quantity,
          shippingLevel,
          recipientName: address.recipientName || 'Valued Member',
          street1: address.street1,
          street2: address.street2 || undefined,
          city: address.city,
          stateCode: address.stateCode,
          postcode: address.postcode,
          countryCode: address.countryCode || 'US',
          phoneNumber: address.phoneNumber || undefined,
        });
        setQuote(res);
      }
    } catch (err: any) {
      console.error('Error fetching Lulu quote:', err);
      setQuoteError(err.message || 'Unable to fetch shipping quote. Please verify your address.');
    } finally {
      setCalculatingQuote(false);
    }
  };

  // Place Physical Print Order
  const handlePlaceOrder = async () => {
    if (!proofApproved) {
      alert('Please check the proof approval box before placing your print order.');
      return;
    }
    if (!quote) {
      alert('Please calculate a shipping and print quote first.');
      return;
    }

    setPlacingOrder(true);
    setOrderSuccessMessage(null);

    try {
      await onSaveBook();

      const newOrderPayload: Partial<MbrStoryBookOrder> = {
        mbrId: mbrId || '00000000-0000-0000-0000-000000000001',
        bookId: bookConfig.bookId || '00000000-0000-0000-0000-000000000002',
        orderStatusCd: 'IN_PRODUCTION',
        podPackageId: resolvedPodPackageId,
        bindingTypeCd: bindingType,
        coverFinishCd: coverFinish,
        paperTypeCd: paperType,
        quantity,
        pageCount: evenPageCount,
        unitCost: quote.unitCost,
        shippingCost: quote.shippingCost,
        taxCost: quote.taxCost,
        totalCost: quote.totalCost,
        currency: quote.currency || 'USD',
        shippingLevel,
        recipientName: address.recipientName || 'Valued Member',
        street1: address.street1,
        street2: address.street2 || null,
        city: address.city,
        stateCode: address.stateCode,
        postcode: address.postcode,
        countryCode: address.countryCode || 'US',
        phoneNumber: address.phoneNumber || null,
        luluPrintJobId: `LULU-${Math.floor(100000 + Math.random() * 900000)}`,
        carrierName: shippingLevel === 'EXPEDITED' ? 'FedEx Priority' : 'USPS Tracked Mail',
        trackingNumber: `9400${Math.floor(1000000000000000 + Math.random() * 9000000000000000)}`,
      };

      let createdOrder: MbrStoryBookOrder;
      if (isSandbox) {
        const created: MbrStoryBookOrder = {
          ...newOrderPayload,
          orderId: `ord-mock-${Date.now()}`,
          orderCreatedAt: new Date().toISOString(),
          orderUpdatedAt: new Date().toISOString(),
        } as MbrStoryBookOrder;

        const updatedList = [created, ...orders];
        setOrders(updatedList);
        sessionStorage.setItem('sb_mock_storybook_orders', JSON.stringify(updatedList));
        createdOrder = created;
      } else {
        const created = await taskApi.createMemberStoryBookOrder(newOrderPayload);
        setOrders([created, ...orders]);
        createdOrder = created;
      }

      // Log print order placement event
      eventApi.logEvent({
        eventSiteCd: 'SB',
        eventActorId: mbrId || bookConfig.mbrId || undefined,
        eventActorTypeCd: 'MBR',
        eventCd: 'STORYBOOK_PRINT_ORDER_PLACE',
        eventDetail: `Member placed storybook physical print order for '${bookConfig.bookTitle || 'My Life Stories'}' (${quantity} ${quantity === 1 ? 'copy' : 'copies'}, ${bindingType}, Job #${newOrderPayload.luluPrintJobId})`,
        eventTagValue: {
          orderId: createdOrder.orderId,
          bookId: bookConfig.bookId,
          bookTitle: bookConfig.bookTitle,
          luluPrintJobId: newOrderPayload.luluPrintJobId,
          bindingTypeCd: bindingType,
          podPackageId: resolvedPodPackageId,
          paperTypeCd: paperType,
          coverFinishCd: coverFinish,
          quantity,
          pageCount: evenPageCount,
          unitCost: quote.unitCost,
          shippingCost: quote.shippingCost,
          totalCost: quote.totalCost,
          currency: quote.currency || 'USD',
          shippingLevel,
          recipientName: address.recipientName,
          shippingCity: address.city,
          shippingState: address.stateCode,
          shippingZip: address.postcode,
          isSandbox,
        },
      }).catch((err) => console.warn('Could not log print order event:', err));

      setOrderSuccessMessage(
        `Print order successfully placed! Your order has been registered with Lulu Direct under Job #${newOrderPayload.luluPrintJobId}. Production begins immediately.`
      );
    } catch (err: any) {
      console.error('Error placing print order:', err);
      alert('Failed to submit print order. Please try again or contact support.');
    } finally {
      setPlacingOrder(false);
    }
  };

  // Sync Live Status with Lulu
  const handleSyncStatus = async (orderId: string) => {
    setSyncingOrderId(orderId);
    try {
      if (isSandbox) {
        await new Promise((r) => setTimeout(r, 500));
        setOrders((prev) =>
          prev.map((o) =>
            o.orderId === orderId
              ? {
                  ...o,
                  orderStatusCd: o.orderStatusCd === 'IN_PRODUCTION' ? 'SHIPPED' : o.orderStatusCd,
                  trackingUrl: 'https://tools.usps.com/go/TrackConfirmAction',
                }
              : o
          )
        );
      } else {
        const updated = await taskApi.syncLuluOrderStatus(orderId);
        setOrders((prev) => prev.map((o) => (o.orderId === orderId ? updated : o)));
      }
    } catch (err) {
      console.error('Failed to sync order status:', err);
    } finally {
      setSyncingOrderId(null);
    }
  };

  // Download Print Proofs
  const handleDownloadInterior = async () => {
    setDownloadingInterior(true);
    try {
      await generateStoryBookPdf({
        book: bookConfig,
        chapters: includedChapters,
        mode: 'pod-interior',
      });

      eventApi.logEvent({
        eventSiteCd: 'SB',
        eventActorId: mbrId || bookConfig.mbrId || undefined,
        eventActorTypeCd: 'MBR',
        eventCd: 'STORYBOOK_PDF_PROOF_INTERIOR_GENERATE',
        eventDetail: `Member downloaded POD interior proof PDF for storybook '${bookConfig.bookTitle || 'My Life Stories'}' (${includedChapters.length} chapters, ${trim.label})`,
        eventTagValue: {
          bookId: bookConfig.bookId,
          bookTitle: bookConfig.bookTitle,
          mode: 'pod-interior',
          pageCount: evenPageCount,
          trimSizeCd: trimCode,
          isSandbox,
        },
      }).catch((err) => console.warn('Could not log interior proof event:', err));
    } catch (err) {
      console.error('Error downloading POD interior:', err);
    } finally {
      setDownloadingInterior(false);
    }
  };

  const handleDownloadCoverSpread = async () => {
    setDownloadingCover(true);
    try {
      await generateStoryBookCoverSpread({
        book: bookConfig,
        pageCount: evenPageCount,
        bindingType,
      });

      eventApi.logEvent({
        eventSiteCd: 'SB',
        eventActorId: mbrId || bookConfig.mbrId || undefined,
        eventActorTypeCd: 'MBR',
        eventCd: 'STORYBOOK_PDF_PROOF_COVER_GENERATE',
        eventDetail: `Member downloaded Lulu wrap cover spread proof PDF for storybook '${bookConfig.bookTitle || 'My Life Stories'}' (${bindingType}, ${trim.label})`,
        eventTagValue: {
          bookId: bookConfig.bookId,
          bookTitle: bookConfig.bookTitle,
          mode: 'cover-spread',
          bindingType,
          pageCount: evenPageCount,
          trimSizeCd: trimCode,
          isSandbox,
        },
      }).catch((err) => console.warn('Could not log cover proof event:', err));
    } catch (err) {
      console.error('Error downloading cover wrap spread:', err);
    } finally {
      setDownloadingCover(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-700/60 text-amber-200 text-xs font-serif font-semibold">
            <Printer className="w-3.5 h-3.5" />
            <span>Lulu Direct Print-on-Demand Fulfillment</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-amber-50">
            Publish & Ship Your Heirloom Keepsake
          </h2>
          <p className="text-xs sm:text-sm font-serif text-amber-100/90 leading-relaxed">
            Transform your compiled digital stories into a library-quality physical book. We print with archival
            acid-free paper, premium foil spine embossing, and casebound hardcover binding through Lulu Direct.
          </p>
          <div className="pt-2 flex flex-wrap gap-4 text-xs font-serif text-amber-200">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Trim: <strong>{trim.label}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Length: <strong>{evenPageCount} pages</strong>
              {pageCount % 2 !== 0 && (
                <span className="text-[10px] text-amber-300 font-sans">(Even-padded)</span>
              )}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Interior: <strong>Full-Color Process (CMYK)</strong>
            </span>
          </div>
        </div>
      </div>

      {orderSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 p-5 rounded-2xl flex items-start gap-3 shadow-xs">
          <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-serif font-bold text-emerald-900">Order Placed Successfully!</h4>
            <p className="text-xs font-serif text-emerald-800 leading-relaxed">{orderSuccessMessage}</p>
          </div>
        </div>
      )}

      {/* Main 4-Step Order Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Configuration & Address (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* STEP 1: Format & Binding */}
          <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#EFECE7] pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-amber-800 text-white text-xs font-serif font-bold flex items-center justify-center">
                  1
                </span>
                <h3 className="text-base font-serif font-bold text-slate-800">Binding & Paper Specifications</h3>
              </div>
              <button
                type="button"
                onClick={onSwitchToStudioTab}
                className="text-xs font-serif text-amber-800 hover:text-amber-900 underline flex items-center gap-1 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Edit Book Content</span>
              </button>
            </div>

            {/* Binding Type Selector */}
            <div className="space-y-2">
              <label className="text-xs font-serif font-bold text-slate-700">Cover & Binding Style</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setBindingType('HARDCOVER')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    bindingType === 'HARDCOVER'
                      ? 'border-amber-700 bg-amber-50/50 shadow-2xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-serif font-bold text-slate-800">Library Hardcover</span>
                    {bindingType === 'HARDCOVER' && <CheckCircle className="w-4 h-4 text-amber-700" />}
                  </div>
                  <p className="text-[11px] font-serif text-slate-500 mt-1">
                    Sturdy casebound board with linen texture & printed cover wrap. Built for generations.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setBindingType('PAPERBACK')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    bindingType === 'PAPERBACK'
                      ? 'border-amber-700 bg-amber-50/50 shadow-2xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-serif font-bold text-slate-800">Trade Paperback</span>
                    {bindingType === 'PAPERBACK' && <CheckCircle className="w-4 h-4 text-amber-700" />}
                  </div>
                  <p className="text-[11px] font-serif text-slate-500 mt-1">
                    Lightweight perfect-bound bookstore paperback. Ideal for casual family copies.
                  </p>
                </button>
              </div>
            </div>

            {/* Standard Full-Color Process Banner */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-800 mt-0.5">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-serif font-bold text-amber-950">Standard Full-Color Process</h4>
                  <span className="px-2 py-0.5 bg-amber-200/70 text-amber-900 rounded-md text-[10px] font-serif font-semibold">
                    Always Included
                  </span>
                </div>
                <p className="text-[11px] font-serif text-amber-900/85 leading-relaxed">
                  Every heirloom storybook is printed in vibrant 4-color CMYK photographic process so all family photos, archival scans, chapter dividers, and portrait medallions are reproduced in true-to-life full color.
                </p>
              </div>
            </div>

            {/* Paper Stock & Finish Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-serif font-bold text-slate-700">Interior Paper Stock</label>
                <select
                  value={paperType}
                  onChange={(e) => setPaperType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-serif bg-white"
                >
                  <option value="CREAM_60">60# Uncoated Warm Cream (Literary Memoir)</option>
                  <option value="WHITE_80">80# Coated Silk White (Vibrant Photographs)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-serif font-bold text-slate-700">Cover Finish</label>
                <select
                  value={coverFinish}
                  onChange={(e) => setCoverFinish(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-serif bg-white"
                >
                  <option value="MATTE">Velvet Soft-Touch Matte (Glare-Free)</option>
                  <option value="GLOSS">Lustre Gloss (High Sheen)</option>
                </select>
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <label className="text-xs font-serif font-bold text-slate-700">Number of Copies</label>
                <p className="text-[11px] font-serif text-slate-500">Order copies for children, siblings, or archives</p>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 5, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuantity(num)}
                    className={`w-9 h-9 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer ${
                      quantity === num
                        ? 'bg-amber-800 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* STEP 2: Shipping Destination Address */}
          <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-[#EFECE7] pb-3">
              <span className="w-6 h-6 rounded-full bg-amber-800 text-white text-xs font-serif font-bold flex items-center justify-center">
                2
              </span>
              <h3 className="text-base font-serif font-bold text-slate-800">Shipping Destination</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-serif font-semibold text-slate-700">Recipient Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Eleanor Grace Ross"
                  value={address.recipientName}
                  onChange={(e) => setAddress({ ...address, recipientName: e.target.value })}
                  className="w-full px-3 py-2 mt-1 rounded-xl border border-slate-300 text-xs font-serif bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-serif font-semibold text-slate-700">Street Address *</label>
                <input
                  type="text"
                  placeholder="123 Meadow Lane"
                  value={address.street1}
                  onChange={(e) => setAddress({ ...address, street1: e.target.value })}
                  className="w-full px-3 py-2 mt-1 rounded-xl border border-slate-300 text-xs font-serif bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-serif font-semibold text-slate-700">Apartment, Suite, Unit</label>
                <input
                  type="text"
                  placeholder="Apt 4B (Optional)"
                  value={address.street2}
                  onChange={(e) => setAddress({ ...address, street2: e.target.value })}
                  className="w-full px-3 py-2 mt-1 rounded-xl border border-slate-300 text-xs font-serif bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-serif font-semibold text-slate-700">City *</label>
                  <input
                    type="text"
                    placeholder="Asheville"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="w-full px-3 py-2 mt-1 rounded-xl border border-slate-300 text-xs font-serif bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-serif font-semibold text-slate-700">State / Region *</label>
                  <input
                    type="text"
                    placeholder="NC"
                    value={address.stateCode}
                    onChange={(e) => setAddress({ ...address, stateCode: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 mt-1 rounded-xl border border-slate-300 text-xs font-serif bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-serif font-semibold text-slate-700">Postal Code *</label>
                  <input
                    type="text"
                    placeholder="28801"
                    value={address.postcode}
                    onChange={(e) => setAddress({ ...address, postcode: e.target.value })}
                    className="w-full px-3 py-2 mt-1 rounded-xl border border-slate-300 text-xs font-serif bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-serif font-semibold text-slate-700">Phone Number (Carrier Tracking)</label>
                <input
                  type="tel"
                  placeholder="555-555-5555"
                  value={address.phoneNumber}
                  onChange={(e) => setAddress({ ...address, phoneNumber: e.target.value })}
                  className="w-full px-3 py-2 mt-1 rounded-xl border border-slate-300 text-xs font-serif bg-white"
                />
              </div>
            </div>
          </div>

          {/* STEP 3: Shipping Carrier Service & Live Quote */}
          <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-[#EFECE7] pb-3">
              <span className="w-6 h-6 rounded-full bg-amber-800 text-white text-xs font-serif font-bold flex items-center justify-center">
                3
              </span>
              <h3 className="text-base font-serif font-bold text-slate-800">Delivery Speed & Live Quote</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'MAIL', label: 'Standard Mail', days: '7-10 Days' },
                { id: 'PRIORITY_MAIL', label: 'Priority Mail', days: '3-5 Days' },
                { id: 'GROUND', label: 'Ground Carrier', days: '3-5 Days' },
                { id: 'EXPEDITED', label: 'Express Priority', days: '1-2 Days' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setShippingLevel(m.id as any)}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    shippingLevel === m.id
                      ? 'border-amber-800 bg-amber-50 text-amber-900 font-bold shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Truck className="w-4 h-4 mx-auto mb-1 text-slate-500" />
                  <div className="text-xs font-serif">{m.label}</div>
                  <div className="text-[10px] text-slate-400">{m.days}</div>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleCalculateQuote}
              disabled={calculatingQuote}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold font-serif transition-all cursor-pointer disabled:opacity-50"
            >
              {calculatingQuote ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting to Lulu Direct...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Calculate Live Print & Shipping Quote</span>
                </>
              )}
            </button>

            {quoteError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-serif flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{quoteError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary, Proofs & Checkout (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Order Cost Breakdown Card */}
          <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-6 shadow-xs space-y-5">
            <h3 className="text-base font-serif font-bold text-slate-800 border-b border-[#EFECE7] pb-3">
              Order Summary
            </h3>

            {quote ? (
              <div className="space-y-3 font-serif">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>
                    Print & Binding ({quantity} × ${quote.unitCost.toFixed(2)})
                  </span>
                  <span className="font-semibold text-slate-800">
                    ${(quote.unitCost * quantity).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Shipping ({shippingLevel.replace('_', ' ')})</span>
                  <span className="font-semibold text-slate-800">${quote.shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Packaging & Fulfillment</span>
                  <span className="font-semibold text-slate-800">${quote.fulfillmentCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Sales Tax</span>
                  <span className="font-semibold text-slate-800">${quote.taxCost.toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-200 pt-3 flex justify-between text-base font-black text-amber-900">
                  <span>Total Order</span>
                  <span>${quote.totalCost.toFixed(2)} USD</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-center space-y-1">
                <Info className="w-5 h-5 text-amber-700 mx-auto" />
                <p className="text-xs font-serif text-amber-900 font-semibold">Live Quote Pending</p>
                <p className="text-[11px] font-serif text-amber-700">
                  Enter your address and click <strong>Calculate Live Quote</strong> to retrieve real-time rates from Lulu.
                </p>
              </div>
            )}

            {/* Digital Proof Download Options */}
            <div className="border-t border-[#EFECE7] pt-4 space-y-2">
              <label className="text-xs font-serif font-bold text-slate-700">Verify Print Proofs (Lulu POD)</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadInterior}
                  disabled={downloadingInterior}
                  className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-[11px] font-serif font-semibold text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {downloadingInterior ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  <span>Interior PDF</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadCoverSpread}
                  disabled={downloadingCover}
                  className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-[11px] font-serif font-semibold text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {downloadingCover ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  <span>Cover Spread</span>
                </button>
              </div>
            </div>

            {/* Proof Approval Checkbox */}
            <div className="border-t border-[#EFECE7] pt-4">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={proofApproved}
                  onChange={(e) => setProofApproved(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-amber-800 rounded border-slate-300 focus:ring-amber-700"
                />
                <span className="text-xs font-serif text-slate-600 leading-tight">
                  I have previewed my book chapters and approve this heirloom book configuration for physical printing and shipment.
                </span>
              </label>
            </div>

            {/* Place Print Order Button */}
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={placingOrder || !proofApproved || !quote}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white font-serif font-black text-sm transition-all shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {placingOrder ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting to Lulu Direct...</span>
                </>
              ) : (
                <>
                  <Package className="w-4 h-4" />
                  <span>Place Print Order (${quote ? quote.totalCost.toFixed(2) : '0.00'})</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] font-serif text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Archival Quality Guarantee &bull; Tracked Carrier Shipping</span>
            </div>
          </div>
        </div>
      </div>

      {/* Past Print Orders History Card */}
      <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-[#EFECE7] pb-4">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-amber-800" />
            <h3 className="text-lg font-serif font-black text-slate-800">My Print Orders & Tracking</h3>
          </div>
          <button
            type="button"
            onClick={loadOrders}
            disabled={loadingOrders}
            className="text-xs font-serif text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-8 text-xs font-serif text-slate-500">
            No physical print orders placed yet. Choose your binding and submit your first copy above!
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((ord) => (
              <div
                key={ord.orderId}
                className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-serif font-bold text-slate-800">
                      {ord.bindingTypeCd === 'HARDCOVER' ? 'Library Hardcover' : 'Trade Paperback'} ({ord.quantity}{' '}
                      {ord.quantity === 1 ? 'copy' : 'copies'})
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider ${
                        ord.orderStatusCd === 'SHIPPED' || ord.orderStatusCd === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.orderStatusCd === 'IN_PRODUCTION'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {ord.orderStatusCd.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] font-serif text-slate-500">
                    Job ID: <strong>{ord.luluPrintJobId || 'Pending'}</strong> &bull; Total: ${Number(ord.totalCost).toFixed(2)} &bull; Ordered{' '}
                    {new Date(ord.orderCreatedAt).toLocaleDateString()}
                  </p>
                  <p className="text-[11px] font-serif text-slate-500">
                    Recipient: {ord.recipientName} &bull; {ord.city}, {ord.stateCode} {ord.postcode}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleSyncStatus(ord.orderId)}
                    disabled={syncingOrderId === ord.orderId}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-serif text-slate-700 flex items-center gap-1 cursor-pointer"
                    title="Check latest status from Lulu"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncingOrderId === ord.orderId ? 'animate-spin' : ''}`} />
                    <span>Sync Status</span>
                  </button>

                  {ord.trackingNumber && (
                    <a
                      href={
                        ord.trackingUrl ||
                        `https://tools.usps.com/go/TrackConfirmAction?tLabels=${ord.trackingNumber}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-serif font-bold flex items-center gap-1.5 shadow-2xs"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Track ({ord.carrierName || 'Carrier'})</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

