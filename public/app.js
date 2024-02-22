$(document).ready(function() {
    $('#analyzeBtn').click(function() {
        const url = $('#url').val();
        $.ajax({
            url: 'http://localhost:3000/analyze',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ url: url }),
            success: function(response) {
                console.log(response);
                $('#result').text('Analysis started. Please wait...');
                checkResult(url); // Pass the URL to checkResult function
            },
            error: function(err) {
                console.error(err);
                $('#result').text('Error analyzing URL');
            }
        });
    });

    function checkResult(url) {
        setTimeout(function() {
            $.ajax({
                url: `http://localhost:3000/result/${encodeURIComponent(url)}`, // Use the URL to fetch result
                type: 'GET',
                success: function(response) {
                    $('#result').html(response);
                },
                error: function(err) {
                    console.error(err);
                    $('#result').text('Error loading result');
                }
            });
        }, 5000); // Poll every 5 seconds
    }
});
