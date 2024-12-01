// 获取DOM元素
const videoUrlInput = document.getElementById('videoUrl');
const parseBtn = document.getElementById('parseBtn');
const previewSection = document.getElementById('previewSection');
const videoPreview = document.getElementById('videoPreview');
const resolutionSelect = document.getElementById('resolution');
const downloadBtn = document.getElementById('downloadBtn');

// 解析按钮点击事件
parseBtn.addEventListener('click', async () => {
    const url = videoUrlInput.value.trim();
    if (!url) {
        alert('请输入视频链接');
        return;
    }

    try {
        // 显示加载状态
        parseBtn.disabled = true;
        parseBtn.textContent = '解析中...';

        console.log('开始解析链接:', url);

        // 调用API解析视频链接
        const videoInfo = await parseVideoUrl(url);
        
        console.log('解析结果:', videoInfo);
        
        // 显示预览区域
        previewSection.style.display = 'block';
        // 使用代理接口预览视频
        videoPreview.src = `/preview?url=${encodeURIComponent(videoInfo.url)}`;
        
        // 更新下载按钮
        downloadBtn.onclick = () => downloadVideo(videoInfo.url);

    } catch (error) {
        console.error('详细错误信息:', error);
        alert('视频解析失败，请检查链接是否正确');
    } finally {
        parseBtn.disabled = false;
        parseBtn.textContent = '解析视频';
    }
});

// 解析视频URL
async function parseVideoUrl(url) {
    // 使用相对路径，这样在本地开发和生产环境都可以正常工作
    const apiUrl = '/api/parse';
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
    });

    if (!response.ok) {
        throw new Error('API请求失败');
    }

    return await response.json();
}

// 下载视频
async function downloadVideo(url) {
    try {
        // 使用代理接口下载
        window.location.href = `/download?url=${encodeURIComponent(url)}`;
    } catch (error) {
        alert('下载失败，请稍后重试');
        console.error('下载失败:', error);
    }
} 