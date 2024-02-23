$(document).ready(function() {
    let isCompleted = false;
    let url = '';

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
                if(response.completed === false) {
                    const logText = response.message.split(' - ')[1];
                    $('#result').html(logText);
                } else{
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
            if(isCompleted === true){
                console.log("clearing checkResultTimer");
                clearInterval(checkResultTimer);
                return;
            } else{
                checkResult(url);
            }
        }, 10000);
    }

});
