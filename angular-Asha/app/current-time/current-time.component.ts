import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-current-time',
  templateUrl: './current-time.component.html',
  styleUrls: ['./current-time.component.css']
})
export class CurrentTimeComponent implements OnInit {

    private tzones = {
        N:['Newfoundland', -210],
        A:['Atlantic', -240],
        E:['Eastern', -300],
        C:['Central', -360],
        M:['Mountain', -420],
        P:['Pacific', -480],
        AK:['Alaska', -540],
        HA_:['Hawaii-Aleutian (Aleutian)', -600],
        HA:['Hawaii-Aleutian (Hawaii)', -600, -600]
    };

    public centralTimer: Observable<string> = Observable.from('Central Time');

  constructor() { }

  ngOnInit() {
      if (typeof window !== 'undefined' && window) { // detect if this app runs on the server on in the browser
          this.centralTimer = Observable.interval(1000)
              .map(
                  () => this.toTZString('', 'C')
              );
      }
  }

    dstOff(d, tz){
        let off= tz[1], doff= tz[2],
            countstart, countend, dstart, dend,
            y= d.getUTCFullYear();
        if(y>2006 && off!== doff){
            countstart= 8, countend= 1,
                dstart= new Date(Date.UTC(y, 2, 8, 2)),
                dend= new Date(Date.UTC(y, 10, 1, 2));
            while(dstart.getUTCDay()!== 0){
                dstart.setUTCDate(++countstart);
            }
            while(dend.getUTCDay()!== 0){
                dend.setUTCDate(++countend);
            }
            dstart.setUTCMinutes(off);
            dend.setUTCMinutes(off);
            if(dstart<= d && dend>= d) off= doff;
        }
        return off;
    }

    toTZString(d, tzp): string {
        d= d? new Date(d):new Date();
        tzp= tzp || 'G';
        let h, m, s, pm= 'PM', off, dst, str,
            label= tzp+'ST',
            tz= this.tzones[tzp.toUpperCase()];
        if(!tz) tz= ['Greenwich', 0, 0];
        off= tz[1];
        if(off){
            if(tz[2]== undefined) tz[2]= tz[1]+60;
            dst= this.dstOff(d, tz);
            if(dst!== off) label= tzp+'DT';
            d.setUTCMinutes(d.getUTCMinutes()+dst);
        }
        else label= 'GMT';
        h= d.getUTCHours();
        m= d.getUTCMinutes();
        if(h>12) h-= 12;
        else if(h!== 12) pm= 'AM';
        if(h== 0) h= 12;
        if(m<10) m= '0'+m;
        str= ''; /* hacked down to exclude date */
        return str+ h+':'+m+' '+pm+' '+label.replace('_', '').toUpperCase();
    }

}
