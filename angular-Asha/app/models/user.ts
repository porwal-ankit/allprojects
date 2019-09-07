
import {UserAddress} from './user-address';

export class User {
    public id: number;
    public email: string;
    public password: string;
    public familyName: string;
    public givenName: string;
    public gender: string;
    public jobTitle: string;
    public company: string;
    public address: UserAddress[];
    public url: string;
    public language: string;
    public currency: string;
    public newsletterSubscribed: string;
    public taxNumber: string;
}
