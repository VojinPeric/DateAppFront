import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  let authService = inject(AuthService);
  let routerService = inject(Router);

  if (!authService.isLoggedin()) {
    routerService.navigate(['/login_register_page']);
    return false;
  }
  return true;
};
