
import {Asset} from './asset';

export class Article {
    id: number;
    assetId: string;
    articleName: string;
    asset: Asset;
    price: number;
    currency: string;
    calculatorArguments?: object;
    dpiSize?: number;
    maxSize?: number;
    maxSizeType?: string;
    info: string;
    expirationDate: Date;
    appliedPricelist: string;
}
