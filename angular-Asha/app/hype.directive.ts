import {AfterViewInit, Directive, ElementRef, Input, OnDestroy, Renderer2} from '@angular/core';

@Directive({
  selector: '[hypeAnimation]'
})
export class HypeDirective implements AfterViewInit, OnDestroy {

  @Input('hypeAnimation') jsSrc: string;

  constructor(
      private elementRef: ElementRef,
      private renderer: Renderer2
  ) {}

  ngAfterViewInit() {
    let s = this.renderer.createElement('script');
    this.renderer.setProperty(s, 'type', 'text/javascript');
      this.renderer.setProperty(s, 'src', this.jsSrc);

    this.renderer.appendChild(this.elementRef.nativeElement, s);
  }

    ngOnDestroy(): void {
//        console.log('DESTROY HYPE');
    }




}
