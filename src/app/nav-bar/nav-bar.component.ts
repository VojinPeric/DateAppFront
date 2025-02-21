import { Component, inject, Input } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav-bar',
  imports: [CommonModule],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css'
})
export class NavBarComponent {
  auth = inject(AuthService);
  private _active?: string;
  username: string = "username: " + this.auth.loggedUser;

  @Input()
  set active(act: string) {
    this._active = act;
  }
  
  get active(): string | undefined {
    return this._active;
  }

  logout() {
    this.auth.logout();
  }
}
