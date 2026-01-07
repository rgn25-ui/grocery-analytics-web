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
displayName: string = '';  // NEW: For showing search term + variant count

searchResults: string[] = [];
matchedVariants: string[] = [];  // All found variants
selectedVariants: Set<string> = new Set();  // NEW: User-selected variants
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
    this.matchedVariants = [];
    this.selectedVariants.clear();

    // First, get all matching variants
    this.analyticsService.searchItems(this.userId, this.selectedItem)
      .subscribe({
        next: (variants) => {
          this.matchedVariants = variants;
          // By default, select all variants
          variants.forEach(v => this.selectedVariants.add(v));

          // Then load analytics for selected variants
          this.loadAnalyticsData();
        },
        error: (err) => {
          console.error('Variants search error:', err);
          this.loadAnalyticsData();
        }
      });
  }

  toggleVariant(variant: string): void {
    if (this.selectedVariants.has(variant)) {
      this.selectedVariants.delete(variant);
    } else {
      this.selectedVariants.add(variant);
    }

    // Reload analytics with new selection
    if (this.selectedVariants.size > 0) {
      this.loadAnalyticsData();
    } else {
      // If no variants selected, clear analytics
      this.analytics = null;
      this.purchaseDates = [];
    }
  }

  isVariantSelected(variant: string): boolean {
    return this.selectedVariants.has(variant);
  }

  private loadAnalyticsData(): void {
  if (this.selectedVariants.size === 0) {
    return;
  }

  const selectedItems = Array.from(this.selectedVariants);

  // Update display name based on selection
  if (selectedItems.length === 1) {
    this.displayName = selectedItems[0];
  } else {
    this.displayName = `${this.selectedItem} (${selectedItems.length} varianter)`;
  }

  // Load frequency analytics for selected variants
  this.analyticsService.getItemsFrequency(this.userId, selectedItems)
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

  // Load purchase dates for selected variants
  this.analyticsService.getItemsPurchaseDates(this.userId, selectedItems)
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
    this.matchedVariants = [];
    this.selectedVariants.clear();
  }
}
