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
        
        // 使用douyin.wtf的API
        const apiUrl = `https://api.douyin.wtf/api?url=${encodeURIComponent(url)}`;
        console.log('请求API:', apiUrl);
        
        const response = await axios.get(apiUrl);
        console.log('API响应:', response.data);
        
        if (response.data.status === 'success') {
            res.json({
                success: true,
                url: response.data.nwm_video_url,
                title: response.data.desc,
                author: response.data.author,
                cover: response.data.cover
            });
        } else {
            throw new Error('解析失败');
        }
    } catch (error) {
        console.error('解析失败:', error);
        res.status(500).json({
            success: false,
            message: error.message || '视频解析失败，请检查链接是否正确'
        });
    }
});

// 视频预览代理
app.get('/preview', async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) {
            return res.status(400).send('缺少URL参数');
        }

        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Referer': 'https://www.douyin.com/'
            }
        });

        res.setHeader('Content-Type', 'video/mp4');
        response.data.pipe(res);
    } catch (error) {
        console.error('预览失败:', error);
        res.status(500).send('视频预览失败');
    }
});

// 视频下载代理
app.get('/download', async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) {
            return res.status(400).send('缺少URL参数');
        }

        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Referer': 'https://www.douyin.com/'
            }
        });

        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Content-Disposition', 'attachment; filename=video.mp4');
        response.data.pipe(res);
    } catch (error) {
        console.error('下载失败:', error);
        res.status(500).send('视频下载失败');
    }
});

// 启动服务器
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
});

module.exports = app; 