import { LightningElement, wire, track } from 'lwc';
import shareRecipe from '@salesforce/apex/RecipeHubController.shareRecipe';
import reportRecipe from '@salesforce/apex/RecipeHubController.reportRecipe';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import getRecipeDetail from '@salesforce/apex/RecipeRequestController.getRecipeDetail';
import { CurrentPageReference } from 'lightning/navigation';
export default class TestComp extends LightningElement {
    showShareModal = false;

    get recipeUrl() {
        return window.location.href;
    }
    openShareModal() {
        this.showShareModal = true;
    }

    closeShareModal() {
        this.showShareModal = false;
    }
    shareWhatsApp() {
        const url = `https://wa.me/?text=${encodeURIComponent(this.recipeUrl)}`;
        window.open(url, '_blank');
        this.afterShare();
    }
    shareFacebook() {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.recipeUrl)}`;
        window.open(url, '_blank');
        this.afterShare();
    }
    shareEmail() {
        const subject = 'Check out this recipe!';
        const body = `I found this amazing recipe:\n${this.recipeUrl}`;
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        this.afterShare();
    }
    copyLink() {
        navigator.clipboard.writeText(this.recipeUrl);
        this.afterShare();

        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Copied!',
                message: 'Recipe link copied to clipboard',
                variant: 'success'
            })
        );
    }
    afterShare() {
        shareRecipe({ recipeId: this.recipeId })
            .then(() => {
                this.showShareModal = false;
                return refreshApex(this.wiredRecipeResult);
            })
            .catch(error => {
                console.error(error);
            });
    }

    recipeId;
    recipes = [];
    wiredRecipeResult;
    @wire(CurrentPageReference)
    getStateParameters(ref) {
        if (ref?.state?.c__recipeId) {
            this.recipeId = ref.state.c__recipeId;
        }
    }
    @track likeState = false;
    totalShares;
    @wire(getRecipeDetail, { recipeId: '$recipeId' })
    wiredRecipe(result) {
        this.wiredRecipeResult = result;
    
        if (result.data) {
            this.recipes = result.data;
            this.totalShares = result.data[0].Total_Shares__c;
            }
            if (result.error) {
                console.error(result.error);
        }
    }
    handleReport() {
        reportRecipe({ recipeId: this.recipeId })
            .then(() => {
                // this.dispatchEvent(
                //     new ShowToastEvent({
                //         title: 'Reported',
                //         message: 'Thank you for reporting this recipe.',
                //         variant: 'warning'
                //     })
                // );
                alert('Thank you for reporting this recipe.');
                return refreshApex(this.wiredRecipeResult);
            })
            .catch(error => {
                console.error(error);
            });
    }

}