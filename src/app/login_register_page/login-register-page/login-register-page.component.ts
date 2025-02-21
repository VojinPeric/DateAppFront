import { Component, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-login-register-page',
  imports: [RouterModule, FormsModule],
  templateUrl: './login-register-page.component.html',
  styleUrl: './login-register-page.component.css'
})
export class LoginRegisterPageComponent {
  private auth: AuthService = inject(AuthService);
  private router: Router = inject(Router);

  public username: string = "";
  public password: string = "";
  public error: string = "";

  login() {
    console.log("cd")
    this.auth.login({username: this.username, password: this.password}).subscribe(success => {
      if (success) {
        this.router.navigate(['/spin_page']);
      }
      else {
        this.error = this.auth.errorMessage;
      }
    });
  }

  register() {
    this.auth.register({username: this.username, password: this.password}).subscribe(success => {
      if (success) {
        this.router.navigate(['/spin_page']);
      }
      else {
        this.error = this.auth.errorMessage;
      }
    });
  }
}
