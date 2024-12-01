// 获取DOM元素
const videoUrlInput = document.getElementById('videoUrl');
const previewSection = document.getElementById('previewSection');
const videoPreview = document.getElementById('videoPreview');
const downloadBtn = document.getElementById('downloadBtn');

// 解析视频函数
async function parseVideo() {
    const url = videoUrlInput.value.trim();
    if (!url) {
        alert('请输入视频链接');
        return;
    }

    try {
        // 调用API解析视频链接
        const response = await fetch('/api/parse', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });

        if (!response.ok) {
            throw new Error('解析失败');
        }

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || '解析失败');
        }

        // 显示预览
        previewSection.style.display = 'block';
        videoPreview.src = `/preview?url=${encodeURIComponent(data.url)}`;
        
        // 设置下载按钮
        downloadBtn.onclick = () => {
            window.location.href = `/download?url=${encodeURIComponent(data.url)}`;
        };

    } catch (error) {
        alert('视频解析失败，请检查链接是否正确');
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 清空选择框的默认选项
    videoUrlInput.innerHTML = '';
}); 