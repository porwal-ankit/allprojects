import { Injectable } from '@angular/core';
import {SupplierService} from './supplier.service';
import {Supplier} from './models/supplier';

@Injectable()
export class SupplierDataService {

  private suppliers: Promise<Supplier[]> = null;

  constructor(
      private supplierService: SupplierService
  ) { }

  public getSuppliers(): Promise<Supplier[]> {
      if ( this.suppliers === null ) {
          this.suppliers = this.supplierService.getSuppliers();
      }

      return this.suppliers;
  }
}
