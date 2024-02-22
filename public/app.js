$(document).ready(function() {
    let isCompleted = false;

    $('#analyzeBtn').click(function() {
        const url = $('#url').val();
        $('#result').text('');
        $.ajax({
            url: 'http://localhost:3000/analyze',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ url: url }),
            success: function(response) {
                console.log(response);
                $('#result').text('Analysis started. Please wait...');
                checkResult(url);
            },
            error: function(err) {
                console.error(err);
                $('#result').text('Error analyzing URL');
            }
        });
    });

    let completed = false;
    function checkResult(url) {
        $.ajax({
            url: 'http://localhost:3000/result',
            type: 'GET',
            data: { url: url },
            success: function(response) {
                console.log("response: ", response.completed, response.analysisCompleted);
                if(response.completed === false) {
                    console.log(1);
                    completed = false;
                } else{
                    console.log(2);
                    $('#result').html(response);
                    // Check if the result contains the OpenAI analysis
                    if (response.includes('Analysis result from aiAnalyzer.js')) {
                        completed = true;
                    }
                }
                //setTimeout(checkResult, 2000);
            },
            error: function(err) {
                console.error(err);
                $('#result').text('Error calling /result path');
            }
        });
    }
});
