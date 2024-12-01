document.addEventListener('DOMContentLoaded', function() {
    const parseBtn = document.getElementById('parseBtn');
    const videoUrl = document.getElementById('videoUrl');

    parseBtn.onclick = async function() {
        const url = videoUrl.value.trim();
        if (!url) {
            alert('请输入视频链接');
            return;
        }

        try {
            console.log('开始请求API，URL:', url);
            const response = await fetch('/api/parse', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url })
            });

            console.log('API响应:', response);
            if (!response.ok) {
                throw new Error('解析失败');
            }

            const data = await response.json();
            console.log('解析结果:', data);

            if (!data.success) {
                throw new Error(data.message || '解析失败');
            }

            // 下载视频
            window.location.href = `/download?url=${encodeURIComponent(data.url)}`;

        } catch (error) {
            console.error('解析失败:', error);
            alert('视频解析失败，请检查链接是否正确');
        }
    };
}); 