import {Supplier} from 'app/models/supplier';
import {Collection} from 'app/models/collection';
import {ContentLocation} from 'app/models/content_location';
import {AssociatedMedia} from 'app/models/associated_media';
import {Category} from './category';

export class Asset {
    id: number;
    fileFormat: string;
    supplier: Supplier;
    originalType: string;
    alternateName: string;
    width: number;
    height: number;
    collection: Collection;
    onlyEditorialUsage: boolean;
    uploadDate: Date;
    activationTime: Date;
    name: string;
    dateModified: Date;
    color: boolean;
    orientation: string;
    exclusivePrice: number;
    photographerCode: string;
    copyright: string;
    license: string;
    specificSupplierProvisionPercentageState: string;
    specificSupplierProvisionPercentage: string;
    modelReleased: number;
    propertyReleased: number;
    aggregateRating: number;
    categories: Category[];
    byline: string;
    bylineTitle: string;
    contentLocation: ContentLocation[];
    transmissionreference: string;
    copyrightHolder: string;
    caption: string;
    keywords: string[];
    dateCreated: Date;
    objectName: string;
    headline: string;
    source: string;
    creditLine: string;
    associatedMedia: AssociatedMedia[];
    optionalFilesize: number;
}
