$(document).ready(function() {
    let isCompleted = false;
    let url = '';

    function getToken() {
        return localStorage.getItem('token');
    }

    // Set up a global AJAX prefilter
    $.ajaxPrefilter(function(options, originalOptions, jqXHR) {
        // Add the token to the request headers
        jqXHR.setRequestHeader('Authorization', 'Bearer ' + getToken());
    });

    // Function to update user display name
    function updateUserDisplayName(name) {
        $('#userDisplayName').text('Hello, ' + name);
    }

    // Function to show/hide user options based on login state
    function toggleUserOptions(isLoggedIn) {
        if (isLoggedIn) {
            $('#userOptions').show();
        } else {
            $('#userOptions').hide();
        }
    }

    const isLoggedIn = true; // Example: Change this to your actual check
    if (isLoggedIn) {
        updateUserDisplayName('John Doe'); // Example: Replace 'John Doe' with actual user display name
    }
    toggleUserOptions(isLoggedIn);

    $('#analyzeBtn').click(function() {
        console.log("Starting analysis");
        isCompleted = false
        url = $('#url').val();
        $('#result').text('Analysis started. Please wait...');
        $.ajax({
            url: 'http://localhost:3000/analyze',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ url: url }),
            success: function(response) {
                console.log(response);
            },
            error: function(err) {
                isCompleted = true
                console.error(err);
                $('#result').text('Error analyzing URL, ' + err.responseJSON.message);
            }
        });
        startCheckResult();
    });

    function checkResult(requestUrl) {
        $.ajax({
            url: 'http://localhost:3000/result',
            type: 'GET',
            data: { url: requestUrl },
            success: function(response) {
                if (response.completed === false) {
                    const logText = response.message.split(' - ')[1];
                    $('#result').html(logText);
                } else {
                    isCompleted = true
                    $('#result').html(response);
                }
            },
            error: function(err) {
                console.error(err);
                $('#result').text('Error calling /result path, ' + err.responseJSON.message);
            }
        });
    }

    function startCheckResult() {
        console.log("Starting checkResult");
        const checkResultTimer = setInterval(function() {
            if (isCompleted === true) {
                console.log("clearing checkResultTimer");
                clearInterval(checkResultTimer);
                return;
            } else {
                checkResult(url);
            }
        }, 10000);
    }

    // Login AJAX request
    $('#loginSubmitBtn').click(function(event) {
        event.preventDefault();
        const email = $('#loginEmail').val();
        const password = $('#loginPassword').val();
    
        $.ajax({
            url: 'http://localhost:3000/login',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ email: email, password: password }),
            success: function(response) {
                $('#loginModal').modal('hide');
                updateUserDisplayName(response.name); // Update the user display name
                toggleUserOptions(true); // Show user options
                localStorage.setItem('token', response.token); // Store the token in local storage
            },
            error: function(err) {
                // Handle login error
            }
        });
    });
    

    // Register AJAX request
    $('#registerSubmitBtn').click(function(event) {
        event.preventDefault();
        const username = $('#registerUsername').val();
        const email = $('#registerEmail').val();
        const password = $('#registerPassword').val();

        $.ajax({
            url: 'http://localhost:3000/register',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ username: username, email: email, password: password }),
            success: function(response) {
                // Handle successful registration
            },
            error: function(err) {
                // Handle registration error
            }
        });
    });

    // Function to logout
    function logout() {
        localStorage.removeItem('token'); // Remove token from local storage
        updateUserDisplayName(''); // Update user display name to empty
        toggleUserOptions(false); // Hide user options
    }

    // Logout button click event
    $('#logoutBtn').click(function() {
        logout(); // Call the logout function
    });

});
