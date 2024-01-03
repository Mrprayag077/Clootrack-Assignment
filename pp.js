const express = require('express');
const axios = require('axios');
const app = express();

const luminatiApiToken = 'YOUR_LUMINATI_API_TOKEN';
const luminatiEndpoint = 'https://luminati.io/api/proxy';

app.all('/*', async (req, res) => {
    try {
        const response = await axios.request({
            url: req.url,
            method: req.method,
            headers: req.headers,
            httpsAgent: new https.Agent({
                rejectUnauthorized: false, // Disable SSL verification for simplicity
            }),
            auth: {
                username: luminatiApiToken,
                password: '',
            },
            proxy: {
                host: luminatiEndpoint,
                port: 22225, // Default Luminati port
            },
        });

        res.set(response.headers);
        res.status(response.status).send(response.data);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).send('Proxy error');
    }
});

app.listen(3000, () => {
    console.log('Proxy server listening on port 3000');
});
