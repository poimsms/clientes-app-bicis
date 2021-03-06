import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Storage } from "@ionic/storage";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { BehaviorSubject } from "rxjs";
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  apiURL: string;
  telefono: string;
  phone: number;
  idPhone: string;
  authState = new BehaviorSubject({ isAuth: false, usuario: {}, token: null });

  usuario: any;
  token: string;

  constructor(
    private http: HttpClient,
    private platform: Platform,
    private storage: Storage,
    private _config: ConfigService
  ) {
    platform.ready().then(() => {
      this.loadStorage();
    });
    this.apiURL = this._config.apiURL;

  }

  phoneNumberSendRequest(number) {
    const url = `${this.apiURL}/nexmo/number`;
    const body = { number };
    return this.http.post(url, body).toPromise();
  }

  phoneCancelRequest(id) {
    const url = `${this.apiURL}/nexmo/cancel`;
    const body = { id };
    return this.http.post(url, body).toPromise();
  }

  phoneVerifyCode(id, code) {
    const url = `${this.apiURL}/nexmo/verify`;
    const body = { id, code };
    return this.http.post(url, body).toPromise();
  }

  signUpUsuario(nombre, telefono, password) {
    return new Promise((resolve, reject) => {
      const url = `${this.apiURL}/usuarios/usuario-signup`;
      const body = { nombre, telefono, password };
      this.http.post(url, body).toPromise().then((res: any) => {
        if (res.ok) {
          this.saveStorage('usuario', res.token, res.usuario, res.usuario._id);
          resolve(true);
        }
      });
    });
  }


  signInUsuario(telefono, password) {
    return new Promise((resolve, reject) => {
      const url = `${this.apiURL}/usuarios/usuario-signin`;
      const body = { telefono, password };
      this.http.post(url, body).toPromise().then((res: any) => {
        if (res.ok) {
          this.saveStorage('usuario', res.token, res.usuario, res.usuario._id);
          resolve(true);
        } else {
          resolve(false)
        }
      });
    });
  }

  signInEmpresa(telefono, password) {
    return new Promise((resolve, reject) => {
      const url = `${this.apiURL}/usuarios/empresa-signin`;
      const body = { telefono, password };
      this.http.post(url, body).toPromise().then((res: any) => {
        if (res.ok) {
          this.saveStorage('empresa', res.token, res.usuario, res.usuario._id);
          resolve(true);
        } else {
          resolve(false)
        }
      });
    });
  }


  logout() {
    this.removeStorage();
    this.authState.next({ isAuth: false, usuario: null, token: null });
  }

  updateUser(token, body, id) {
    // return new Promise((resolve, reject) => {
    //   const url = `${this.apiURL}/users/actualizar/${id}`;
    //   this.http.post(url, body).toPromise()
    //     .then(() => {
    //       this.updateStorage(token)
    //         .then(() => resolve());
    //     });
    // });
  }

  saveFlowOrderStorage(order) {
    localStorage.setItem("order", JSON.stringify(order));
  }

  readFlowOrderStorage(token) {
    // const res = localStorage.getItem('order');
    // const order = JSON.parse(res);
    // if (order) {
    //   this.getUser(token)
    //     .then((resUser: any) => {
    //       const authData = { user: resUser.user, token };
    //       localStorage.setItem("authData", JSON.stringify(authData));
    //       localStorage.removeItem("order");
    //       this.authState.next({ isAuth: true, authData });
    //     });
    // }
  }

  removeStorage() {
    if (this.platform.is("cordova")) {
      this.storage.remove("authData");
    } else {
      localStorage.removeItem("authData");
    }
  }

  saveStorage(tipo, token, usuario, uid) {
    const authData = { tipo, token, uid };

    if (this.platform.is("cordova")) {
      this.storage.set("authData", JSON.stringify(authData));
      this.authState.next({ isAuth: true, usuario, token });
    } else {
      localStorage.setItem("authData", JSON.stringify(authData));
      this.authState.next({ isAuth: true, usuario, token });
    }
  }

  updateStorage(token) {
    // return new Promise((resolve, reject) => {
    //   this.getUser(token)
    //     .then((resUser: any) => {
    //       this.saveStorage(token, resUser.user);
    //       resolve();
    //     });
    // });
  }

  loadStorage() {
    if (this.platform.is('cordova')) {
      this.storage.get('authData').then(res => {

        if (res) {

          const token = JSON.parse(res).token;
          const uid = JSON.parse(res).uid;
          const tipo = JSON.parse(res).tipo;

          if (tipo == 'usuario') {
            this.getUser(token, uid).then(usuario => {
              this.usuario = usuario;
              this.token = token;
              this.authState.next({ isAuth: true, usuario, token });
            });
          } else {
            this.getEmpresa(token, uid).then(usuario => {
              this.usuario = usuario;
              this.token = token;
              this.authState.next({ isAuth: true, usuario, token });
            });
          }

        } else {
          this.authState.next({ isAuth: false, usuario: null, token: null });
        }
      });
    } else {
      if (localStorage.getItem('authData')) {

        const res = localStorage.getItem('authData');
        const token = JSON.parse(res).token;
        const uid = JSON.parse(res).uid;
        const tipo = JSON.parse(res).tipo;


        if (tipo == 'usuario') {
          this.getUser(token, uid).then(usuario => {
            this.usuario = usuario;
            this.token = token;
            this.authState.next({ isAuth: true, usuario, token });
          });
        } else {
          this.getEmpresa(token, uid).then(usuario => {
            this.usuario = usuario;
            this.token = token;
            this.authState.next({ isAuth: true, usuario, token });
          });
        }

      } else {
        this.authState.next({ isAuth: false, usuario: null, token: null });
      }
    }
  }


  getUser(token, id) {
    const url = `${this.apiURL}/usuarios/usuario-get-one?id=${id}`;
    const headers = new HttpHeaders({
      Authorization: `JWT ${token}`
    });
    return this.http.get(url, { headers }).toPromise();
  }


  getEmpresa(token, id) {
    const url = `${this.apiURL}/usuarios/empresa-get-one?id=${id}`;
    const headers = new HttpHeaders({
      Authorization: `JWT ${token}`
    });
    return this.http.get(url, { headers }).toPromise();
  }


}