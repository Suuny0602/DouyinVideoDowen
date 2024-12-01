const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const path = require('path');

// 启用CORS和JSON解析
app.use(cors());
app.use(express.json());

// 静态文件服务
app.use(express.static(path.join(__dirname, '../public')));

// 视频解析API
app.post('/api/parse', async (req, res) => {
    try {
        const { url } = req.body;
        console.log('收到解析请求:', url);
        
        if (!url) {
            throw new Error('视频链接不能为空');
        }
        
        // 使用douyin.wtf的hybrid API
        const apiUrl = `https://douyin.wtf/api/hybrid/video_data?url=${encodeURIComponent(url)}`;
        console.log('请求API:', apiUrl);
        
        const response = await axios.get(apiUrl);
        console.log('API响应:', response.data);
        
        if (response.data.code === 200 && response.data.data) {
            const videoData = response.data.data;
            // 获取所有可用的视频URL
            const videoUrls = videoData.video.bit_rate.map(item => item.play_addr.url_list[0]);
            // 选择最高质量的视频URL
            const videoUrl = videoUrls[0];
            
            console.log('解析到的视频URL:', videoUrl);
            
            res.json({
                success: true,
                url: videoUrl,
                title: videoData.desc,
                author: videoData.author.nickname,
                cover: videoData.video.cover.url_list[0]
            });
        } else {
            throw new Error('解析失败: ' + JSON.stringify(response.data));
        }
        
    } catch (error) {
        console.error('解析失败详细信息:', error);
        res.status(500).json({
            success: false,
            message: error.message || '视频解析失败，请检查链接是否正确'
        });
    }
});

// 代理下载接口
app.get('/download', async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) {
            return res.status(400).send('URL参数缺失');
        }

        // 设置请求头
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Referer': 'https://www.douyin.com/',
            'Accept': '*/*'
        };

        // 获取视频流
        const response = await axios({
            method: 'get',
            url: url,
            headers: headers,
            responseType: 'stream'
        });

        // 设置响应头
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Content-Disposition', 'attachment; filename=video.mp4');

        // 将视频流传输给客户端
        response.data.pipe(res);
    } catch (error) {
        console.error('下载失败:', error);
        res.status(500).send('下载失败');
    }
});

// 视频预览代理接口
app.get('/preview', async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) {
            return res.status(400).send('URL参数缺失');
        }

        // 设置请求头
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Referer': 'https://www.douyin.com/',
            'Accept': '*/*'
        };

        // 获取视频流
        const response = await axios({
            method: 'get',
            url: url,
            headers: headers,
            responseType: 'stream'
        });

        // 设置响应头
        res.setHeader('Content-Type', 'video/mp4');
        
        // 将视频流传输给客户端
        response.data.pipe(res);
    } catch (error) {
        console.error('预览失败:', error);
        res.status(500).send('预览失败');
    }
});

// 查找可用端口
function findAvailablePort(startPort) {
    return new Promise((resolve, reject) => {
        const server = require('net').createServer();
        server.listen(startPort, () => {
            const port = server.address().port;
            server.close(() => resolve(port));
        });
        server.on('error', () => {
            // 端口被占用，尝试下一个端口
            resolve(findAvailablePort(startPort + 1));
        });
    });
}

// 配置Vercel部署
if (process.env.VERCEL) {
    app.listen();
} else {
    // 动态查找可用端口
    findAvailablePort(3000).then(port => {
        app.listen(port, () => {
            console.log(`服务器运行在 http://localhost:${port}`);
        });
    });
}

module.exports = app; 