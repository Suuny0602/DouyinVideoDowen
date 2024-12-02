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
            },
            timeout: 60000, // 增加超时时间到60秒
            maxRedirects: 5,
            validateStatus: function (status) {
                return status >= 200 && status < 600; // 接受更广范围的状态码
            }
        });

        // 检查响应状态
        if (response.status !== 200) {
            throw new Error(`API请求失败，状态码: ${response.status}`);
        }

        console.log('API响应:', response.data);

        if (response.data.code === 200 && response.data.data) {
            const videoData = response.data.data;
            // 获取无水印视频URL
            let videoUrl;
            if (videoData.video && videoData.video.play_addr && videoData.video.play_addr.url_list) {
                videoUrl = videoData.video.play_addr.url_list[0];
            } else if (videoData.video && videoData.video.bit_rate && videoData.video.bit_rate.length > 0) {
                videoUrl = videoData.video.bit_rate[0].play_addr.url_list[0];
            } else {
                throw new Error('无法获取视频地址');
            }

            // 返回处理后的数据
            res.json({
                success: true,
                url: videoUrl,
                title: videoData.desc || '',
                author: videoData.author ? videoData.author.nickname : '',
                cover: videoData.video && videoData.video.cover ? videoData.video.cover.url_list[0] : ''
            });
        } else {
            throw new Error(response.data.message || '解析失败');
        }
    } catch (error) {
        console.error('解析失败:', error);
        // 更详细的错误信息
        const errorMessage = error.response 
            ? `请求失败(${error.response.status}): ${error.response.data}`
            : error.message || '视频解析失败，请检查链接是否正确';
            
        res.status(500).json({
            success: false,
            message: errorMessage
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
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
                'Referer': 'https://www.douyin.com/',
                'Accept': '*/*',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Range': req.headers.range || 'bytes=0-'
            },
            maxRedirects: 5,
            timeout: 30000 // 30秒超时
        });

        // 设置响应头
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Accept-Ranges', 'bytes');
        
        if (response.headers['content-length']) {
            res.setHeader('Content-Length', response.headers['content-length']);
        }
        
        if (response.headers['content-range']) {
            res.setHeader('Content-Range', response.headers['content-range']);
        }
        
        // CORS 头
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Range');
        
        // 缓存控制
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        
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