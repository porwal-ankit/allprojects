import {LightboxAsset} from './lightbox_asset';

export class Lightbox {
    id: number;
    name: string;
    comment: string;
    creationDate: Date;
    modificationDate: Date;
    assets: LightboxAsset[];
}
