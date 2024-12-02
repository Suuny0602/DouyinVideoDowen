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
    
    // 显示预览区域
    previewArea.style.display = 'block';
    
    // 检测是否为移动设备
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // 初始化或重新初始化video.js播放器
    if (window.videoPlayer) {
        window.videoPlayer.dispose();
    }
    
    window.videoPlayer = videojs('videoPlayer', {
        controls: true,
        autoplay: false,
        preload: 'auto',
        fluid: true,
        playsinline: true,
        userActions: {
            hotkeys: true
        },
        html5: {
            vhs: {
                overrideNative: true
            },
            nativeVideoTracks: false,
            nativeAudioTracks: false,
            nativeTextTracks: false
        },
        techOrder: ['html5'],
        sources: [{
            src: data.url,
            type: 'video/mp4'
        }],
        poster: data.cover
    });
    
    // 错误处理
    window.videoPlayer.on('error', function() {
        console.error('视频加载失败，尝试使用备用方案');
        // 尝试使用备用源
        window.videoPlayer.src({
            src: `/download?url=${encodeURIComponent(data.url)}`,
            type: 'video/mp4'
        });
        
        // 如果备用方案也失败
        window.videoPlayer.on('error', function() {
            console.error('备用方案也失败');
            alert('视频预览加载失败，请尝试直接下载');
        });
    });
    
    // 添加事件监听
    window.videoPlayer.on('loadeddata', function() {
        console.log('视频加载成功');
    });
    
    window.videoPlayer.on('waiting', function() {
        console.log('视频缓冲中');
    });
    
    window.videoPlayer.on('playing', function() {
        console.log('视频开始播放');
    });
    
    window.videoPlayer.on('pause', function() {
        console.log('视频暂停');
    });
    
    window.videoPlayer.on('progress', function() {
        const buffered = window.videoPlayer.buffered();
        if (buffered.length) {
            console.log('视频加载进度:', buffered.end(buffered.length - 1));
        }
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