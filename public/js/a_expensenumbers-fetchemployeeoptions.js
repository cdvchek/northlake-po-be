const fe_employeeSelect = document.getElementById('add-expense-number-user');

const fe_fetchEmployees = async () => {
    const response = await fetch(window.location.origin + '/user/all');

    if (response.ok) {
        const data = await response.json();

        for (let i = 0; i < data.length; i++) {
            const employee = data[i];
            
            const newOption = document.createElement('option');
            newOption.value = employee.id;
            newOption.textContent = employee.name;

            fe_employeeSelect.appendChild(newOption);
        }
    }
}

fe_fetchEmployees();