import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CalculatorService} from '../calculator.service';
import {FormControl, FormGroup} from '@angular/forms';
import {DomSanitizer} from '@angular/platform-browser';
import {CartDataService} from '../cart-data.service';
import {Article} from 'app/models/article';
import {Asset} from '../models/asset';

@Component({
  selector: 'app-asset-calculator',
  templateUrl: './asset-calculator.component.html',
  styleUrls: ['./asset-calculator.component.css']
})
export class AssetCalculatorComponent implements OnInit {

  @Input('asset')
  set setAsset(value: Asset) {
    if( !value || value == this.asset ) {
        return;
    }

    this.asset = value;
    this.loadCalculator();
  }
  public asset: Asset;

  @Input('article')
  set setArticle(value: Article) {
      if( !value || value == this.article ) {
          return;
      }

      this.article = value;

      if( this.article && this.article.asset && this.article.asset.id ) {
          this.asset = this.article.asset;
      }

      this.loadCalculator();
  }
  public article: Article;

  @Output() close = new EventEmitter<any>();

  public form: any = {};

  public pricelists: any = [];
  public pricelistsById: any = {};

  private ignoreValueChanges: boolean = false;

  public selectedPricelistId: number = null;

  private preSelectedSizeIdList = [134,144,154,159,179,249];

  constructor(
      private calculator: CalculatorService,
      private cartDataService: CartDataService,
      public sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {

  }

  private getAssetId() {
      if( this.asset ) {
          return String( this.asset.id );
      } else if( this.article && this.article.assetId ) {
          return String( this.article.assetId );
      } else if( this.article && this.article.asset && this.article.asset.id ) {
          return String( this.article.asset.id );
      }

      return null;
  }

  private loadCalculator() {
    this.calculator.getCalculator( this.getAssetId() ).then( pricelists => {
        this.setCalculator( pricelists );

        if( this.article && this.article.calculatorArguments && this.article.calculatorArguments['calculatorId'] == this.getAssetId() && this.article.calculatorArguments['pricelistId'] > 0 ) {
            let pricelistId = this.article.calculatorArguments['pricelistId'];

            let loadCalculatorData = Object.assign( {}, this.article.calculatorArguments );
            delete loadCalculatorData['calculatorId'];
            delete loadCalculatorData['pricelistId'];

            this.loadPricelist( pricelistId, loadCalculatorData );
        }
    } );
  }

  private loadPricelist( pricelistId?: number, calculatorArguments ?: any) {
      this.calculator.getPricelist( this.getAssetId(), pricelistId, calculatorArguments )
          .then( pricelist => {
              this.selectedPricelistId = pricelistId;

              if( this.pricelistsById[ pricelistId ] && this.pricelistsById[ pricelistId ].license != 'rf' ) {
                  this.form['custom'].patchValue({
                      custom: 'custom',
                      selectedCalculator: pricelistId
                  }, {emitEvent: false});
              }

              this.setPricelist( pricelist, calculatorArguments );
          } );
  }

  private setCalculator( pricelists ): void {

    this.pricelists = [];
    this.pricelistsById = {};

    this.form = {};

    this.selectedPricelistId = null;

    this.form['custom'] = new FormGroup({
        'custom': new FormControl(''),
        'selectedCalculator': new FormControl('')
    });

    this.form['custom'].valueChanges.subscribe(data => {
        if(this.ignoreValueChanges) {
            return;
        }

        let nonRfPricelists = this.getPricelistsByLicense('rf', true);
        this.selectedPricelistId = nonRfPricelists.length > 1 ? data.selectedCalculator : nonRfPricelists[0].id;

        this.resetAllFormsExcept('custom');
    });

      for ( let pricelist of pricelists ) {
          this.setPricelist( pricelist );
      }
  }

  setPricelist( pricelist, calculatorArguments?: {} ) {
      if( !calculatorArguments ) {
          calculatorArguments = this.form[ pricelist.id ] ? this.form[ pricelist.id ].getRawValue() : {};
      }


      // Create Form Group
      if( !this.form[ pricelist.id ] ) {
          this.form[ pricelist.id ] = new FormGroup({});
          this.addPricelistFormListener(this.form[ pricelist.id ], pricelist.id);
      }

      let group: FormGroup = this.form[ pricelist.id ];


      // Create Form Controls
      this.ignoreValueChanges = true;
      let patchDefaultSize = '';
      let otherThanRf = this.isLicenseAvailableOtherThan('rf');
      for ( let option of pricelist.options ) {
          if( !group.contains(option.key) ) {
              if ( option.key == 'size' ) {
                  let priceIdList = [];
                  for( let price of option.values ) {
                      priceIdList.push(price.id);
                  }

                  for( let sizeId of this.preSelectedSizeIdList ) {
                      if (priceIdList.indexOf(sizeId) >= 0) {
                          patchDefaultSize = sizeId.toString();
                          break;
                      }
                  }
              }

              group.addControl( option.key, new FormControl() );
          }
      }
      this.ignoreValueChanges = false;


      // Set Form Values
      let tmpPatch = {};
      let currentValues = group.getRawValue();
      for ( let option of pricelist.options ) {
          let val = (calculatorArguments && calculatorArguments[option.key]) ? calculatorArguments[option.key] : null;

          if( currentValues[ option.key ] != val ) {
              tmpPatch[ option.key ] = val;
          }
      }

      if( tmpPatch ) {
          group.patchValue(tmpPatch, {emitEvent: false});
      }


      // Set pricelist
      this.pricelistsById[ pricelist.id ] = pricelist;

      let key = this.pricelists.findIndex( (element) => element.id == pricelist.id);
      if( key > -1 ) {
          this.pricelists[key] = pricelist;
      } else {
          this.pricelists.push( pricelist );
      }

      if( patchDefaultSize != '' ) {
          group.patchValue({'size': patchDefaultSize}, {emitEvent: true});
      }

  }

  addPricelistFormListener(formGroup: FormGroup, pricelistId: number) {
      formGroup.valueChanges
          .distinctUntilChanged()
          .subscribe(data => {
              if(this.ignoreValueChanges) {
                  return;
              }

              this.resetAllFormsExcept(pricelistId);


              this.loadPricelist(pricelistId, this.getPricelistOptions( pricelistId ) );
          }
      );
  }

  getPricelistOptions(pricelistId) {
      let options = {};

      if( !this.form[ pricelistId ] || !this.pricelistsById[ pricelistId ] ) {
          return options;
      }

      let data = this.form[ pricelistId ].getRawValue();
      for ( let key in data ) {
          if( !data[ key ] ) {
              continue;
          }

          options[ key ] = data[ key ];

          if ( options[ key ] === true ) {
              for ( let option of this.pricelistsById[ pricelistId ].options ) {
                  if ( option.key !== key ) {
                      continue;
                  }

                  options[ key ] = option.id;
              }
          }
      }

      return options;
  }

  resetAllFormsExcept(pricelistId) {
      this.ignoreValueChanges = true;

      let resetCustom = (this.pricelistsById[ pricelistId ] && this.pricelistsById[ pricelistId ].license == 'rf');

      for ( let tmpPricelistId in this.form ) {
          if( tmpPricelistId == pricelistId || (!resetCustom && tmpPricelistId == 'custom') ) {
              continue;
          }

          if( !this.form[ tmpPricelistId ] ) {
              continue;
          }

          this.form[ tmpPricelistId ].reset();
      }

      this.ignoreValueChanges = false;
  }

  calculateSize( size ) {
    let width = 0;
    let height = 0;

    if ( size.extra.sideLength > 0 ) {
      if ( this.asset.width > this.asset.height) {
        let factor = this.asset.height / this.asset.width;
        width = size.extra.sideLength;
        height = Math.round(factor * width);

      } else {
        let factor = this.asset.width / this.asset.height;
        height = size.extra.sideLength;
        width = Math.round(factor * height);
      }

    } else if ( size.extra.megaPixel > 0 ) {
      width = Math.round( Math.sqrt( size.extra.megaPixel * this.asset.width / this.asset.height) * 1024);
      height = Math.round( Math.sqrt( size.extra.megaPixel * this.asset.height / this.asset.width) * 1024);

    } else {
      width = this.asset.width;
      height = this.asset.height;
    }

    return {
      width: width,
      height: height
    };

  }

  isSizeSmaller( size ): boolean {
    let imgSize = this.calculateSize( size );
    if ( !imgSize ) {
      return true;
    }

    return (this.asset.width >= imgSize.width && this.asset.height >= imgSize.height);
  }

  calculateRawFileSize( size ): string {
    let imgSize = this.calculateSize( size );
    if ( !imgSize ) {
      return null;
    }

    let rawSize = imgSize.width * imgSize.height * 3;

    if ( rawSize < 1024 ) {
      return rawSize + ' B';
    } else if ( rawSize < 1024 * 1024 ) {
      return Math.round(rawSize / 1024) + ' KB';
    } else {
      return Math.round(rawSize / 1024 / 1024) + ' MB';
    }
  }

  calculateMegapixel( size ): string {
    let imgSize = this.calculateSize( size );
    if ( !imgSize ) {
      return null;
    }

    return (Math.round((imgSize.width * imgSize.height) / (1024 * 1024) * 10) / 10) + ' MP';
  }

  calculatePrintSize( size ): string {
    // 9.83" x 3.00" @ 72 DPI
    let imgSize = this.calculateSize( size );
    if ( !imgSize ) {
      return null;
    }

    return (Math.round(imgSize.width / size.extra.dpi * 100) / 100) + '" x ' + (Math.round(imgSize.height / size.extra.dpi * 100) / 100) + '" @ ' + size.extra.dpi + ' DPI';
  }

  getOptionDescriptionText( formGroupId, controlId, selectedOption ): string {
      let selectedId = this.form[ formGroupId ].controls[ controlId ].value;

      for ( let option of this.pricelistsById[ formGroupId ].options[ selectedOption ].values ) {
        if( option.id == selectedId ) {
          return option.description ? option.description : '';
        }
      }

      return '';
  }

    getPricelistDescriptionText( pricelistId ): string {
      if ( !(pricelistId > 0) ) {
          return '';
      }

      return this.pricelistsById[ pricelistId ].description;
    }



  isLicensePricelistAvailable(license): boolean {
    for ( let pricelist of this.pricelists ) {
      if ( pricelist.license == license ) {
        return true;
      }
    }

    return false;
  }

    isLicenseAvailableOtherThan(license): boolean {
        for ( let pricelist of this.pricelists ) {
            if ( pricelist.license != license ) {
                return true;
            }
        }

        return false;
    }

    getPricelistsByLicense(license, negate: boolean = false): any[] {
        let pricelists = [];

        for ( let pricelist of this.pricelists ) {
          if( (pricelist.license == license) != negate ) {
              pricelists.push( pricelist );
          }
        }

        return pricelists;
    }

    isPriceSelected( pricelistId, key, value ) {
        return (this.form[ pricelistId ] && this.form[ pricelistId ].getRawValue()[ key ] == value );
    }

    addToCart(event) {
        event.stopPropagation();

        if( !(this.selectedPricelistId > 0) ) {
            return;
        }

        let calculatorArguments = {
            pricelistId: this.selectedPricelistId,
            ...this.getPricelistOptions( this.selectedPricelistId )
        };


        if( this.article ) {
            let article = Object.assign({}, this.article);
            article.calculatorArguments = calculatorArguments;

            this.cartDataService.updateArticle(article).then( () => {
                this.closeCalculator();
            });
        } else {
            this.cartDataService.addArticle(this.getAssetId(), calculatorArguments);
        }

    }

    showRestrictedMessage(event) {
        event.stopPropagation();

        alert("We’re sorry, this image has usage restrictions. To license this image, please contact us at 800-543-5250 or sales@panoramicimages.com .");
    }

    closeCalculator() {
        this.close.emit({
            id: this.getAssetId()
        });
    }

    isRestricted() {
        if( !this.asset.categories.length ) {
            return false;
        }

        for( let category of this.asset.categories ) {
            if( category.id == 1 ) {
                return true;
            }
        }

        return false;
    }

}
