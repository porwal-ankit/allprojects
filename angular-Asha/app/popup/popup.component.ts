import {
    AfterContentInit, AfterViewInit, Component, EventEmitter, HostListener, Input, OnInit,
    Output
} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css']
})
export class PopupComponent implements AfterContentInit{

  private initTime: number = null;

  @Output() close = new EventEmitter<boolean>();
  @Input() width: any = 'auto';
  @Input() height: any = 'auto';


  @HostListener('window:keyup', ['$event']) windowKeyUp(event) {
      if ( event.code === 'Escape') {
          this.closePopup();
      }
  }

  @HostListener('window:click', ['$event']) windowClick(event) {
      if( !this.initTime || Date.now() - this.initTime < 500 ) {
        return;
      }

      let obj = event.target;
      while( obj ) {
          if(obj.id == 'popup_window') {
              return;
          }

          obj = obj.parentNode ? obj.parentNode : null;
      }

      this.closePopup();
  }

  constructor(
      private router: Router
  ) {}

  ngAfterContentInit() {
      this.initTime = Date.now();
  }


  closePopup() {
      this.close.emit(true);

      this.router.navigate([{outlets: {modal: null}}], {queryParamsHandling: 'merge'});
  }

}
