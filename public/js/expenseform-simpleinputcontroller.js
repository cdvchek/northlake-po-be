// Governing select (which inputs to show)
const paymentTypeSelect = document.getElementById('payment-select');

// Inputs that need changing
const notMyCardCheckboxDiv = document.getElementById('not-my-card-checkbox-wrapper');
const ccNameDiv = document.getElementById('cc-name-wrapper');
const vendorText = document.getElementById('vendor-text');
const addressDiv = document.getElementById('address-wrapper');

// Checkbox that shows the name of credit card holder input or not
const notMyCardCheckbox = document.getElementById('not-my-card-checkbox');
notMyCardCheckbox.addEventListener('change', (e) => {
    if (e.target.checked) ccNameDiv.style.display = 'flex';
    else ccNameDiv.style.display = 'none';
});

// Based on selected value, show the correct inputs
const showCorrectInputs = (e) => {
    const selectedValue = e.target.value;

    switch (selectedValue) {
        case 'church-credit-card':
            notMyCardCheckboxDiv.style.display = 'flex';
            ccNameDiv.style.display = notMyCardCheckbox.checked ? 'flex' : 'none';            
            vendorText.textContent = 'Vendor';
            addressDiv.style.display = 'none';
            break;
    
        case 'reimbursement':
            notMyCardCheckboxDiv.style.display = 'none';
            ccNameDiv.style.display = 'none';
            vendorText.textContent = 'Payee';
            addressDiv.style.display = 'flex';
            break;

        case 'invoice':
            notMyCardCheckboxDiv.style.display = 'none';
            ccNameDiv.style.display = 'none';
            vendorText.textContent = 'Vendor';
            addressDiv.style.display = 'none';
            break;
    }
}

paymentTypeSelect.addEventListener('change', showCorrectInputs);
