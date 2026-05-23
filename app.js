// ==========================================
// 🎯 الإعدادات العامة والروابط الإعلانية
// ==========================================
const ACTIVE_AD_SMARTLINK = "https://omg10.com/4/11047850"; 
const GLOBAL_ADMIN_GOOGLE_EMAIL = "smaktodg@gmail.com"; 

// ==========================================
// 🔗 مفاتيح الربط السحابي الحية لـ Supabase
// ==========================================
const SUPABASE_URL = "https://mdwwljcopsrogmg2y4if.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kd3dsamNvc3JvZ21nMnk0aWYiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc2Nzg5Njk1NiwiZXhwIjoyMDgzNDcyOTU2fQ.8mIWhw3X0K2Xg8ZqD_G7K9-YI-gM1X0w5Z_L9X7X5X4";

// تهيئة الاتصال بالسيرفر السحابي تلقائياً
let supabaseClient = null;
if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// متغير لحفظ بيانات جلسة المستخدم الحالي
let currentUserSession = null;

// ==========================================
// 🛠️ العمليات البرمجية والمصادقة لـ Google
// ==========================================

// دالة تسجيل الدخول الحية المحدثة لمنع الخطأ الأحمر
async function loginWithGoogle() {
    const status = document.getElementById('authModalStatus');
    status.textContent = "جاري تحويلك لصفحة الأمان في Google... ⏳";
    status.className = "text-[11px] text-center text-amber-400";

    // إذا لم تكن المكتبة محملة محلياً، يدخل في وضع محاكاة التطوير لتسهيل العمل
    if (!supabaseClient) {
        setTimeout(() => {
            currentUserSession = { username: "المطور_المحلي", email: GLOBAL_ADMIN_GOOGLE_EMAIL, provider: "google" };
            status.textContent = "تم الدخول بنجاح (وضع المحاكاة المحلي)! 🎉";
            status.className = "text-[11px] text-center text-emerald-400 font-bold";
            setTimeout(() => { 
                document.getElementById('authModal').classList.add('hidden'); 
                initializeUserSession(); 
            }, 1000);
        }, 1500);
        return;
    }

    // 🔥 الصياغة السليمة والحتمية لإصدار V2 للربط السحابي الحقيقي مع سوبابيس وجوجل
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin
        }
    });

    if (error) {
        status.textContent = `فشل الاتصال بـ Google: ${error.message}`;
        status.className = "text-[11px] text-center text-rose-500";
    }
}

// دالة لفحص حالة الجلسة وتطبيق الصلاحيات عند تحميل الموقع حياً
async function checkActiveSession() {
    if (!supabaseClient) return;

    const { data: { session }, error } = await supabaseClient.auth.getSession();
    
    if (session && session.user) {
        currentUserSession = {
            username: session.user.user_metadata.full_name || "لاعب_ترون",
            email: session.user.email,
            provider: "google"
        };
        initializeUserSession();
    }
}

// دالة تهيئة الواجهة ومنح الصلاحيات الإدارية الفائقة
function initializeUserSession() {
    if (!currentUserSession) return;

    console.log("تم رصد مستخدم نشط:", currentUserSession.email);
    
    // التحقق الفوري هل البريد الحالي هو بريدك الإداري الفائق؟
    if (currentUserSession.email.toLowerCase() === GLOBAL_ADMIN_GOOGLE_EMAIL.toLowerCase()) {
        alert(`أهلاً بك يا سيادة المسؤول العام! تم تفعيل لوحة الإدارة الفائقة بنجاح 👑`);
        // هنا يمكنك إظهار أزرار الإدارة الفائقة الخاصة بموقعك تلقائياً
    } else {
        console.log("مرحبًا بك في منصة اللعب كلاعب عادي.");
    }
}

// تشغيل الفحص التلقائي للجلسة بمجرد فتح الصفحة
window.addEventListener('DOMContentLoaded', () => {
    checkActiveSession();
});
