import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

export const nauthGuard: CanActivateFn = (route, state) => {
  let authService = inject(AuthService);
  let routerService = inject(Router);

  if (authService.isLoggedin()) {
    routerService.navigate(['/spin_page']);
    return false;
  }
  return true;
};
