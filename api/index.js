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

        // 使用douyin.wtf的hybrid API
        const apiUrl = `https://douyin.wtf/api/hybrid/video_data?url=${encodeURIComponent(url)}`;
        console.log('请求API:', apiUrl);

        const response = await axios({
            method: 'get',
            url: apiUrl,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json'
            }
        });

        console.log('API响应:', response.data);

        if (response.data.code === 200 && response.data.data) {
            const videoData = response.data.data;
            // 获取最高质量的视频URL
            const videoUrl = videoData.video.bit_rate[0].play_addr.url_list[0];

            res.json({
                success: true,
                url: videoUrl,
                title: videoData.desc,
                author: videoData.author.nickname,
                cover: videoData.video.cover.url_list[0]
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

// 导出应用
module.exports = app; 