// تحميل نماذج الذكاء الاصطناعي
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo).catch(err => {
    console.error("خطأ في تحميل النماذج:", err);
    alert("حدث خطأ في تحميل نماذج الذكاء الاصطناعي!");
});

// تشغيل الكاميرا مع طلب الإذن
async function startVideo() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        document.getElementById('permission-message').style.display = 'none';
        const video = document.getElementById('video');
        video.srcObject = stream;
        video.onloadedmetadata = () => video.play();
    } catch (err) {
        document.getElementById('permission-message').style.display = 'block';
        console.error("تم رفض الإذن:", err);
    }
}

// زر الكشف عن المشاعر
document.getElementById('detect-btn').addEventListener('click', async () => {
    try {
        const video = document.getElementById('video');
        const result = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                                  .withFaceExpressions();
        
        if (result.length > 0) {
            const emotions = result[0].expressions;
            const dominantEmotion = getDominantEmotion(emotions);
            showQuote(dominantEmotion);
        } else {
            alert("لم يتم اكتشاف وجه! حاول مرة أخرى.");
        }
    } catch (err) {
        console.error("خطأ في الكشف:", err);
        alert("حدث خطأ أثناء تحليل المشاعر!");
    }
});

// تحديد المشاعر الغالبة
function getDominantEmotion(emotions) {
    let maxValue = 0;
    let dominantEmotion = 'neutral';
    
    for (const [emotion, value] of Object.entries(emotions)) {
        if (value > maxValue) {
            maxValue = value;
            dominantEmotion = emotion;
        }
    }
    
    return dominantEmotion;
}

// عرض الاقتباس المناسب
async function showQuote(emotion) {
    try {
        const response = await fetch('quotes.json');
        const quotes = await response.json();
        
        const emotionQuotes = quotes[emotion] || [{
            text: "“المشاعر مثل البحر، تهدأ أمواجه لكنها لا تجف” — غير معروف",
            author: "غير معروف"
        }];
        
        const randomQuote = emotionQuotes[Math.floor(Math.random() * emotionQuotes.length)];
        
        document.getElementById('quote').textContent = randomQuote.text;
        document.getElementById('author').textContent = `— ${randomQuote.author}`;
        
        // تفعيل زر الصوت
        document.getElementById('speak-btn').onclick = () => {
            const speech = new SpeechSynthesisUtterance();
            speech.text = `${randomQuote.text} بقلم ${randomQuote.author}`;
            speech.lang = 'ar-SA';
            window.speechSynthesis.speak(speech);
        };
    } catch (err) {
        console.error("خطأ في جلب الاقتباسات:", err);
        document.getElementById('quote').textContent = "“عذرًا، حدث خطأ غير متوقع!”";
    }
}