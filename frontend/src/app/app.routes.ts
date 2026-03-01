import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { CaseViewComponent } from './features/case-view/case-view.component';

export const routes: Routes = [
  {
    path: '',
    component: DashboardComponent
  },
  {
    path: 'cases/:caseId',
    component: CaseViewComponent
  }
];
