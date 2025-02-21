import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  const token = auth.getAuthentication();
  if (token) {
    const c = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(c);
  }
  return next(req);
};