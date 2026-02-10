import { LightningElement, api } from 'lwc';
import LoadingAnimation from '@salesforce/resourceUrl/LoadingAnimation';

export default class PageLoaderGif extends LightningElement {

    @api isLoadingAnimation = false;
    LoadingAnimation = LoadingAnimation;
}