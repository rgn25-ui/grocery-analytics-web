import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ItemPurchaseAnalytics, PurchaseDate } from '../models/analytics.models';

@Injectable({
providedIn: 'root'
})
export class GroceryAnalyticsService {
private readonly API_URL = 'https://grocery-backend-285291610580.europe-west1.run.app/api/analytics';

constructor(private http: HttpClient) {}

  searchItems(userId: string, query: string): Observable<string[]> {
    const params = new HttpParams()
      .set('userId', userId)
      .set('query', query);

    return this.http.get<string[]>(`${this.API_URL}/search-items`, { params });
  }

  getItemFrequency(userId: string, itemName: string): Observable<ItemPurchaseAnalytics> {
    const params = new HttpParams()
      .set('userId', userId)
      .set('itemName', itemName);

    return this.http.get<ItemPurchaseAnalytics>(`${this.API_URL}/item-frequency`, { params });
  }

  getPurchaseDates(userId: string, itemName: string): Observable<PurchaseDate[]> {
    const params = new HttpParams()
      .set('userId', userId)
      .set('itemName', itemName);

    return this.http.get<PurchaseDate[]>(`${this.API_URL}/purchase-dates`, { params });
  }
}
