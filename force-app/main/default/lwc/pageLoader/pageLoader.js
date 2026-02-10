import { LightningElement, api } from 'lwc';
import LoadingAnimation from '@salesforce/resourceUrl/LoadingAnimation';

export default class PageLoader extends LightningElement {
    
    @api isLoadingAn = false;
    LoadingAnimation = LoadingAnimation;

}