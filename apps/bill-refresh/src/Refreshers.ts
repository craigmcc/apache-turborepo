/**
 * Functions to return the entire contents of specific models
 * via the Bill API and store them in a local database.
 */

// External Modules ----------------------------------------------------------

// Internal Modules ----------------------------------------------------------

import { fetchAccounts } from "@repo/bill-api/AccountActions";
import { fetchSessionIdV2, fetchSessionIdV3 } from "@repo/bill-api/AuthActions";
import { fetchBills } from "@repo/bill-api/BillActions";
import { fetchUsers } from "@repo/bill-api/UserActions";
import { fetchVendors } from "@repo/bill-api/VendorActions";
import {
  dbBill,
  User,
  Vendor,
} from "@repo/bill-db/Models";
import {
  createAccount,
  createBill,
  createBillClassifications,
  createBillLineItem,
  createBillLineItemClassifications,
  createUser,
  createVendor,
  createVendorAdditionalInfo,
  createVendorAddress,
  createVendorAutoPay,
  createVendorPaymentInformation,
  createVendorVirtualCard,
} from "./Creators";

// Public Objects ------------------------------------------------------------

export async function refreshAccounts(sessionId: string): Promise<void> {

  console.log("Fetching accounts...");

  const billAccounts = await fetchAccounts(sessionId);

  for (const billAccount of billAccounts) {
    const account = createAccount(billAccount);
    await dbBill.account.upsert({
      where: { id: account.id },
      create: account,
      update: account,
    });
  }

  console.log("Accounts refreshed:", billAccounts.length);
}

export async function refreshBills(sessionId: string): Promise<void> {

  console.log("Fetching bills...");
  let count = 0;
  let nextPage: string | null = "";

  while (nextPage !== null) {

    const result = await fetchBills(sessionId,
      {
        max: 100,
        page: nextPage && nextPage.length > 0 ? nextPage : undefined,
      });

    for (const billBill of result.results) {

      const bill = createBill(billBill);
      await dbBill.bill.upsert({
        where: { id: bill.id },
        create: bill,
        update: bill,
      });

      const classifications = createBillClassifications(billBill);
      if (classifications) {
        await dbBill.billClassifications.upsert({
          where: { billId: classifications.billId },
          create: classifications,
          update: classifications,
        });
      } else {
        await dbBill.billClassifications.deleteMany({
          where: { billId: bill.id },
        });
      }

      for (const billBillLineItem of billBill.billLineItems || []) {
        const billLineItem = createBillLineItem(billBill, billBillLineItem);
        await dbBill.billLineItem.upsert({
          where: { id: billLineItem.id },
          create: billLineItem,
          update: billLineItem,
        });

        const lineItemClassifications = createBillLineItemClassifications(billBill, billBillLineItem);
        if (lineItemClassifications) {
          await dbBill.billLineItemClassifications.upsert({
            where: { billLineItemId: lineItemClassifications.billLineItemId },
            create: lineItemClassifications,
            update: lineItemClassifications,
          });
        } else {
          await dbBill.billLineItemClassifications.deleteMany({
            where: { billLineItemId: billLineItem.id },
          });
        }
      }

      count++;
    }

    nextPage = result.nextPage || null;

  }

  console.log("Bills refreshed:", count);

}

export async function refreshSessionIdV2(): Promise<string> {
  console.log("Fetching session ID V2...");
  return await fetchSessionIdV2();
}

export async function refreshSessionIdV3(): Promise<string> {
  console.log("Fetching session ID V3...");
  return await fetchSessionIdV3();
}

export async function refreshUsers(sessionId: string): Promise<void> {

  console.log("Fetching users...");
  let count = 0;
  let nextPage: string | null = "";

  while (nextPage !== null) {

    const result = await fetchUsers(sessionId,
      {
        max: 100,
        page: nextPage && nextPage.length > 0? nextPage : undefined,
      });

    for (const billUser of result.results) {

      const user: User = createUser(billUser);

      await dbBill.user.upsert({
        where: { id: user.id },
        create: user,
        update: user,
      });

      count++;

    }

    nextPage = result.nextPage || null;

  }

  console.log("Users refreshed:", count);

}

export async function refreshVendors(sessionId: string): Promise<void> {

  console.log("Fetching vendors...");
  let count = 0;
  let nextPage: string | null = "";

  while (nextPage !== null) {

    const result = await fetchVendors(sessionId,
      {
        max: 100,
        page: nextPage && nextPage.length > 0? nextPage : undefined,
      });

    for (const billVendor of result.results) {

      const vendor: Vendor = createVendor(billVendor);
      await dbBill.vendor.upsert({
        where: { id: vendor.id },
        create: vendor,
        update: vendor,
      });

      const vendorAdditionalInfo = createVendorAdditionalInfo(billVendor);
      if (vendorAdditionalInfo) {
        await dbBill.vendorAdditionalInfo.upsert({
          where: { vendorId: vendor.id },
          create: vendorAdditionalInfo,
          update: vendorAdditionalInfo,
        });
      }

      const vendorAddress = createVendorAddress(billVendor);
      if (vendorAddress) {
        await dbBill.vendorAddress.upsert({
          where: { vendorId: vendor.id },
          create: vendorAddress,
          update: vendorAddress,
        });
      }

      const vendorAutoPay = createVendorAutoPay(billVendor);
      if (vendorAutoPay) {
        await dbBill.vendorAutoPay.upsert({
          where: { vendorId: vendor.id },
          create: vendorAutoPay,
          update: vendorAutoPay,
        });
      }

      const vendorPaymentInformation = createVendorPaymentInformation(billVendor);
      if (vendorPaymentInformation) {
        await dbBill.vendorPaymentInformation.upsert({
          where: { vendorId: vendor.id },
          create: vendorPaymentInformation,
          update: vendorPaymentInformation,
        });
      }

      const vendorVirtualCard = createVendorVirtualCard(billVendor);
      if (vendorVirtualCard) {
        await dbBill.vendorVirtualCard.upsert({
          where: { vendorId: vendor.id },
          create: vendorVirtualCard,
          update: vendorVirtualCard,
        });
      }

      count++;

    }

    nextPage = result.nextPage || null;

  }

  console.log("Vendors refreshed:", count);

}
