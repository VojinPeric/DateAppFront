import { Routes } from '@angular/router';
import { LoginRegisterPageComponent } from './login_register_page/login-register-page/login-register-page.component';
import { AppComponent } from './app.component';
import { PoolPageComponent } from './pool_page/pool-page/pool-page.component';
import { PresetsPageComponent } from './presets_page/presets-page/presets-page.component';
import { SpinPageComponent } from './spin_page/spin-page/spin-page.component';
import { authGuard } from './service/auth.guard';
import { nauthGuard } from './service/nauth.guard';
import { DateElementComponent } from './date-element/date-element.component';

export const routes: Routes = [
    {path: 'date', component: DateElementComponent},
    {path: '', component: AppComponent, canActivate: [authGuard, nauthGuard]},
    {path: 'login_register_page', component: LoginRegisterPageComponent, canActivate: [nauthGuard]},
    {path: 'pool_page', component: PoolPageComponent, canActivate: [authGuard]},
    {path: 'presets_page', component: PresetsPageComponent, canActivate: [authGuard]},
    {path: 'spin_page', component: SpinPageComponent, canActivate: [authGuard]}
];
