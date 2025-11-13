const axios = require('axios');

const API_URL = 'https://platform-api.max.ru';
const TOKEN = 'f9LHodD0cOlHz3ff1nZgWFrfxDMetiYgi9RnPjsxHnzROMD6rtu47m2 gfskH7mMUT0qK0-yyPHQbYpjWFnYw'

async function checkToken() {
    try {
        const response = await axios.get(`${API_URL}/me`, {
            headers: {
                Authorization: TOKEN
            }
        });
        console.log('Токен действителен ✅');
        console.log('Ответ сервера:', response.data);
    } catch (err) {
        if (err.response) {
            console.log('Ошибка:', err.response.status);
            console.log('Данные:', err.response.data);
        } else {
            console.log('Ошибка запроса:', err.message);
        }
    }
}

checkToken();
