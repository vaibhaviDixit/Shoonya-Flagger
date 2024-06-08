document.addEventListener('DOMContentLoaded', () => {
    const saveButton = document.getElementById('saveButton');
    const closeButton = document.getElementById('closeButton');

    // Load saved role
    chrome.storage.sync.get(['role'], (result) => {
        const selectedRole = result.role;
        if (selectedRole) {
            const radio = document.querySelector(`input[name="role"][value="${selectedRole}"]`);
            if (radio) {
                radio.checked = true;
            }
        }
    });

    // Save the selected role and close the popup
    saveButton.addEventListener('click', () => {
        const selectedRole = document.querySelector('input[name="role"]:checked').value;
        chrome.storage.sync.set({ role: selectedRole }, () => {
            alert('Role saved successfully.');
            window.close(); // Close the popup after saving
        });
    });

    // Close the popup when close button is clicked
    closeButton.addEventListener('click', () => {
        window.close();
    });
});
