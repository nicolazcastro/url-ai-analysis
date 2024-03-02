let isLoggedIn = false;
let isCompleted = false;
let url = '';
let loggedUserId = '';
let loggedUserEmail = '';

$(document).ready(function() {

    $('.alert-close-btn').click(function() {
        hideAlert();
    });

    $.ajaxPrefilter(function(options, originalOptions, jqXHR) {
        jqXHR.setRequestHeader('Authorization', 'Bearer ' + getToken());
    });
        
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
                showAlert('Error analyzing URL: ' + err.responseJSON.message);              
            }
        });
        startCheckResult();
    });

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
                localStorage.setItem('token', response.token);
                setUserDataLogin();
                $('#result').text('');
            },
            error: function(err) {
                showAlert(err.responseJSON.message);
            }
        });
    });

    $('#registerSubmitBtn').click(function(event) {
        event.preventDefault();
        const username = $('#registerUsername').val();
        const email = $('#registerEmail').val();
        const password = $('#registerPassword').val();
        const registerConfirmPassword = $('#registerConfirmPassword').val();

        if (!validateEmail(email)) {
            showAlert('Please enter a valid email address');
            return false;
        }

        if(registerConfirmPassword !== password){
            showAlert('Passwords does not match.');
            return false;
        }

        $.ajax({
            url: 'http://localhost:3000/register',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ username: username, email: email, password: password }),
            success: function(response) {
                showAlert(response.message);
            },
            error: function(err) {
                showAlert(err.responseJSON.message);
            }
        });
    });

    $('#logoutBtn').click(function() {
        logout();
    });

    $('#updateCreditBtn').click(function() {
        const creditAmount = $('#creditInput').val();
        
        if (!validateCreditInput(creditAmount)) {
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
                showAlert('Credit updated successfully');
                $('#creditModal').modal('hide');
            },
            error: function(err) {
                showAlert(err.responseJSON.message);
            }
        });
    });

    $('#manageCreditBtn').click(function() {
        console.log("Button clicked");
        $('#creditErrorMsg').text('');
        $('#creditInput').val('');
        getUserCredit();
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

    setUserDataLogin();
});

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

function updateUserDisplayName(name) {
    $('#userDisplayName').text('Hello, ' + name);
}

function setUserDataLogin(){
    isLoggedIn = isUserLogged();
    if (isLoggedIn) {
        updateUserDisplayName(loggedUserEmail); 
    }
    toggleUserOptions(isLoggedIn);
}

function checkResult(requestUrl) {
    $.ajax({
        url: 'http://localhost:3000/result',
        type: 'GET',
        data: { url: requestUrl, userId: loggedUserId },
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

function logout() {
    localStorage.removeItem('token');
    updateUserDisplayName('');
    toggleUserOptions(false);
}

function getUserCredit() {
    const token = getToken();
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
            $('#creditInput').val(response.credit);
        },
        error: function(err) {
            console.error(err);
        }
    });
}

function validateCreditInput(input) {
    const regex = /^(0|[1-9]\d*)$/;
    return regex.test(input);
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showAlert(message) {
    console.log("Showing alert");
    $('#customAlertText').text(message);
    $('#blurLayer').css('display', 'block');
    $('#customAlertContainer').css('display', 'block');
    setTimeout(hideAlert, 10000);
}

function hideAlert() {
    console.log("Hiding alert");
    $('#blurLayer').css('display', 'none');
    $('#customAlertContainer').css('display', 'none');
}

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
