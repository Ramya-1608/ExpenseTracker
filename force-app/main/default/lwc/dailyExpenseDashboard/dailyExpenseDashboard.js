import { LightningElement, wire, track } from 'lwc';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import BackgroundImgs from '@salesforce/resourceUrl/BackgroundImgs';
import getSalary from '@salesforce/apex/DailyExpenseHandler.getSalary';
import getDailyExpenses from '@salesforce/apex/DailyExpenseHandler.getDailyExpenses';
import saveDailyExpense from '@salesforce/apex/DailyExpenseHandler.saveDailyExpense';
import saveAddOnsToSalary from '@salesforce/apex/DailyExpenseHandler.saveAddOnsToSalary';
const columns = [
    { label: 'Spent Number', fieldName: 'Name' },
    { label: 'Spent Date', fieldName: 'Spent_Date__c' },
    { label: 'Spent On', fieldName: 'Spent_On__c' },
    { label: 'Spent Amount', fieldName: 'Spent_Amount__c' }
];

export default class DailyExpenseDashboard extends NavigationMixin(LightningElement) {

    phone = BackgroundImgs + '/Images/Phone.jpg';
    web = BackgroundImgs + '/Images/Web.jpg';
    columns = columns;
    expenses = [];
    userId;
    @track isModalOpen = false;
    date;
    amount;
    description;


    @wire(CurrentPageReference)
    getState(ref) {
        if (ref?.state?.c__userId) {
            this.userId = ref.state.c__userId;
            this.loadExpenses();
            this.getSalaryDailyExpenses();
        }
    }

    loadExpenses() {
        console.log('USER ID ===>> ', this.userId);
        getDailyExpenses({ userId: this.userId })//this.userId
            .then(res => {
                this.expenses = res;
                console.log(JSON.stringify(res));
            })
            .catch(err => {
                console.error(err);
            });
    }
    remianingSalary;
    getSalaryDailyExpenses() {
        getSalary({ userId: this.userId })
            .then(data => {
                this.remianingSalary = data[0].Salary__c; //Salary__c
                console.log('Data ===>> ', data);
                console.log("remianingSalary: " + this.remianingSalary);

                console.log('Salary', 'Salary Fetched Successfully', 'success');
            })
            .catch(err => {
                console.error(err);
            });
    }

    handleChange(event) {
        const { name, value } = event.target;
        this[name] = value;
        console.log('name: ' + name + ' value: ' + value);
    }

    handleSubmit() {
        if (!this.date) {
            this.toastEvent('Spent Date', 'Please Enter the Spent Date', 'error');
            return;
        }
        if (!this.amount) {
            this.toastEvent('Spent Amount', 'Please Enter the Amount Spent', 'error');
            return;
        }
        if (!this.description) {
            this.toastEvent('Spent On Items', 'Please Enter the Items', 'error');
            return;
        }

        saveDailyExpense({
            spentDate: this.date,
            amount: this.amount,
            description: this.description,
            userId: this.userId
        })
            .then(result => {
                console.log('RESULT ===>> ', result);
                this.toastEvent('Submission', 'Expense Submitted Successfully', 'success');
                this.closeModal();
                window.location.reload();
            })
            .catch(error => {
                console.error(error);
                console.error('FULL ERROR ===>', JSON.stringify(error));
            });
    }

    handleAddExpense() {
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
    }

    toastEvent(title, message, variant) {
        const toastEvent = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: 'dismissable'
        });
        this.dispatchEvent(toastEvent);
    }

    handleLogout() {
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: { name: 'Home' }
        });
    }
    //---------------------Addon-----------------------c/dailyExpense 
    addonValue;

    handleAddonChange(event) {
        this.addonValue = event.target.value;
        console.log('ADD ON VALUE ===>> ', this.addonValue);
    }

    // handleAddonKeyDown(event) {
    //     if (event.key === 'Enter') {
    //         this.handleAddonSave();
    //     }
    // }

    // get addonIconClass() {
    //     return this.addonValue && this.addonValue.trim() !== ''
    //         ? 'addonIcon enabled'
    //         : 'addonIcon disabled';
    // }

    handleAddonSave() {
        if (!this.addonValue) {
            this.toastEvent('Error', 'Add On is Empty', 'error');
            return false;
        }
        saveAddOnsToSalary({ amount: this.addonValue, userId: this.userId })
            .then(result => {
                console.log('RESULT ===>> ', result);
                this.toastEvent('Updated', 'Add On Amount Added to Salary Successfully', 'success');
            })
            .catch(error => {
                console.error(error);
                console.error('FULL ERROR ===>', JSON.stringify(error));
            });

        // 👉 SAVE LOGIC HERE (Apex / local state)
        console.log('Addon saved:', this.addonValue);

        // reset input
        // this.addonValue = '';
    }

}