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
    
    // 如果是移动设备，添加特殊属性
    if (isMobile) {
        // 移除之前的视频元素
        const oldVideo = videoPlayer;
        const newVideo = document.createElement('video');
        
        // 复制原有属性
        newVideo.id = oldVideo.id;
        newVideo.className = oldVideo.className;
        newVideo.controls = true;
        
        // 添加移动端特殊属性
        newVideo.setAttribute('playsinline', '');
        newVideo.setAttribute('webkit-playsinline', '');
        newVideo.setAttribute('x5-video-player-type', 'h5');
        newVideo.setAttribute('x5-video-player-fullscreen', 'true');
        newVideo.setAttribute('x5-video-orientation', 'portraint');
        newVideo.setAttribute('preload', 'metadata');
        newVideo.style.width = '100%';
        newVideo.style.maxHeight = '70vh';
        newVideo.style.backgroundColor = '#000';
        
        // 替换视频元素
        oldVideo.parentNode.replaceChild(newVideo, oldVideo);
        videoPlayer = newVideo;
        
        // 移动端直接使用原始URL
        videoPlayer.src = data.url;
    } else {
        // PC端使用代理
        videoPlayer.src = `/preview?url=${encodeURIComponent(data.url)}`;
    }
    
    // 添加错误处理
    videoPlayer.onerror = function(e) {
        console.error('视频加载失败:', e);
        // 如果移动端直接访问失败，尝试使用代理
        if (isMobile && videoPlayer.src === data.url) {
            console.log('尝试使用代理加载视频');
            videoPlayer.src = `/preview?url=${encodeURIComponent(data.url)}`;
        } else {
            alert('视频预览加载失败，请尝试直接下载');
        }
    };
    
    // 添加加载成功处理
    videoPlayer.onloadeddata = function() {
        console.log('视频加载成功');
    };
    
    // 添加播放错误处理
    videoPlayer.addEventListener('stalled', function() {
        console.log('视频加载停滞');
        if (!videoPlayer.paused) {
            videoPlayer.load();
        }
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