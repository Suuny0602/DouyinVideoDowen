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
        newVideo.setAttribute('controlsList', 'nodownload');
        newVideo.style.width = '100%';
        newVideo.style.maxHeight = '70vh';
        newVideo.style.backgroundColor = '#000';
        
        // 替换视频元素
        oldVideo.parentNode.replaceChild(newVideo, oldVideo);
        
        // 更新videoPlayer引用
        videoPlayer = newVideo;
    }
    
    // 构建视频URL
    const videoUrl = `/preview?url=${encodeURIComponent(data.url)}&mobile=${isMobile ? 1 : 0}`;
    
    // 设置视频源
    if (isMobile) {
        // 移动端使用blob URL
        fetch(videoUrl)
            .then(response => response.blob())
            .then(blob => {
                const blobUrl = URL.createObjectURL(blob);
                videoPlayer.src = blobUrl;
                
                // 清理blob URL
                videoPlayer.onloadeddata = function() {
                    console.log('视频加载成功');
                    // 一段时间后释放blob URL
                    setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
                };
            })
            .catch(error => {
                console.error('视频加载失败:', error);
                alert('视频预览加载失败，请尝试直接下载');
            });
    } else {
        // PC端直接设置src
        videoPlayer.src = videoUrl;
    }
    
    // 添加错误处理
    videoPlayer.onerror = function(e) {
        console.error('视频加载失败:', e);
        alert('视频预览加载失败，请尝试直接下载');
    };
    
    // 添加播放错误处理
    videoPlayer.addEventListener('stalled', function() {
        console.log('视频加载停滞');
        if (!videoPlayer.paused) {
            videoPlayer.load(); // 只在播放状态下重新加载
        }
    });

    videoPlayer.addEventListener('waiting', function() {
        console.log('视频缓冲中');
    });
    
    // 添加播放状态监听
    videoPlayer.addEventListener('play', function() {
        console.log('视频开始播放');
    });
    
    videoPlayer.addEventListener('pause', function() {
        console.log('视频暂停');
    });
    
    // 添加进度监听
    videoPlayer.addEventListener('progress', function() {
        console.log('视频加载进度:', videoPlayer.buffered.length ? 
            videoPlayer.buffered.end(videoPlayer.buffered.length - 1) : 0);
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