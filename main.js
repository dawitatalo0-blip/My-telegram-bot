const TelegramBot = require('node-telegram-bot-api');

const token = 'YOUR_BOT_TOKEN_HERE';
const myChatId = 'YOUR_CHAT_ID_HERE';

const bot = new TelegramBot(token, { polling: true });

const userStates = {};

const products = {
    'phone': { name: 'iPhone 15 Pro', price: '120,000 ETB' },
    'laptop': { name: 'MacBook Air M2', price: '150,000 ETB' }
};

// 1. /start ሲባል ወዲያውኑ ስም መጠየቅ ይጀምራል
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    userStates[chatId] = { step: 'ASK_NAME' };
    bot.sendMessage(chatId, "እንኳን ደህና መጡ! ትዕዛዝዎን ለመጀመር እባክዎ ስምዎን ያስገቡ፦");
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!userStates[chatId]) return;

    let state = userStates[chatId];

    // 2. ስም ከተቀበለ በኋላ እቃዎችን ማሳየት
    if (state.step === 'ASK_NAME') {
        state.name = text;
        state.step = 'CHOOSE_PRODUCT';
        const opts = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '📱 iPhone 15 Pro', callback_data: 'phone' }],
                    [{ text: '💻 MacBook Air', callback_data: 'laptop' }]
                ]
            }
        };
        bot.sendMessage(chatId, `አመሰግናለሁ ${state.name}! የሚፈልጉትን እቃ ይምረጡ፦`, opts);
    } 
    // 3. ስልክ ቁጥር መቀበል
    else if (state.step === 'ASK_PHONE') {
        state.phone = text;
        bot.sendMessage(chatId, "አመሰግናለሁ! ትዕዛዝዎ ተመዝግቧል፣ በቅርቡ እናገኝዎታለን።");
        
        // ለአንተ መላክ
        bot.sendMessage(myChatId, `🚨 አዲስ ትዕዛዝ!\n\nደንበኛ: ${state.name}\nእቃ: ${products[state.productKey].name}\nስልክ: ${state.phone}`);
        
        delete userStates[chatId];
    }
});

// 4. እቃ ሲመረጥ ስልክ ቁጥር መጠየቅ
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    if (userStates[chatId]) {
        userStates[chatId].productKey = query.data;
        userStates[chatId].step = 'ASK_PHONE';
        bot.sendMessage(chatId, "ስልክ ቁጥርዎን ያስገቡ፦");
    }
});
