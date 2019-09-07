import {WebseriesAsset} from './webseries-asset';

export class Webseries {
    id: number;
    parentId: number;
    title: string;
    description: string;
    assets: WebseriesAsset[];
    coverUrl: string;
}
