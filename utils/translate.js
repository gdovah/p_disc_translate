
const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function translateText(text, targetLanguage) {
    const prompt = `Traduza o seguinte texto para ${targetLanguage}:
"${text}"`;
    const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
            { role: 'system', content: 'Você é um tradutor profissional.' },
            { role: 'user', content: prompt }
        ]
    });

    return response.data.choices[0].message.content.trim();
}

module.exports = { translateText };
