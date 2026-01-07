import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GroceryAnalyticsService } from '../services/grocery-analytics.service';
import { ItemPurchaseAnalytics, PurchaseDate } from '../models/analytics.models';

@Component({
selector: 'app-analytics',
standalone: true,
imports: [CommonModule, FormsModule],
templateUrl: './analytics.component.html',
styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit {
userId: string = 'shared-user';  // Hardcoded!
searchQuery: string = '';
selectedItem: string = '';

searchResults: string[] = [];
analytics: ItemPurchaseAnalytics | null = null;
purchaseDates: PurchaseDate[] = [];

loading: boolean = false;
error: string | null = null;

constructor(private analyticsService: GroceryAnalyticsService) {}

  ngOnInit(): void {
    // No need to load from localStorage anymore
  }

  onSearchInput(): void {
    if (this.searchQuery.length < 2) {
      this.searchResults = [];
      return;
    }

    this.analyticsService.searchItems(this.userId, this.searchQuery)
      .subscribe({
        next: (results) => {
          this.searchResults = results;
        },
        error: (err) => {
          console.error('Search error:', err);
          this.searchResults = [];
        }
      });
  }

  selectItem(itemName: string): void {
    this.selectedItem = itemName;
    this.searchQuery = itemName;
    this.searchResults = [];
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    if (!this.selectedItem || !this.userId) {
      return;
    }

    this.loading = true;
    this.error = null;

    // Load frequency analytics
    this.analyticsService.getItemFrequency(this.userId, this.selectedItem)
      .subscribe({
        next: (data) => {
          this.analytics = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Analytics error:', err);
          this.error = 'Kunne ikke hente data. Tjek din forbindelse.';
          this.loading = false;
        }
      });

    // Load purchase dates
    this.analyticsService.getPurchaseDates(this.userId, this.selectedItem)
      .subscribe({
        next: (dates) => {
          this.purchaseDates = dates;
        },
        error: (err) => {
          console.error('Purchase dates error:', err);
        }
      });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('da-DK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  clearSelection(): void {
    this.selectedItem = '';
    this.searchQuery = '';
    this.analytics = null;
    this.purchaseDates = [];
    this.searchResults = [];
  }
}
