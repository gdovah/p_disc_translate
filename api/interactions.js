
const { InteractionType, verifyKeyMiddleware } = require('discord-interactions');
const { translateText } = require('../utils/translate');

const TARGET_CHANNEL_ID = process.env.TARGET_CHANNEL_ID;

const languageMap = {
    'translate_pt': 'Portuguese',
    'translate_en': 'English',
    'translate_es': 'Spanish',
    'translate_fr': 'French'
};

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        const signature = req.headers['x-signature-ed25519'];
        const timestamp = req.headers['x-signature-timestamp'];
        const rawBody = await new Promise(resolve => {
            let data = '';
            req.on('data', chunk => data += chunk);
            req.on('end', () => resolve(data));
        });

        const isValidRequest = verifyKeyMiddleware({
            publicKey: process.env.DISCORD_PUBLIC_KEY
        });

        req.body = JSON.parse(rawBody);

        if (!isValidRequest(req, res)) return;

        const interaction = req.body;

        if (interaction.type === InteractionType.PING) {
            return res.status(200).json({ type: 1 });
        }

        if (interaction.type === InteractionType.MESSAGE_COMPONENT) {
            const language = languageMap[interaction.data.custom_id];
            const originalMessage = interaction.message.reference?.message_id
                ? interaction.message.referenced_message.content
                : interaction.message.content;

            if (interaction.channel_id !== TARGET_CHANNEL_ID) {
                return res.status(200).send();
            }

            const translation = await translateText(originalMessage, language);
            return res.status(200).json({
                type: 4,
                data: {
                    content: `Tradução para ${language}:
${translation}`,
                    flags: 64
                }
            });
        }

        return res.status(400).send();
    } else {
        res.status(405).send('Method Not Allowed');
    }
};
