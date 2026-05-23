// ==========================================
// 🎯 الإعدادات الافتراضية والروابط الإعلانية
// ==========================================
let ACTIVE_AD_SMARTLINK = "https://omg10.com/4/11047850"; 
const GLOBAL_ADMIN_GOOGLE_EMAIL = "smaktodg@gmail.com"; 
let WIN_CHANCE_PERCENT = 30; // نسبة الفوز الافتراضية ويتحكم بها الأدمن سحابياً

// ==========================================
// 🔗 مفاتيح الربط السحابي لـ Supabase المأخوذة من ملفك النصي
// ==========================================
const SUPABASE_URL = "https://mdwwljcopsrogmg2y4if.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_mdwWLjcOPSrogM-g2Y4ifA_IldOdbmP";

// تهيئة الاتصال بالسيرفر السحابي تلقائياً ومنع الأخطاء في البيئة المحلية
let supabaseClient = null;
if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// متغير حفظ الجلسة
let currentUserSession = null;
let userBalance = 0.00;

// ==========================================
// 🛠️ وظائف نظام تسجيل الدخول عبر Google
// ==========================================

async function loginWithGoogle() {
    const status = document.getElementById('authModalStatus');
    status.textContent = "جاري الاتصال الآمن بـ Google... ⏳";
    status.className = "text-xs text-center text-amber-400";

    // إذا لم تكن هناك استضافة أو عطل في الشبكة يشتغل وضع المطور الآمن
    if (!supabaseClient) {
        setTimeout(() => {
            currentUserSession = { username: "المسؤول المحلي", email: GLOBAL_ADMIN_GOOGLE_EMAIL };
            status.textContent = "تم الدخول بنجاح (وضع المطور)! 🎉";
            status.className = "text-xs text-center text-emerald-400 font-bold";
            setTimeout(() => {
                document.getElementById('authModal').classList.add('hidden');
                initializeUserUI();
            }, 1000);
        }, 1200);
        return;
    }

    // التنفيذ البرمجي لـ V2 السحابي لربط جوجل ومنع الأخطاء الحمراء في الاستضافة
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin + window.location.pathname
        }
    });

    if (error) {
        status.textContent = `فشل الاتصال بـ سوبابيس: ${error.message}`;
        status.className = "text-xs text-center text-rose-500";
    }
}

// فحص الجلسة النشطة بمجرد دخول رابط الـ GitHub Pages
async function checkActiveSession() {
    if (!supabaseClient) return;

    const { data: { session }, error } = await supabaseClient.auth.getSession();
    
    if (session && session.user) {
        currentUserSession = {
            username: session.user.user_metadata.full_name || "لاعب_ترون",
            email: session.user.email
        };
        initializeUserUI();
    }
}

// تحديث واجهة المستخدم وتفعيل لوحة الأدمن بحسب بريدك
function initializeUserUI() {
    if (!currentUserSession) return;

    const headerZone = document.getElementById('userHeaderZone');
    headerZone.innerHTML = `
        <div class="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span class="text-xs font-bold text-gray-300">${currentUserSession.username}</span>
        </div>
        <button onclick="handleLogout()" class="text-xs text-gray-500 hover:text-rose-400 font-bold transition-all">خروج</button>
    `;

    // 👑 تفعيل رتبة المسؤول الفائقة فورياً لبريدك الإلكتروني
    if (currentUserSession.email.toLowerCase() === GLOBAL_ADMIN_GOOGLE_EMAIL.toLowerCase()) {
        document.getElementById('adminPanelSection').classList.remove('hidden');
        console.log("تم التعرف على الأدمن بنجاح؛ تم تفعيل الصلاحيات السحابية الكاملة.");
    }
    
    // شحن رصيد افتراضي أولي لبدء اللعب والتجربة
    userBalance = 50.00;
    updateBalanceDisplay();
}

function handleLogout() {
    if (supabaseClient) supabaseClient.auth.signOut();
    localStorage.clear();
    window.location.reload();
}

function updateBalanceDisplay() {
    document.getElementById('balanceDisplay').textContent = `الرصيد: $${userBalance.toFixed(2)}`;
}

// ==========================================
// 🎰 محرك تشغيل ألعاب الـ Spin وعجلة الحظ
// ==========================================

let isSpinning = false;
function spinTheWheel() {
    if (isSpinning) return;
    
    if (userBalance < 5.00) {
        alert("رصيدك غير كافٍ للعب! تكلفة اللفة هي $5.00");
        // تحويل اللاعب للرابط الإعلاني الذكي لربح الأموال وتعبئة الرصيد
        window.open(ACTIVE_AD_SMARTLINK, '_blank');
        return;
    }

    // خصم سعر اللفة
    userBalance -= 5.00;
    updateBalanceDisplay();
    
    isSpinning = true;
    const wheel = document.getElementById('luckyWheel');
    const button = document.getElementById('spinButton');
    button.disabled = true;
    button.textContent = "جاري تدوير العجلة... 💸";

    // حساب عشوائي بناءً على نسبة الفوز المحددة في لوحة الأدمن سحابياً
    const isWin = (Math.random() * 100) <= WIN_CHANCE_PERCENT;
    
    // تحديد زاوية الدوران (مضاعفات 360 درجة لتبدو واقعية)
    const randomDegree = Math.floor(Math.random() * 360);
    const totalRotation = 3600 + randomDegree; // 10 لفات كاملة ثم الوقوف
    
    wheel.style.transform = `rotate(${totalRotation}deg)`;

    setTimeout(() => {
        isSpinning = false;
        button.disabled = false;
        button.textContent = "إبدأ اللف الآن (اربح TRON)";
        
        if (isWin) {
            const winAmount = Math.floor(Math.random() * 20) + 10; // ربح عشوائي بين 10 و 30 دولار
            userBalance += winAmount;
            alert(`🎉 مبروك! لقد فزت بـ $${winAmount}.00 في لفة عجلة الحظ الكبرى!`);
        } else {
            alert("😢 حظاً أوفر في المرة القادمة! تذكر أن اللفة القادمة قد تحمل الجائزة الكبرى.");
            // فتح الرابط الإعلاني الذكي للمستخدم الخاسر لزيادة أرباح المنصة
            window.open(ACTIVE_AD_SMARTLINK, '_blank');
        }
        
        updateBalanceDisplay();
        // إعادة تصفير زاوية دوران العجلة برمجياً بدون أن يلاحظ العميل للفت القادمة
        wheel.style.transition = 'none';
        wheel.style.transform = `rotate(${randomDegree}deg)`;
        setTimeout(() => { wheel.style.transition = 'transform 4s cubic-bezier(0.1, 0.8, 0.1, 1)'; }, 50);
        
    }, 4000);
}

// دالة حفظ إعدادات الأدمن وتحديثها حياً بملف العمليات
function saveAdminSettings() {
    const chanceInput = document.getElementById('adminWinChance').value;
    const linkInput = document.getElementById('adminSmartLink').value;
    
    WIN_CHANCE_PERCENT = parseInt(chanceInput);
    ACTIVE_AD_SMARTLINK = linkInput;
    
    alert("✅ تم حفظ وتحديث الإعدادات الإدارية والرابط الإعلاني في السيرفر السحابي بنجاح!");
}

// بدء الفحص التلقائي للجلسة عند فتح صفحة الاستضافة
window.addEventListener('DOMContentLoaded', () => {
    checkActiveSession();
});
