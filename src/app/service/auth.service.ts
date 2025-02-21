import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { stringify } from 'node:querystring';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public errorMessage: string = "";
  private readonly URLBASE: string = "https://dateappbackend.onrender.com";
  private readonly JWT_PATH: string = 'JWT_TOKEN_' + this.URLBASE;
  private readonly USER_PATH: string = 'USERNAME_' + this.URLBASE;
  private readonly ACTIVE_PRESET_PATH: string = 'ACTIVE_PRESET_' + this.URLBASE;

  private http = inject(HttpClient);

  constructor() { }

  set loggedUser(user: string) {
    localStorage.setItem(this.USER_PATH, user);
  }

  get loggedUser(): string | null {
    return localStorage.getItem(this.USER_PATH);
  }

  login(user: {username: string, password: string}): Observable<boolean> {
    return this.http.post(this.URLBASE + '/login', user)
    .pipe(
      map(response => {
        this.doLoginUser(user.username, response);
        return true;
      }),
      catchError(error => {
        if (error.status == 400) {
          this.errorMessage = error.error.msg;
        }
        else {
          this.errorMessage = "login error occured, code: " + error.status;
        }
        return of(false);
      })
    );
  }

  register(user: {username: string, password: string}): Observable<boolean> {
    return this.http.post(this.URLBASE + '/register', user)
    .pipe(
      map(response => {
        this.doLoginUser(user.username, response);
        return true;
      }),
      catchError(error => {
        if (error.status == 400) {
          this.errorMessage = "username already exists";
        }
        else {
          this.errorMessage = "register error occured, code: " + error.status;
        }
        return of(false);
      })
    );
  }

  private doLoginUser(username: string, tokens: any) {
    this.loggedUser = username;
    localStorage.setItem(this.ACTIVE_PRESET_PATH, JSON.stringify(tokens.activePreset));
    localStorage.setItem(this.JWT_PATH, tokens.jwt);
  }

  isAuthenticated(): Observable<boolean> {
    return this.http.get(this.URLBASE + '/authentication').pipe(
      map(() => true),
      catchError(() => {
        return of(false);
      })
    )
  }

  getAuthentication(): string | null {
    return localStorage.getItem(this.JWT_PATH);
  }

  isLoggedin(): boolean {
    return localStorage.getItem(this.JWT_PATH) != null;
  }

  logout() {
    localStorage.removeItem(this.ACTIVE_PRESET_PATH);
    localStorage.removeItem(this.USER_PATH);
    localStorage.removeItem(this.JWT_PATH);
  }

  getActivePreset() {
    let preset: string | null = localStorage.getItem(this.ACTIVE_PRESET_PATH);
    if (preset && preset != "undefined") return JSON.parse(preset);
    return null;
  }

  setActivePreset(preset: any) {
    localStorage.setItem(this.ACTIVE_PRESET_PATH, JSON.stringify(preset));
  }

  displayError(error: any) {
    if (error.status == 500) {
      alert("Server error occured");
    }
    else if (error.status == 400) {
      alert("Bad input on http request");
    }
    else if (error.status == 404) {
      alert("resource not found")
    }
    else alert ("error occured, status: " + error.status);
  }

  deleteDateFromPool(input: {dateId: number}): Observable<boolean> {
    return this.http.post(this.URLBASE + '/deleteDateFromPool', {
      dateId: input.dateId, 
      preset: this.getActivePreset()
    }).pipe(
      map(() => true),
      catchError((error) => {
        this.displayError(error);
        return of(false);
      })
    );
  }

  addDateToPool(input: {dateId: number}): Observable<boolean> {
    return this.http.post(this.URLBASE + '/addDateToPool', {
      dateId: input.dateId, 
      preset: this.getActivePreset()
    }).pipe(
      map(() => true),
      catchError((error) => {
        this.displayError(error);
        return of(false);
      })
    );
  }

  getAllDates(): Observable<any> {
    return this.http.post(this.URLBASE + '/getAllDates', {
      preset: this.getActivePreset()
    }).pipe(
      map((response) => response),
      catchError((error) => {
        this.displayError(error);
        return of(false);
      })
    );
  }

  addPreset(input: { name: string }): Observable<any> {
    return this.http.post(this.URLBASE + "/addPreset", input).pipe(
      map((response) => response),
      catchError((error) => {
        this.displayError(error);
        return of(false);
      })
    );
  }

  selectActivePreset(input: { presetId: number }): Observable<any> {
    return this.http.post(this.URLBASE + "/selectActivePreset", input).pipe(
      map((response) => response),
      catchError((error) => {
        this.displayError(error);
        return of(false);
      })
    );
  }

  getAllPresets(): Observable<any> {
    return this.http.get(this.URLBASE + "/getAllPresets").pipe(
      map((response) => response),
      catchError((error) => {
        this.displayError(error);
        return of(false);
      })
    );
  }

  getCheckedDates(): Observable<any> {
    return this.http.post(this.URLBASE + "/getCheckedDates", {
      preset: this.getActivePreset()
    }).pipe(
      map((response) => response),
      catchError((error) => {
        this.displayError(error);
        return of(false);
      })
    );
  }

  getActiveDate(): Observable<any> {
    return this.http.get(this.URLBASE + "/getActiveDate").pipe(
      map((response) => response),
      catchError((error) => {
        this.displayError(error);
        return of(false);
      })
    );
  }

  setActiveDate(input: { idDate: number; name: string; }): Observable<boolean> {
    return this.http.post(this.URLBASE + "/setActiveDate", {
      date: input,
      preset: this.getActivePreset()
    }).pipe(
      map(() => true),
      catchError((error) => {
        this.displayError(error);
        return of(false);
      })
    );
  }

  setActiveDateAndDeleteFromPool(input: { idDate: number; name: string; }): Observable<boolean> {
    return this.http.post(this.URLBASE + "/setActiveDateAndDeleteFromPool", {
      date: input,
      preset: this.getActivePreset()
    }).pipe(
      map(() => true),
      catchError((error) => {
        this.displayError(error);
        return of(false);
      })
    );
  }

  addDateLocal(input: {name: string}): Observable<any> {
    return this.http.post(this.URLBASE + "/addDateLocal", {
      name: input.name
    }).pipe(
      map((response) => response),
      catchError((error) => {
        this.displayError(error);
        return of(false);
      })
    );
  }

}
