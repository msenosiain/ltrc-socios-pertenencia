import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/member-registration/member-registration.component')
        .then(m => m.MemberRegistrationComponent)
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./pages/member-registration/member-registration.component')
        .then(m => m.MemberRegistrationComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
