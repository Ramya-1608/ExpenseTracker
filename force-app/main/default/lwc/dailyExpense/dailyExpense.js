import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import saveDailyExpense from '@salesforce/apex/DailyExpenseHandler.saveDailyExpense';
import getDailyExpenses from '@salesforce/apex/DailyExpenseHandler.getDailyExpenses';

export default class DailyExpense extends LightningElement {

    formData = {};
    @track isModalOpen = false;
    @track isSubmitting = false;
    @track expenses = [];

    @wire(getDailyExpenses)
        wiredJobs({ data, error }) {
            if (data) {
                this.expenses = data.map(e => ({ ...e }));
            } else if (error) {
                this.error = error;
                console.error(JSON.stringify(error));
            }
        }
    
    handleChange(event) {
        this.formData[event.target.name] = event.target.value;
        console.log('Date ===>', this.formData.date);
        console.log('Amount ===>', this.formData.amount);
        console.log('Description ===>', this.formData.description);
        console.log('formData ===>', this.formData);
    }

    handleSubmit() {
        if (!this.formData.date) {
            this.toastEvent('Spent Date', 'Please Enter the Spent Date', 'error');
            return;
        }
        if (!this.formData.amount) {
            this.toastEvent('Spent Amount', 'Please Enter the Amount Spent', 'error');
            return;
        }
        if (!this.formData.description) {
            this.toastEvent('Description', 'Please Enter the Description', 'error');
            return;
        }
        if (this.isSubmitting) return;
        this.isSubmitting = true;

        this.createExpense();
    }

    openModal() {
        this.isModalOpen = true;
        document.body.classList.add('no-scroll');
    }

    closeModal() {
        this.isModalOpen = false;
        this.formData = {};
        document.body.classList.remove('no-scroll');
    }

    async createExpense() {
        try {
            await saveDailyExpense({ dailyExpenseRec: this.formData });
            // this.expenses = [...this.expenses, { ...this.formData }];
            this.toastEvent('Submission', 'Expense Submitted Successfully', 'success');
            this.closeModal();
            window.Location.reload();

        } catch (error) {
            console.error('FULL ERROR ===>', JSON.stringify(error));
            this.toastEvent('Error', error?.body?.message || 'Unexpected error', 'error');
            this.isSubmitting = false;
        }
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
}