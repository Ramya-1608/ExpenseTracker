import { LightningElement, track } from 'lwc';
import BackgroundImgs from '@salesforce/resourceUrl/BackgroundImgs';
import userLogin from '@salesforce/apex/ExpenseTracker.userLogin';
import registerUser from '@salesforce/apex/ExpenseTracker.registerUser';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class LoginPage extends LightningElement {

    @track login = true;
    @track register = false;
    @track successPage = false;
    userId;
    fullName;
    mobile;
    email;
    
    phone = BackgroundImgs + '/Images/Phone.jpg';
    web = BackgroundImgs + '/Images/Web.jpg';

    handleChange(event) {
        const { name, value } = event.target;
        this[name] = value;
        console.log('name: ' + name + ' value: ' + value);
    }

    showRegister(){
        this.login = false;
        this.register = true;
    }
    
    showLogin(){
        this.login = true;
        this.register = false;
    }

    handleLogin(){
        const normalizedMob = this.normalizeMobile(this.mobile);
        if (!normalizedMob || !/^[0-9]{10}$/.test(normalizedMob)) {
            this.toastEvent('Mobile Number', 'Enter valid mobile number.', 'error');
            return;
        }
        this.mobile = normalizedMob;

        userLogin({mobile: this.mobile})
        .then(result => {
            console.log('RESULT : ' + result);
            this.userId = result;
            console.log('USERID : ' + this.userId);
            if(this.userId){
                this.successPage = true;
                this.login = false;
                this.register = false;
                this.toastEvent('Success', 'Your Account has been found successfully.', 'success');
            }
            else {
                this.successPage = false;
                this.login = true;
                this.register = false;
                this.toastEvent('Error', 'Account not found, Please Register to Continue', 'error');
            }
        })
        .catch(error => {
            console.log('ERROR :',JSON.stringify(error));
        });

    }

    normalizeMobile(input) {
        if (!input) return null;
        let cleaned = input.replace(/[^0-9]/g, '');
        if (cleaned.length >= 10) {
            cleaned = cleaned.slice(-10);
        }
        return cleaned;
    }


    validate(){
        if(!this.fullName){
            this.toastEvent('Full Name', 'Please enter Full Name.', 'error');
            return;
        }

        const normalizedMobile = this.normalizeMobile(this.mobile);
        if (!normalizedMobile || !/^[0-9]{10}$/.test(normalizedMobile)) {
            this.toastEvent('Mobile Number', 'Enter valid mobile number.', 'error');
            return;
        }
        this.mobile = normalizedMobile;
        
        if(!this.email){
            this.toastEvent('Email', 'Please enter Email.', 'error');
            return;
        }
        return true;
    }

    handleRegister(){
        console.log('REGISTER');
        if(!this.validate()){
            return;
        }
        if(this.fullName && this.mobile && this.email ){
            registerUser({fullName: this.fullName, mobile: this.mobile, email: this.email })
            .then(result => {
                console.log('RESULT: ' + result);
                    this.successPage = false;
                    this.login = true;
                    this.register = false;
                    this.toastEvent('Success', 'Your Account has been created successfully.', 'success');
            })
            .catch(error => {
                console.log('ERROR: ', JSON.stringify(error));
            });
        }
        
    }

    toastEvent(title, message, variant){
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: 'dismissable'
        });
        this.dispatchEvent(evt);
    }

    handleBack(){
        this.successPage = false;
        this.login = true;
        this.register = false;
    }


}