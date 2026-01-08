import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GroceryAnalyticsService } from '../services/grocery-analytics.service';
import { ItemPurchaseAnalytics, PurchaseDate, TopItemStats } from '../models/analytics.models';

@Component({
selector: 'app-analytics',
standalone: true,
imports: [CommonModule, FormsModule],
templateUrl: './analytics.component.html',
styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit {
userId: string = 'shared-user';
searchQuery: string = '';
selectedItem: string = '';
displayName: string = '';

searchResults: string[] = [];
matchedVariants: string[] = [];
selectedVariants: Set<string> = new Set();
analytics: ItemPurchaseAnalytics | null = null;
purchaseDates: PurchaseDate[] = [];

topItems: TopItemStats[] = [];
showTopItems: boolean = true;

loading: boolean = false;
error: string | null = null;

constructor(private analyticsService: GroceryAnalyticsService) {}

  ngOnInit(): void {
    this.loadTopItems();
  }

  loadTopItems(): void {
    this.analyticsService.getTopItems(this.userId, 50)
      .subscribe({
        next: (items) => {
          this.topItems = items;
        },
        error: (err) => {
          console.error('Top items error:', err);
        }
      });
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
    this.showTopItems = false;
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

    this.analyticsService.searchItems(this.userId, this.selectedItem)
      .subscribe({
        next: (variants) => {
          this.matchedVariants = variants;
          variants.forEach(v => this.selectedVariants.add(v));
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

    if (this.selectedVariants.size > 0) {
      this.loadAnalyticsData();
    } else {
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

    if (selectedItems.length === 1) {
      this.displayName = selectedItems[0];
    } else {
      this.displayName = `${this.selectedItem} (${selectedItems.length} varianter)`;
    }

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

  formatRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'I dag';
    if (days === 1) return 'I går';
    if (days < 7) return `${days} dage siden`;
    if (days < 30) return `${Math.floor(days / 7)} uger siden`;
    if (days < 365) return `${Math.floor(days / 30)} måneder siden`;
    return `${Math.floor(days / 365)} år siden`;
  }

  clearSelection(): void {
    this.selectedItem = '';
    this.searchQuery = '';
    this.analytics = null;
    this.purchaseDates = [];
    this.searchResults = [];
    this.matchedVariants = [];
    this.selectedVariants.clear();
    this.showTopItems = true;
  }
}
