import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { HomeComponent } from './features/home/home.component';
import { UserComponent } from './features/user/user.component';
import { BranchComponent } from './features/branches/branch.component';
import { featureGuard } from './core/guards/feature.gurad';
import { LoanRequestComponent } from './features/loan-request/loan-request.component';
import { ReviewLoanComponent } from './features/review-loan/review-loan.component';
import { DisbursementLoanComponent } from './features/disbursement-loan/disbursement-loan.component';
import { DisbursementDetailComponent } from './features/disbursement-detail/disbursement-detail.component';
import { RoleComponent } from './features/role/role.component';
import { ProfileComponent } from './features/profile/profile.component';
import { ChangePasswordComponent } from './features/change-password/change-password.component';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { LoginComponent } from './features/login/login.component';
import { redirectIfLoggedInGuard } from './core/guards/redirect.guard';
import { ResetPasswordComponent } from './features/reset-password/reset-password.component';
import { ApprovalLoanComponent } from './features/approval-loan/approval-loan.component';
import { AddUserComponent } from './features/add-user/add-user.component';
import { LandingComponent } from './features/landing/landing.component';
import { PlafondComponent } from './features/plafond/plafond.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'landing',
    pathMatch: 'full',
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: HomeComponent,
      },
      {
        path: 'users',
        canActivate: [featureGuard('FEATURE_MANAGE_USERS')],
        children: [
          { path: '', component: UserComponent },
          { path: 'add', component: AddUserComponent },
        ],
      },
      {
        path: 'branches',
        component: BranchComponent,
        canActivate: [featureGuard('FEATURE_MANAGE_BRANCHES')],
      },
      {
        path: 'loan-requests',
        children: [
          {
            path: '',
            canActivate: [
              featureGuard(
                'FEATURE_MANAGE_LOAN_REQUESTS',
                'FEATURE_GET_ALL_LOAN_REQUEST_REVIEW',
                'FEATURE_GET_ALL_LOAN_REQUEST_APPROVAL'
              ),
            ],
            component: LoanRequestComponent,
          },
          {
            path: 'review',
            component: ReviewLoanComponent,
            canActivate: [
              featureGuard(
                'FEATURE_MANAGE_LOAN_REQUESTS',
                'FEATURE_GET_LOAN_REQUEST_BY_ID_REVIEW'
              ),
            ],
            data: { prerender: false },
          },
          {
            path: 'approval',
            component: ApprovalLoanComponent,
            canActivate: [
              featureGuard(
                'FEATURE_MANAGE_LOAN_REQUESTS',
                'FEATURE_GET_LOAN_REQUEST_BY_ID_APPROVAL'
              ),
            ],
            data: { prerender: false },
          },
        ],
      },
      {
        path: 'disbursement',
        children: [
          {
            path: '',
            canActivate: [
              featureGuard('FEATURE_GET_LOAN_REQUEST_DISBURSEMENT'),
            ],
            component: DisbursementLoanComponent,
          },
          {
            path: 'detail',
            canActivate: [
              featureGuard('FEATURE_GET_LOAN_REQUEST_BY_ID_DISBURSEMENT'),
            ],
            component: DisbursementDetailComponent,
            data: { prerender: false },
          },
        ],
      },
      {
        path: 'roles',
        component: RoleComponent,
        canActivate: [featureGuard('FEATURE_MANAGE_ROLES')],
      },
      {
        path: 'profile',
        component: ProfileComponent,
        // canActivate: [featureGuard('VIEW_PROFILE')],
      },
      {
        path: 'change-password',
        component: ChangePasswordComponent,
        // canActivate: [featureGuard('CHANGE_PASSWORD')],
      },
      {
        path: 'plafond',
        component: PlafondComponent,
      },
    ],
  },
  {
    path: 'login',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        component: LoginComponent,
        data: { title: 'Login' },
        canActivate: [redirectIfLoggedInGuard],
      },
    ],
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
    data: { prerender: false },
  },
  {
    path: 'landing',
    component: LandingComponent,
  },
  { path: '**', redirectTo: '/landing' },
];
