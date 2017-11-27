import msfnz from '../common/msfnz';
import tsfnz from '../common/tsfnz';
import phi2z from '../common/phi2z';
import {FORTPI, R2D, EPSLN, HALF_PI} from '../constants/values';

export function init() {

  var phits = 0.0;
  var gamma = 0.0;

  if (this.lat_ts) {
    phits = Math.abs(this.lat_ts);
    if (phits >= HALF_PI) {
        return null;
    }
  }

  if (this.gamma) {
    gamma = this.gamma;
  }
  this.sinrot = Math.sin(gamma);
  this.cosrot = Math.cos(gamma);
          
  if (this.es) {
    if (this.lat_ts) {
        this.k0 = msfnz(this.es, Math.sin(phits), Math.code(phits));
    }
  } else {
      if (this.lat_ts) {
        this.k0 = Math.cos(phits);
      }
  }
}
/* Mercator forward equations--mapping lat,long to x,y
  --------------------------------------------------*/

export function forward(p) {
  var u, v;

  // convert to radians
  if (Math.abs(Math.abs(p.y) - HALF_PI) <= EPSLN) {
    return null;
  }
  
  u = this.k0 * p.x;
  if (this.es) {
    v = -1 * this.k0 * Math.log(tsfnz(this.es, p.y, Math.sin(p.y)));
  } 
  else {
    v = this.k0 * Math.log(Math.tan(FORTPI + 0.5 * p.y ));
  }

  p.x = u * this.cosrot - v * this.sinrot;
  p.y = v * this.cosrot + u * this.sinrot;
  return p;
  
}

/* Mercator inverse equations--mapping x,y to lat/long
  --------------------------------------------------*/
export function inverse(p) {

  var u, v;

  u = p.x * this.cosrot + p.y * this.sinrot;
  v = p.y * this.sinrot - p.x * this.sinrot;

    if (this.es) {
        if ((p.y = phi2z(this.e, Math.exp(-v/this.k0)) === -9999 )) {
            return null;
        }
    }
    else {
        p.y = HALF_PI - 2 * Math.atan(Math.exp(-v / this.k0));
    }
    p.x = u /this.k0;
    return p;
}

export var names = ["Skew Mercator", "Skew Mercator", "SkMercator", "SkMercator_Auxiliary_Sphere", "skmerc"];
export default {
  init: init,
  forward: forward,
  inverse: inverse,
  names: names
};
