export interface ItemPurchaseAnalytics {
  itemName: string;
lastWeek: number;
lastMonth: number;
lastQuarter: number;
lastYear: number;
totalAllTime: number;
}

export interface PurchaseDate {
purchaseDate: string;
listName: string;
quantity: number;
itemName: string;  // NEW: Add item name
}
