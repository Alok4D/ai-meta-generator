"use client";

import React, { useEffect } from "react";
import { useCreateCheckoutSessionMutation, useSubmitManualPaymentMutation } from "@/lib/feature/payment/paymentApi";
import Swal from "sweetalert2";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: any;
}

export default function PaymentModal({ isOpen, onClose, plan }: PaymentModalProps) {
  const [createCheckoutSession] = useCreateCheckoutSessionMutation();
  const [submitManualPayment] = useSubmitManualPaymentMutation();

  useEffect(() => {
    if (isOpen && plan) {
      fireInitialAlert();
    }
  }, [isOpen, plan]);

  const fireInitialAlert = async () => {
    const result = await Swal.fire({
      title: `Select Payment Method`,
      html: `
        <div style="text-align: left; margin-bottom: 20px;">
          <p>You are about to purchase the <strong>${plan.name}</strong> plan for <strong>$${plan.price}/${plan.period}</strong>.</p>
        </div>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <button id="btn-stripe" class="swal2-confirm swal2-styled" style="width: 100%; margin: 0; background-color: #635BFF; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: bold; border-radius: 6px;">
            Pay with Stripe
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
          
          <button id="btn-bkash" class="swal2-cancel swal2-styled" style="width: 100%; margin: 0; background-color: #e2136e; color: white; display: flex; align-items: center; justify-content: center; gap: 10px; font-weight: bold;">
            <img src="/bkash.png" alt="bKash" style="height: 24px; object-fit: contain; background: white; padding: 2px; border-radius: 4px;" onerror="this.style.display='none'" />
            Pay with bKash
          </button>
          
          <button id="btn-nagad" class="swal2-cancel swal2-styled" style="width: 100%; margin: 0; background-color: #ed1c24; color: white; display: flex; align-items: center; justify-content: center; gap: 10px; font-weight: bold;">
            <img src="/nagad.png" alt="Nagad" style="height: 24px; object-fit: contain; background: white; padding: 2px; border-radius: 4px;" onerror="this.style.display='none'" />
            Pay with Nagad
          </button>
        </div>
      `,
      showConfirmButton: false,
      showCancelButton: false,
      showCloseButton: true,
      customClass: {
        popup: 'rounded-2xl',
        title: 'text-2xl font-bold'
      },
      didOpen: () => {
        const btnStripe = Swal.getPopup()?.querySelector('#btn-stripe');
        const btnBkash = Swal.getPopup()?.querySelector('#btn-bkash');
        const btnNagad = Swal.getPopup()?.querySelector('#btn-nagad');
        
        btnStripe?.addEventListener('click', () => {
          Swal.close();
          handleStripeFlow();
        });
        
        btnBkash?.addEventListener('click', () => {
          Swal.close();
          handleManualGatewayFlow('bkash');
        });
        
        btnNagad?.addEventListener('click', () => {
          Swal.close();
          handleManualGatewayFlow('nagad');
        });
      }
    });

    if (result.dismiss === Swal.DismissReason.close || result.dismiss === Swal.DismissReason.backdrop || result.dismiss === Swal.DismissReason.esc) {
      onClose();
    }
  };

  const handleStripeFlow = async () => {
    Swal.fire({
      title: 'Redirecting to Stripe...',
      text: 'Please wait while we prepare your checkout session',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const response = await createCheckoutSession({ planId: plan._id }).unwrap();
      if (response.url) {
        window.location.href = response.url;
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to initiate checkout. Please try again.',
        confirmButtonColor: '#0f172a'
      }).then(() => {
        onClose();
      });
    }
  };

  const handleManualGatewayFlow = async (method: 'bkash' | 'nagad') => {
    const amountBdt = Math.round(plan.price * 120);
    
    const isBkash = method === 'bkash';
    const primaryColor = isBkash ? '#e2136e' : '#ed1c24';
    const logoHtml = isBkash 
      ? `<img src="/bkash.png" alt="bKash" style="height: 30px; object-fit: contain;" onerror="this.outerHTML='<div style=\\'color: #e2136e; font-weight: 900; font-size: 24px; font-style: italic;\\'>bKash</div>'" />`
      : `<img src="/nagad.png" alt="Nagad" style="height: 30px; object-fit: contain;" onerror="this.outerHTML='<div style=\\'color: #ed1c24; font-weight: 900; font-size: 24px;\\'>Nagad</div>'" />`;
    
    const headerHtml = `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid ${primaryColor}; padding-bottom: 10px; margin-bottom: 15px;">
        ${logoHtml}
        <div style="color: ${primaryColor}; font-weight: 600; padding-right: 28px;">Payment</div>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 40px; height: 40px; border-radius: 50%; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          </div>
          <div style="text-align: left;">
            <div style="font-size: 14px; font-weight: bold; color: #333;">MetaGen AI</div>
            <div style="font-size: 12px; color: #666;">Plan: ${plan.name}</div>
          </div>
        </div>
        <div style="font-size: 20px; font-weight: bold; color: #333;">৳${amountBdt}</div>
      </div>
    `;

    const bodyHtml = `
      <div style="background-color: ${primaryColor}; border-radius: 8px; padding: 25px 15px; text-align: center; color: white;">
        <div style="font-size: 14px; margin-bottom: 5px;">Please send money to our Personal Account:</div>
        <div style="font-size: 22px; font-weight: bold; margin-bottom: 20px; background: rgba(255,255,255,0.2); display: inline-block; padding: 5px 15px; border-radius: 5px;">01719277951</div>
        
        <div style="font-size: 14px; margin-bottom: 10px;">Your ${isBkash ? 'bKash' : 'Nagad'} Account number</div>
        <input id="gw-sender" class="swal2-input" placeholder="e.g 01XXXXXXXXX" style="width: 100%; max-width: 100%; margin: 0 0 15px 0; background: white; color: black; text-align: center; font-weight: bold; border: none; height: 45px; border-radius: 4px;">
        
        <div style="font-size: 14px; margin-bottom: 10px;">Transaction ID (TrxID)</div>
        <input id="gw-trxid" class="swal2-input" placeholder="e.g 9B123XYZ" style="width: 100%; max-width: 100%; margin: 0; background: white; color: black; text-align: center; font-weight: bold; border: none; height: 45px; border-radius: 4px;">
      </div>
      <div style="text-align: center; margin-top: 15px; font-size: 12px; color: #666;">
        By clicking on Confirm, you are agreeing to the terms & conditions
      </div>
    `;

    const { value: formValues, dismiss } = await Swal.fire({
      html: headerHtml + bodyHtml,
      showCloseButton: true,
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonText: 'CONFIRM',
      cancelButtonText: 'CLOSE',
      confirmButtonColor: '#d1d5db',
      cancelButtonColor: '#d1d5db',
      customClass: {
        popup: 'p-4 sm:p-6',
        confirmButton: '!bg-[#e5e7eb] !text-black !font-bold !w-[48%] !m-0 !rounded-none hover:!bg-[#d1d5db]',
        cancelButton: '!bg-[#e5e7eb] !text-black !font-bold !w-[48%] !m-0 !rounded-none hover:!bg-[#d1d5db]',
        actions: '!w-full !flex !justify-between !mt-4 !p-0'
      },
      footer: `
        <div style="color: ${primaryColor}; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 8px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          16247
        </div>
      `,
      preConfirm: () => {
        const sender = (document.getElementById('gw-sender') as HTMLInputElement).value;
        const trx = (document.getElementById('gw-trxid') as HTMLInputElement).value;
        
        if (!sender || !trx) {
          Swal.showValidationMessage('Please enter both Account Number and TrxID');
          return false;
        }
        return { paymentMethod: method, senderNumber: sender, trxId: trx };
      }
    });

    if (formValues) {
      Swal.fire({
        title: 'Processing...',
        text: 'Verifying payment details...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        const response = await submitManualPayment({
          planId: plan._id,
          paymentMethod: formValues.paymentMethod,
          senderNumber: formValues.senderNumber,
          trxId: formValues.trxId,
          amount: amountBdt,
        }).unwrap();

        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: 'Payment Successful',
            text: 'Your payment request has been submitted. Please wait for admin verification.',
            confirmButtonColor: primaryColor,
          }).then(() => {
            onClose();
          });
        }
      } catch (error: any) {
        Swal.fire({
          icon: 'error',
          title: 'Payment Failed',
          text: error?.data?.error || "Failed to process payment. Please try again.",
          confirmButtonColor: primaryColor,
        }).then(() => {
          onClose();
        });
      }
    } else if (dismiss === Swal.DismissReason.cancel || dismiss === Swal.DismissReason.backdrop || dismiss === Swal.DismissReason.esc) {
      onClose();
    }
  };

  return null;
}
