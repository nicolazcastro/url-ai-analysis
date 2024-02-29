$(document).ready(function() {
    let isCompleted = false;
    let url = '';
    let loggedUserId = '';
    let loggedUserEmail = '';

    function getToken() {
        return localStorage.getItem('token');
    }

    function getLoggedUserId(){
        return getUserIdFromToken(getToken());
    }

    function isUserLogged() {
        let token =  localStorage.getItem('token');
        if(token){
            const decodedToken = decodeToken(token);
            loggedUserId = decodedToken.userId;
            loggedUserEmail = decodedToken.email;
            if (decodedToken.exp * 1000 > Date.now()) {
                return true;
            } else {
                return false;
            }
        }
        return false;
    }

    function decodeToken(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    
        return JSON.parse(jsonPayload);
    }

    function getUserIdFromToken(token) {
        if (!token) {
            console.error('Token not provided');
            return null;
        }
    
        const decodedToken = decodeToken(token);
        if (!decodedToken || !decodedToken.userId) {
            console.error('Invalid token or missing user ID');
            return null;
        }
    
        return decodedToken.userId;
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
            $('#logoutBtn').show();
            $('#userDisplayName').show();
            $('#manageCreditBtn').show();
            $('#loginBtn').hide();
        } else {
            $('#logoutBtn').hide();
            $('#userDisplayName').hide();
            $('#manageCreditBtn').hide();
            $('#loginBtn').show();
        }
    }

    let isLoggedIn = false;
    setUserDataLogin();
        
    function setUserDataLogin(){
        isLoggedIn = isUserLogged();
        if (isLoggedIn) {
            updateUserDisplayName(loggedUserEmail); 
        }
        toggleUserOptions(isLoggedIn);
    }

    setUserDataLogin();

    $('#analyzeBtn').click(function() {
        console.log("Starting analysis");
        isCompleted = false
        url = $('#url').val();
        $('#result').text('Analysis started. Please wait...');
        
        const userId = getLoggedUserId();

        $.ajax({
            url: 'http://localhost:3000/analyze',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ url: url, userId: userId }),
            success: function(response) {
                console.log(response);
            },
            error: function(err) {
                isCompleted = true
                if (err.status === 403) {
                    $('#result').text('Insufficient credit to perform analysis');
                } else {
                    console.error(err);
                    $('#result').text('Error analyzing URL: ' + err.responseJSON.error);
                }
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
        }, 2000);
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
                localStorage.setItem('token', response.token); // Store the token in local storage
                setUserDataLogin();
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

    // Function to fetch user credit
    function getUserCredit() {
        const token = getToken(); // Assuming you have a function to retrieve the token

        // Decode the token to extract the user ID
        const userId = getUserIdFromToken(token); 

        if (!userId) {
            console.error('User ID not found');
            return;
        }

        $.ajax({
            url: `http://localhost:3000/credit/${userId}`,
            type: 'GET', 
            success: function(response) {
                $('#manageUserDataModal').modal('show');
                // Update modal input with user credit
                $('#creditInput').val(response.credit);
            },
            error: function(err) {
                console.error(err);
                // Handle error
            }
        });
    }

    // Update credit button click event
    $('#updateCreditBtn').click(function() {
        const creditAmount = $('#creditInput').val();
        
        if (!validateCreditInput(creditAmount)) {
            // Display error message if input is invalid
            $('#creditErrorMsg').text('Please enter a valid positive integer or 0.');
            return;
        }

        const userId = getLoggedUserId();

        $.ajax({
            url: 'http://localhost:3000/credit',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ userId: userId, credit: creditAmount }),      
            success: function(response) {
                // Handle success
                console.log('Credit updated successfully');
            },
            error: function(err) {
                console.error(err);
                // Handle error
            }
        });
    });

    function validateCreditInput(input) {
        // Regular expression to match positive integers or zero
        const regex = /^(0|[1-9]\d*)$/;
        return regex.test(input);
    }

    // Show modal when "Manage User Data" link is clicked
    $('#manageCreditBtn').click(function() {
        console.log("Button clicked");
        $('#creditErrorMsg').text('');
        $('#creditInput').val('');
        getUserCredit(); // Fetch user credit
    });

    $('#creditInput').on('input', function() {
        const creditInput = $(this).val();
        const isValid = validateCreditInput(creditInput);
        if (!isValid) {
            $('#creditErrorMsg').text('Please enter a valid positive integer or 0.');
        } else {
            $('#creditErrorMsg').text('');
        }
    });

});
