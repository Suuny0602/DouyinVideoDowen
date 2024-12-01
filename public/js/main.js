document.addEventListener('DOMContentLoaded', function() {
    const parseBtn = document.getElementById('parseBtn');
    const videoUrl = document.getElementById('videoUrl');

    parseBtn.onclick = function() {
        parseVideo();
    };
});

function parseVideo() {
    var url = document.getElementById('videoUrl').value;
    
    if (!url) {
        alert('请输入视频链接');
        return;
    }

    fetch('/api/parse', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: url })
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        if (data.success) {
            window.location.href = '/download?url=' + encodeURIComponent(data.url);
        } else {
            alert('解析失败');
        }
    })
    .catch(function(error) {
        alert('视频解析失败，请检查链接是否正确');
    });
} 