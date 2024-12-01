// 获取DOM元素
const videoUrlInput = document.getElementById('videoUrl');
const parseBtn = document.getElementById('parseBtn');

// 解析按钮点击事件
parseBtn.addEventListener('click', async () => {
    const url = videoUrlInput.value.trim();
    if (!url) {
        alert('请输入视频链接');
        return;
    }

    try {
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

        // 下载视频
        window.location.href = `/download?url=${encodeURIComponent(data.url)}`;

    } catch (error) {
        alert('视频解析失败，请检查链接是否正确');
    }
}); 