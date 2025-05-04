<<<<<<< HEAD
document.addEventListener('DOMContentLoaded', () => {
    const editBtn = document.getElementById('editBtn');
    const saveBtn = document.getElementById('saveBtn');
    const cameraBtn = document.getElementById('cameraBtn');
    const fileInput = document.getElementById('fileInput');
    const profileImg = document.getElementById('profileImg');
    const imageModal = document.getElementById('imageModal');
    const uploadBtn = document.getElementById('uploadBtn');
    const captureBtn = document.getElementById('captureBtn');
    const cameraContainer = document.getElementById('cameraContainer');
    const cameraPreview = document.getElementById('cameraPreview');
    const snapBtn = document.getElementById('snapBtn');
    const retakeBtn = document.getElementById('retakeBtn');
    let stream = null;
    
    // Elements that can be edited
    const editableElements = document.querySelectorAll('[contenteditable]');
    const textareas = document.querySelectorAll('textarea');
    const genderInputs = document.querySelectorAll('input[name="gender"]');

    // Edit button click handler
    editBtn.addEventListener('click', () => {
        editBtn.style.display = 'none';
        saveBtn.style.display = 'block';
        
        // Enable editing
        editableElements.forEach(element => {
            element.contentEditable = true;
            element.classList.add('editing');
        });
        
        textareas.forEach(textarea => {
            textarea.disabled = false;
        });
        
        genderInputs.forEach(input => {
            input.disabled = false;
        });
    });

    // Save button click handler
    saveBtn.addEventListener('click', () => {
        saveBtn.style.display = 'none';
        editBtn.style.display = 'block';
        
        // Disable editing
        editableElements.forEach(element => {
            element.contentEditable = false;
            element.classList.remove('editing');
        });
        
        textareas.forEach(textarea => {
            textarea.disabled = true;
        });
        
        genderInputs.forEach(input => {
            input.disabled = true;
        });
        
        // Here you would typically save the data to a backend
        showNotification('Changes saved successfully!');
    });

    // Camera button click handler
    cameraBtn.addEventListener('click', () => {
        imageModal.style.display = 'block';
        cameraContainer.style.display = 'none';
        retakeBtn.style.display = 'none';
        snapBtn.style.display = 'block';
    });

    // Upload button click handler
    uploadBtn.addEventListener('click', () => {
        stopCamera();
        cameraContainer.style.display = 'none';
        fileInput.click();
    });

    // Capture button click handler with improved error handling
    captureBtn.addEventListener('click', async () => {
        try {
            // First check if getUserMedia is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Camera API is not supported in your browser');
            }

            // Request camera access with better error handling
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: {
                    facingMode: 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });
            
            cameraPreview.srcObject = stream;
            cameraContainer.style.display = 'block';
            uploadBtn.style.display = 'none';
            captureBtn.style.display = 'none';
        } catch (err) {
            console.error('Error accessing camera:', err);
            let errorMessage = 'An error occurred while accessing the camera.';
            
            // Provide specific error messages based on the error type
            if (err.name === 'NotAllowedError') {
                errorMessage = 'Camera access was denied. Please allow camera access in your browser settings and try again.';
            } else if (err.name === 'NotFoundError') {
                errorMessage = 'No camera device was found. Please make sure your camera is connected and try again.';
            } else if (err.name === 'NotReadableError') {
                errorMessage = 'Your camera might be in use by another application. Please close other apps using the camera and try again.';
            } else if (err.name === 'SecurityError') {
                errorMessage = 'Camera access is restricted due to security settings. Please check your browser settings.';
            }

            showNotification(errorMessage, 'error');
            
            // Reset the modal state
            imageModal.style.display = 'none';
            stopCamera();
            
            // Show a helpful message about enabling camera permissions
            const permissionHelp = document.createElement('div');
            permissionHelp.className = 'permission-help';
            permissionHelp.innerHTML = `
                <div class="permission-help-content">
                    <h3>Camera Permission Required</h3>
                    <p>To use the camera feature, please:</p>
                    <ol>
                        <li>Click the camera icon in your browser's address bar</li>
                        <li>Select "Allow" for camera access</li>
                        <li>Try again by clicking the camera button</li>
                    </ol>
                    <button class="modal-btn" onclick="this.parentElement.parentElement.remove()">Got it</button>
                </div>
            `;
            document.body.appendChild(permissionHelp);
        }
    });

    // Snap button click handler
    snapBtn.addEventListener('click', () => {
        const canvas = document.createElement('canvas');
        canvas.width = cameraPreview.videoWidth;
        canvas.height = cameraPreview.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(cameraPreview, 0, 0);
        
        // Set the captured image
        profileImg.src = canvas.toDataURL('image/png');
        
        // Show retake button and hide snap button
        snapBtn.style.display = 'none';
        retakeBtn.style.display = 'block';
        
        // Stop the camera stream
        stopCamera();
    });

    // Retake button click handler
    retakeBtn.addEventListener('click', async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            cameraPreview.srcObject = stream;
            snapBtn.style.display = 'block';
            retakeBtn.style.display = 'none';
        } catch (err) {
            console.error('Error accessing camera:', err);
            showNotification('Unable to access camera. Please check permissions.', 'error');
        }
    });

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === imageModal) {
            imageModal.style.display = 'none';
            stopCamera();
            // Reset modal state
            uploadBtn.style.display = 'block';
            captureBtn.style.display = 'block';
            cameraContainer.style.display = 'none';
        }
    });

    // Handle file selection
    fileInput.addEventListener('change', handleImageSelect);

    function handleImageSelect(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                profileImg.src = e.target.result;
                imageModal.style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    }

    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
    }

    // Enhanced showNotification function with better styling
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Enhanced notification styles
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.padding = '15px 25px';
        notification.style.borderRadius = '8px';
        notification.style.color = 'white';
        notification.style.backgroundColor = type === 'success' ? '#4CAF50' : '#f44336';
        notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        notification.style.zIndex = '9999';
        notification.style.animation = 'slideIn 0.5s ease-out';
        notification.style.maxWidth = '400px';
        notification.style.wordWrap = 'break-word';
        
        // Add keyframes for animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            .permission-help {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                backdrop-filter: blur(5px);
            }
            .permission-help-content {
                background: white;
                padding: 30px;
                border-radius: 15px;
                max-width: 400px;
                text-align: left;
            }
            .permission-help-content h3 {
                color: #1a73e8;
                margin-bottom: 15px;
            }
            .permission-help-content p {
                margin-bottom: 10px;
                color: #5f6368;
            }
            .permission-help-content ol {
                margin: 15px 0;
                padding-left: 20px;
                color: #5f6368;
            }
            .permission-help-content li {
                margin-bottom: 8px;
            }
            .permission-help-content button {
                margin-top: 15px;
                width: 100%;
            }
        `;
        document.head.appendChild(style);
        
        // Remove notification after 5 seconds (increased from 3 to give more time to read)
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.5s ease-in';
            setTimeout(() => {
                document.body.removeChild(notification);
                document.head.removeChild(style);
            }, 500);
        }, 5000);
    }
=======
document.addEventListener('DOMContentLoaded', () => {
    const editBtn = document.getElementById('editBtn');
    const saveBtn = document.getElementById('saveBtn');
    const cameraBtn = document.getElementById('cameraBtn');
    const fileInput = document.getElementById('fileInput');
    const profileImg = document.getElementById('profileImg');
    const imageModal = document.getElementById('imageModal');
    const uploadBtn = document.getElementById('uploadBtn');
    const captureBtn = document.getElementById('captureBtn');
    const cameraContainer = document.getElementById('cameraContainer');
    const cameraPreview = document.getElementById('cameraPreview');
    const snapBtn = document.getElementById('snapBtn');
    const retakeBtn = document.getElementById('retakeBtn');
    let stream = null;
    
    // Elements that can be edited
    const editableElements = document.querySelectorAll('[contenteditable]');
    const textareas = document.querySelectorAll('textarea');
    const genderInputs = document.querySelectorAll('input[name="gender"]');

    // Edit button click handler
    editBtn.addEventListener('click', () => {
        editBtn.style.display = 'none';
        saveBtn.style.display = 'block';
        
        // Enable editing
        editableElements.forEach(element => {
            element.contentEditable = true;
            element.classList.add('editing');
        });
        
        textareas.forEach(textarea => {
            textarea.disabled = false;
        });
        
        genderInputs.forEach(input => {
            input.disabled = false;
        });
    });

    // Save button click handler
    saveBtn.addEventListener('click', () => {
        saveBtn.style.display = 'none';
        editBtn.style.display = 'block';
        
        // Disable editing
        editableElements.forEach(element => {
            element.contentEditable = false;
            element.classList.remove('editing');
        });
        
        textareas.forEach(textarea => {
            textarea.disabled = true;
        });
        
        genderInputs.forEach(input => {
            input.disabled = true;
        });
        
        // Here you would typically save the data to a backend
        showNotification('Changes saved successfully!');
    });

    // Camera button click handler
    cameraBtn.addEventListener('click', () => {
        imageModal.style.display = 'block';
        cameraContainer.style.display = 'none';
        retakeBtn.style.display = 'none';
        snapBtn.style.display = 'block';
    });

    // Upload button click handler
    uploadBtn.addEventListener('click', () => {
        stopCamera();
        cameraContainer.style.display = 'none';
        fileInput.click();
    });

    // Capture button click handler with improved error handling
    captureBtn.addEventListener('click', async () => {
        try {
            // First check if getUserMedia is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Camera API is not supported in your browser');
            }

            // Request camera access with better error handling
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: {
                    facingMode: 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });
            
            cameraPreview.srcObject = stream;
            cameraContainer.style.display = 'block';
            uploadBtn.style.display = 'none';
            captureBtn.style.display = 'none';
        } catch (err) {
            console.error('Error accessing camera:', err);
            let errorMessage = 'An error occurred while accessing the camera.';
            
            // Provide specific error messages based on the error type
            if (err.name === 'NotAllowedError') {
                errorMessage = 'Camera access was denied. Please allow camera access in your browser settings and try again.';
            } else if (err.name === 'NotFoundError') {
                errorMessage = 'No camera device was found. Please make sure your camera is connected and try again.';
            } else if (err.name === 'NotReadableError') {
                errorMessage = 'Your camera might be in use by another application. Please close other apps using the camera and try again.';
            } else if (err.name === 'SecurityError') {
                errorMessage = 'Camera access is restricted due to security settings. Please check your browser settings.';
            }

            showNotification(errorMessage, 'error');
            
            // Reset the modal state
            imageModal.style.display = 'none';
            stopCamera();
            
            // Show a helpful message about enabling camera permissions
            const permissionHelp = document.createElement('div');
            permissionHelp.className = 'permission-help';
            permissionHelp.innerHTML = `
                <div class="permission-help-content">
                    <h3>Camera Permission Required</h3>
                    <p>To use the camera feature, please:</p>
                    <ol>
                        <li>Click the camera icon in your browser's address bar</li>
                        <li>Select "Allow" for camera access</li>
                        <li>Try again by clicking the camera button</li>
                    </ol>
                    <button class="modal-btn" onclick="this.parentElement.parentElement.remove()">Got it</button>
                </div>
            `;
            document.body.appendChild(permissionHelp);
        }
    });

    // Snap button click handler
    snapBtn.addEventListener('click', () => {
        const canvas = document.createElement('canvas');
        canvas.width = cameraPreview.videoWidth;
        canvas.height = cameraPreview.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(cameraPreview, 0, 0);
        
        // Set the captured image
        profileImg.src = canvas.toDataURL('image/png');
        
        // Show retake button and hide snap button
        snapBtn.style.display = 'none';
        retakeBtn.style.display = 'block';
        
        // Stop the camera stream
        stopCamera();
    });

    // Retake button click handler
    retakeBtn.addEventListener('click', async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            cameraPreview.srcObject = stream;
            snapBtn.style.display = 'block';
            retakeBtn.style.display = 'none';
        } catch (err) {
            console.error('Error accessing camera:', err);
            showNotification('Unable to access camera. Please check permissions.', 'error');
        }
    });

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === imageModal) {
            imageModal.style.display = 'none';
            stopCamera();
            // Reset modal state
            uploadBtn.style.display = 'block';
            captureBtn.style.display = 'block';
            cameraContainer.style.display = 'none';
        }
    });

    // Handle file selection
    fileInput.addEventListener('change', handleImageSelect);

    function handleImageSelect(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                profileImg.src = e.target.result;
                imageModal.style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    }

    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
    }

    // Enhanced showNotification function with better styling
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Enhanced notification styles
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.padding = '15px 25px';
        notification.style.borderRadius = '8px';
        notification.style.color = 'white';
        notification.style.backgroundColor = type === 'success' ? '#4CAF50' : '#f44336';
        notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        notification.style.zIndex = '9999';
        notification.style.animation = 'slideIn 0.5s ease-out';
        notification.style.maxWidth = '400px';
        notification.style.wordWrap = 'break-word';
        
        // Add keyframes for animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            .permission-help {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                backdrop-filter: blur(5px);
            }
            .permission-help-content {
                background: white;
                padding: 30px;
                border-radius: 15px;
                max-width: 400px;
                text-align: left;
            }
            .permission-help-content h3 {
                color: #1a73e8;
                margin-bottom: 15px;
            }
            .permission-help-content p {
                margin-bottom: 10px;
                color: #5f6368;
            }
            .permission-help-content ol {
                margin: 15px 0;
                padding-left: 20px;
                color: #5f6368;
            }
            .permission-help-content li {
                margin-bottom: 8px;
            }
            .permission-help-content button {
                margin-top: 15px;
                width: 100%;
            }
        `;
        document.head.appendChild(style);
        
        // Remove notification after 5 seconds (increased from 3 to give more time to read)
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.5s ease-in';
            setTimeout(() => {
                document.body.removeChild(notification);
                document.head.removeChild(style);
            }, 500);
        }, 5000);
    }
>>>>>>> 731d027ef8dbf9ec6dc2f270202fbe43ada2fd9e
});