const db_deletebutton = document.getElementById('delete-btn');
let db_deletionStarted = false;
let db_deletionTimeout;

const db_paramsString = window.location.href.split('_')[1];
const db_paramsArr = db_paramsString.split('&');
const db_id = db_paramsArr[0].split('=')[1];
const db_sessionStart = db_paramsArr[2].split('=')[1];


const db_resetDeleteBtn = () => {
    db_deletionStarted = false; // Reset the deletion flag
    db_deletebutton.textContent = "Delete"; // Reset the button text
    clearTimeout(db_deletionTimeout); // Clear the timeout if still active
};

const db_deleteExpense = async () => {
    if (!db_deletionStarted) {
        // First press: Start the confirmation process
        db_deletionStarted = true;
        db_deletebutton.textContent = "Press again to delete";

        // Start a 3-second timer to reset the button
        db_deletionTimeout = setTimeout(db_resetDeleteBtn, 3000);
    } else {
        // Second press within 3 seconds: Confirm deletion
        db_resetDeleteBtn(); // Reset the button and state immediately
        try {
            const response = await fetch(window.location.origin + '/expenses/' + db_id, { method: 'DELETE' });
            if (response.ok) {
                console.log("Expense deleted successfully.");
                // Add any post-deletion logic here, e.g., updating the UI
                window.location.href = window.location.origin + '/web/admin-expenses_count=' + bb_sessionStart;
            } else {
                console.error("Failed to delete expense.");
                alert("An error occurred while deleting the expense.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while deleting the expense.");
        }
    }
};

// Attach the event listener to the delete button
db_deletebutton.addEventListener('click', db_deleteExpense);
