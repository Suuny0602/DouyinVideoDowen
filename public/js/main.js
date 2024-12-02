// 全局变量存储当前视频数据
let currentVideoData = null;

// 解析视频函数
function parseVideo() {
    const input = document.getElementById('videoUrl').value.trim();
    if (!input) {
        alert('请输入视频链接');
        return;
    }

    // 提取链接
    let url = input;
    if (input.includes('http')) {
        // 从分享文本中提取链接
        const match = input.match(/https?:\/\/[^\s]+/);
        if (match) {
            url = match[0];
        }
    }

    console.log('开始解析链接:', url);
    fetch('/api/parse', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: url })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            currentVideoData = data;
            showPreview(data);
        } else {
            alert('解析失败');
        }
    })
    .catch(error => {
        console.error('解析失败:', error);
        alert('视频解析失败，请检查链接是否正确');
    });
}

// 显示预览
function showPreview(data) {
    const previewArea = document.getElementById('previewArea');
    const videoPlayer = document.getElementById('videoPlayer');
    
    // 显示预览区域
    previewArea.style.display = 'block';
    
    // 检测是否为移动设备
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // 设置视频源并添加错误处理
    const videoUrl = `/preview?url=${encodeURIComponent(data.url)}`;
    videoPlayer.src = videoUrl;
    
    // 如果是移动设备，添加特殊属性
    if (isMobile) {
        videoPlayer.setAttribute('playsinline', ''); // iOS支持内联播放
        videoPlayer.setAttribute('webkit-playsinline', ''); // 旧版iOS支持
        videoPlayer.setAttribute('x5-video-player-type', 'h5'); // 腾讯X5浏览器支持
        videoPlayer.setAttribute('x5-video-player-fullscreen', 'true');
        videoPlayer.setAttribute('preload', 'auto');
    }
    
    // 添加错误处理
    videoPlayer.onerror = function(e) {
        console.error('视频加载失败:', e);
        alert('视频预览加载失败，请尝试直接下载');
    };
    
    // 添加加载事件
    videoPlayer.onloadeddata = function() {
        console.log('视频加载成功');
    };

    // 添加播放错误处理
    videoPlayer.addEventListener('stalled', function() {
        console.log('视频加载停滞');
        videoPlayer.load(); // 尝试重新加载
    });

    videoPlayer.addEventListener('waiting', function() {
        console.log('视频缓冲中');
    });
}

// 下载视频
function downloadVideo() {
    if (!currentVideoData) {
        alert('请先解析视频');
        return;
    }

    const resolution = document.getElementById('resolution').value;
    const url = currentVideoData.url;
    
    // 下载视频
    window.location.href = `/download?url=${encodeURIComponent(url)}&resolution=${resolution}`;
}