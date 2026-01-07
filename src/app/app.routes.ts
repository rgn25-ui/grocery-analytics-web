import { Routes } from '@angular/router';
import { AnalyticsComponent } from './analytics/analytics.component';

export const routes: Routes = [
{ path: '', component: AnalyticsComponent },  // Default route
{ path: 'analytics', component: AnalyticsComponent },
{ path: '**', redirectTo: '' }  // Redirect unknown routes to home
];
