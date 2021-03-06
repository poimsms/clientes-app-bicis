import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { map, take, switchMap, filter } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FireService {

  rider_query$: Subject<any>;
  rider$: Observable<any>;

  constructor(private db: AngularFirestore) {

    this.rider$ = this.rider_query$.pipe(
      switchMap(id => {
        return this.db.collection('riders', ref => ref.where('rider', '==', id)).valueChanges()
      })
    );

  }

  getRiderCoors(id) {
    return this.db.collection('riders_coors', ref =>
      ref.where('rider', '==', id)).valueChanges();
  }

  updateRider(id, newData) {
    this.db.doc('riders/' + id).update(newData);
    this.db.doc('riders_coors/' + id).update(newData);
  }

  getRiderMasCercano(vehiculo, lat, lng) {
    return new Promise((resolve, reject) => {
      this.db.collection('riders_coors', ref =>
        ref.where('isOnline', '==', true).where('isAccountActive', '==', true).where('isPay', '==', false).where('actividad', '==', 'disponible').where('vehiculo', '==', vehiculo))
        .valueChanges().pipe(take(1)).subscribe((riders: any) => {

          if (riders.lenght > 0) {

            const ridersOrdenados = this.ordenarRiders(riders, lat, lng);

            resolve({ hayRiders: false, riders: ridersOrdenados });

          } else {
            resolve({ hayRiders: false });
          }

        });
    });
  }

  ordenarRiders(riders, lat, lng) {
    const distanceMatrix = [];

    riders.forEach(rider => {
      const distance = Math.sqrt((rider.lat - lat) * (rider.lat - lat) + (rider.lng - lng) * (rider.lng - lng));
      distanceMatrix.push({
        distance,
        id: rider
      });
    });

    const ridersOrdenados = [];

    riders.forEach(rider => {

      if (distanceMatrix.length != 0) {
        let a = 0;
        let b = distanceMatrix[0].distance;
        let id = distanceMatrix[0].id;

        distanceMatrix.forEach(data => {
          a = data.distance;
          if (a < b) {
            b = a;
            id = data.id;
          }
        });

        const i = riders.indexOf(id);
        distanceMatrix.splice(i, 1);
        ridersOrdenados.push(id);
      }

    });

    return ridersOrdenados;
  }

}
