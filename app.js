// ==========================================
// 🎯 الرابط الإعلاني وقناة المسؤول الفائقة
// ==========================================
const ACTIVE_AD_SMARTLINK = "https://omg10.com/4/11047850"; 

// 👑 بريدك الإلكتروني الخاص بـ Google لإعطائه صلاحيات المسؤول تلقائياً
const GLOBAL_ADMIN_GOOGLE_EMAIL = "smaktodg@gmail.com"; 

// ==========================================
// 🔗 إعدادات ومفاتيح الربط السحابي الحية (محدثة بالكامل من صورتك الأخيرة)
// ==========================================
const SUPABASE_URL = "https://mdwwljcopsrogmg2y4if.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_mdwWLjcOPSrogM-g2Y4ifA_IldOdbmP9";

// تهيئة عميل سوبابيس السحابي في المتصفح تلقائياً
let supabaseClient = null;
if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

let balance = 100.0000;
let currentUserSession = null;
let authMode = "login"; 

let adminSettings = {
    wallet: "T9xYOUR_PERSONAL_TRX_WALLET_ADDRESS_HERE", 
    minDeposit: 15,
    maxDeposit: 10000,
    houseEdgeRate: 50,
    isBanned: false
};

// جلب وتثبيت الإعدادات الإدارية المخزنة محلياً
if (localStorage.getItem('tronspin_admin_config')) {
    adminSettings = JSON.parse(localStorage.getItem('tronspin_admin_config'));
}

// ==========================================
// 🔐 إدارة الحسابات والربط الفعلي بـ GOOGLE AUTH
// ==========================================

// 1. دالة تسجيل الدخول الحقيقية بحساب جوجل السحابي
async function loginWithGoogle() {
    const status = document.getElementById('authModalStatus');
    status.textContent = "جاري تحويلك لصفحة الأمان في Google... ⏳";
    status.className = "text-[11px] text-center text-amber-400";

    if (!supabaseClient) {
        // وضع التطوير المحلي المؤقت في حال عدم اكتمال تحميل المكتبة الخارجية
        setTimeout(() => {
            currentUserSession = { username: "Admin_Gamer", email: GLOBAL_ADMIN_GOOGLE_EMAIL, provider: "google" };
            status.textContent = "تم الدخول بنجاح بحساب Google (وضع التطوير)! 🎉";
            status.className = "text-[11px] text-center text-emerald-400 font-bold";
            setTimeout(() => { document.getElementById('authModal').classList.add('hidden'); initializeUserSession(); }, 1000);
        }, 1500);
        return;
    }

    // استدعاء نافذة المصادقة الرسمية والآمنة من جوجل عبر سوبابيس
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
    });

    if (error) {
        status.textContent = `فشل الاتصال بـ Google: ${error.message}`;
        status.className = "text-[11px] text-center text-rose-500";
    }
}

// 2. فحص حالة الجلسة السحابية الحية عند فتح الموقع وتحديثها
async function checkActiveSession() {
    if (!supabaseClient) return;

    const { data: { session }, error } = await supabaseClient.auth.getSession();
    if (session && session.user) {
        currentUserSession = {
            username: session.user.user_metadata.full_name || session.user.email.split('@')[0],
            email: session.user.email,
            provider: "google"
        };
        await fetchUserBalanceFromCloud(session.user.id);
        document.getElementById('authModal').classList.add('hidden');
        initializeUserSession();
    }
}

async function fetchUserBalanceFromCloud(userId) {
    if (!supabaseClient) return;
    let { data, error } = await supabaseClient.from('users_profiles').select('balance').eq('id', userId).single();
    if (data) { balance = data.balance; updateBalanceDisplay(); }
}

async function syncBalanceToCloud() {
    updateBalanceDisplay();
    if (!supabaseClient || !supabaseClient.auth.user()) return;
    const userId = supabaseClient.auth.user().id;
    await supabaseClient.from('users_profiles').update({ balance: balance }).eq('id', userId);
}

// معالجة نموذج التسجيل والتبديل العادي بالبريد/الهاتف وكلمة المرور
async function handleAuthSubmit(event) {
    event.preventDefault();
    const status = document.getElementById('authModalStatus');
    const username = document.getElementById('authUsername').value.trim();
    const emailPhone = document.getElementById('authEmailPhone').value.trim();
    const password = document.getElementById('authPassword').value;
    const confirmPassword = document.getElementById('authConfirmPassword').value;

    status.textContent = "جاري معالجة البيانات بأمان... ⏳";
    status.className = "text-[11px] text-center text-amber-400";

    if (authMode === 'signup') {
        if (password !== confirmPassword) {
            status.textContent = "تنبيه: كلمات المرور غير متطابقة! ❌";
            status.className = "text-[11px] text-center text-rose-500";
            return;
        }
        if (supabaseClient) {
            const { data, error } = await supabaseClient.auth.signUp({ email: emailPhone, password: password });
            if (error) { status.textContent = error.message; status.className = "text-[11px] text-center text-rose-500"; return; }
        }
        currentUserSession = { username: username, email: emailPhone, provider: "credentials" };
    } else {
        if (supabaseClient) {
            const { data, error } = await supabaseClient.auth.signInWithPassword({ email: emailPhone, password: password });
            if (error) { status.textContent = error.message; status.className = "text-[11px] text-center text-rose-500"; return; }
        }
        currentUserSession = { username: emailPhone.split('@')[0], email: emailPhone, provider: "credentials" };
    }

    status.textContent = "تم تسجيل الدخول بنجاح! 🚀";
    status.className = "text-[11px] text-center text-emerald-400 font-bold";
    setTimeout(() => { document.getElementById('authModal').classList.add('hidden'); initializeUserSession(); }, 1000);
}

function toggleAuthMode(mode) {
    authMode = mode;
    const usernameField = document.getElementById('usernameField');
    const confirmPasswordField = document.getElementById('confirmPasswordField');
    const btnLogin = document.getElementById('btnAuthLogin');
    const btnSignup = document.getElementById('btnAuthSignup');
    const submitBtn = document.getElementById('authSubmitBtn');

    if (mode === 'signup') {
        usernameField.classList.remove('hidden');
        confirmPasswordField.classList.remove('hidden');
        btnLogin.className = "py-2.5 rounded-lg text-gray-400";
        btnSignup.className = "py-2.5 rounded-lg bg-blue-600 text-white";
        submitBtn.textContent = "إنشاء حساب جديد وشحن الرصيد";
    } else {
        usernameField.classList.add('hidden');
        confirmPasswordField.classList.add('hidden');
        btnLogin.className = "py-2.5 rounded-lg bg-blue-600 text-white";
        btnSignup.className = "py-2.5 rounded-lg text-gray-400";
        submitBtn.textContent = "دخول للمنصة";
    }
}

function initializeUserSession() {
    if (!currentUserSession) return;
    
    document.getElementById('sidebarUsername').textContent = currentUserSession.username;
    if(document.getElementById('leaderboardSessionUser')) document.getElementById('leaderboardSessionUser').textContent = currentUserSession.username;
    document.getElementById('userAvatarIcon').textContent = currentUserSession.username.charAt(0).toUpperCase();

    // 🔒 التحقق الفائق من رتبة المسؤول بناءً على بريد جوجل المخصص لك حصرياً للتحكم التام
    if (currentUserSession.email.toLowerCase() === GLOBAL_ADMIN_GOOGLE_EMAIL.toLowerCase()) {
        document.getElementById('userRoleBadge').innerHTML = `<i class="fas fa-user-shield text-rose-500"></i> المسؤول العام`;
        document.getElementById('userRoleBadge').className = "text-xs text-rose-400 font-bold";
        document.getElementById('adminTabBtn').classList.remove('hidden'); 
    } else {
        document.getElementById('userRoleBadge').innerHTML = `<i class="fas fa-medal"></i> لاعب برونزي`;
        document.getElementById('userRoleBadge').className = "text-xs text-amber-500 font-mono";
        document.getElementById('adminTabBtn').classList.add('hidden');
    }

    updateBalanceDisplay();
}

async function logoutSession() {
    if (supabaseClient) await supabaseClient.auth.signOut();
    currentUserSession = null;
    balance = 100.0000;
    document.getElementById('authModal').classList.remove('hidden');
    document.getElementById('authForm').reset();
    document.getElementById('authModalStatus').textContent = "";
}

function updateBalanceDisplay() {
    checkBanStatus();
    const userBalanceEl = document.getElementById('userBalance');
    if (userBalanceEl) userBalanceEl.textContent = balance.toFixed(4);
    
    const winnings = document.getElementById('leaderboardUserWinnings');
    if (winnings) winnings.textContent = `${balance.toFixed(0)} TRX`;

    if(document.getElementById('depositWallet')) document.getElementById('depositWallet').textContent = adminSettings.wallet;
    if(document.getElementById('minDepositLabel')) document.getElementById('minDepositLabel').textContent = adminSettings.minDeposit;
    if(document.getElementById('maxDepositLabel')) document.getElementById('maxDepositLabel').textContent = adminSettings.maxDeposit;
}

function checkBanStatus() {
    const banScreen = document.getElementById('banScreen');
    if (adminSettings.isBanned) {
        if (banScreen) banScreen.classList.remove('hidden');
    } else {
        if (banScreen) banScreen.classList.add('hidden');
    }
}

function switchTab(tabId, element) {
    checkBanStatus();
    document.querySelectorAll('.main-tab').forEach(tab => tab.classList.add('hidden'));
    const targetTab = document.getElementById(`tab-${tabId}`);
    if (targetTab) targetTab.classList.remove('hidden');
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('bg-gray-800', 'text-blue-400');
        btn.classList.add('text-gray-400', 'hover:bg-gray-800/50');
    });
    if (element) {
        element.classList.remove('text-gray-400', 'hover:bg-gray-800/50');
        element.classList.add('bg-gray-800', 'text-blue-400');
    }
    if (tabId === 'admin') {
        document.getElementById('adminWalletInput').value = adminSettings.wallet;
        document.getElementById('adminMinDepInput').value = adminSettings.minDeposit;
        document.getElementById('adminMaxDepInput').value = adminSettings.maxDeposit;
        document.getElementById('adminWinRateSlider').value = adminSettings.houseEdgeRate;
        document.getElementById('currentRateLabel').textContent = `${adminSettings.houseEdgeRate}%`;
    }
}

function switchGame(gameId, element) {
    checkBanStatus();
    document.querySelectorAll('.game-section').forEach(sec => sec.classList.add('hidden'));
    const selectedGame = document.getElementById(`game-${gameId}`);
    if (selectedGame) selectedGame.classList.remove('hidden');

    document.querySelectorAll('.game-nav-btn').forEach(btn => {
        btn.classList.remove('bg-blue-600', 'text-white');
        btn.classList.add('text-gray-400', 'hover:bg-gray-900');
    });
    if (element) {
        element.classList.remove('text-gray-400', 'hover:bg-gray-900');
        element.classList.add('bg-blue-600', 'text-white');
    }
}

function claimPromoCode() {
    const codeInput = document.getElementById('promoCodeInput');
    const status = document.getElementById('promoStatus');
    if (!codeInput || !status) return;
    const enteredCode = codeInput.value.trim().toUpperCase();

    if (enteredCode === "TRON50") {
        balance += 50.0000; syncBalanceToCloud();
        status.textContent = "صحيح! تم إضافة +50 TRX 🎉";
        status.className = "text-[10px] text-center text-emerald-400 font-bold"; codeInput.value = "";
    } else if (enteredCode === "MAHROUZ") {
        balance += 10.0000; syncBalanceToCloud();
        status.textContent = "تم تعبئة كود المطور +10 TRX 🎁";
        status.className = "text-[10px] text-center text-emerald-400 font-bold"; codeInput.value = "";
    } else {
        status.textContent = "كود قسيمة منتهي أو خاطئ! ❌"; status.className = "text-[10px] text-center text-rose-500";
    }
    setTimeout(() => { status.textContent = ""; }, 3500);
}

function openNewAdNetwork() {
    checkBanStatus();
    const earnStatus = document.getElementById('earnStatus');
    if (!earnStatus) return;
    earnStatus.textContent = "جاري فتح الإعلان الموثوق ونقل المكافأة... 🎉";
    earnStatus.className = "text-sm font-semibold text-center text-emerald-400 mt-4 win-glow";
    window.open(ACTIVE_AD_SMARTLINK, '_blank');
    balance += 0.2500;
    syncBalanceToCloud();
}

function simulateDeposit() {
    checkBanStatus();
    const amountInput = document.getElementById('simulateDepositInput');
    const status = document.getElementById('depositStatus');
    if (!amountInput || !status) return;
    const depositAmount = parseFloat(amountInput.value);
    
    if (isNaN(depositAmount) || depositAmount < adminSettings.minDeposit || depositAmount > adminSettings.maxDeposit) {
        status.textContent = `عذراً القيمة خارج النطاق المسموح به للشحن حالياً!`;
        status.className = "text-[10px] text-center text-rose-500 mt-1";
        return;
    }
    balance += depositAmount; syncBalanceToCloud(); amountInput.value = "";
    status.textContent = `تم تأكيد إرسال الشحنة لعنوان المسؤول بنجاح وشحن الرصيد! 🚀`;
    status.className = "text-[10px] text-center text-emerald-400 mt-1 font-bold win-glow";
}

function toggleWalletAction(actionType) {
    const depositDiv = document.getElementById('wallet-deposit');
    const withdrawDiv = document.getElementById('wallet-withdraw');
    if (actionType === 'deposit') {
        if (depositDiv) depositDiv.classList.remove('hidden');
        if (withdrawDiv) withdrawDiv.classList.add('hidden');
    } else {
        if (depositDiv) depositDiv.classList.add('hidden');
        if (withdrawDiv) withdrawDiv.classList.remove('hidden');
    }
}
function copyWallet() {
    navigator.clipboard.writeText(adminSettings.wallet);
    alert('تم نسخ عنوان محفظة المسؤول المالي بنجاح!');
}
function processWithdrawal() {
    checkBanStatus();
    const amountEl = document.getElementById('withdrawAmount');
    const status = document.getElementById('walletStatus');
    if (!amountEl || !status) return;
    const amount = parseFloat(amountEl.value);
    if (isNaN(amount) || amount <= 0 || amount > balance) return alert('مبلغ خاطئ أو رصيد غير كافٍ!');
    balance -= amount; syncBalanceToCloud(); amountEl.value = "";
    status.textContent = "طلب السحب قيد المراجعة اليدوية الآمنة! 📥"; status.className = "text-sm font-semibold text-center text-emerald-400 mt-2";
}

function submitTicket() {
    checkBanStatus();
    const msgEl = document.getElementById('supportMsg');
    const status = document.getElementById('supportStatus');
    if (!msgEl || msgEl.value.trim() === "") return alert('اكتب مشكلتك أولاً!');
    status.textContent = "تم تسجيل تذكرتك بنجاح! سيقوم الدعم بالرد خلال 12 ساعة.";
    status.className = "text-sm font-semibold text-center text-emerald-400 mt-2 win-glow"; msgEl.value = "";
}

document.addEventListener('input', (e) => {
    if (e.target && e.target.id === 'adminWinRateSlider') {
        document.getElementById('currentRateLabel').textContent = `${e.target.value}%`;
    }
});
function setAccountBanStatus(status) {
    adminSettings.isBanned = status;
    localStorage.setItem('tronspin_admin_config', JSON.stringify(adminSettings));
    alert(status ? "تم تفعيل حظر الحساب الحالي بنجاح! سيتم عزله فوراً." : "تم إلغاء الحظر.");
}
function saveAdminSettings() {
    adminSettings.wallet = document.getElementById('adminWalletInput').value.trim();
    adminSettings.minDeposit = parseFloat(document.getElementById('adminMinDepInput').value) || 0;
    adminSettings.maxDeposit = parseFloat(document.getElementById('adminMaxDepInput').value) || 0;
    adminSettings.houseEdgeRate = parseInt(document.getElementById('adminWinRateSlider').value) || 50;
    localStorage.setItem('tronspin_admin_config', JSON.stringify(adminSettings));
    alert('🔐 تم تحديث وحفظ قيم التحكم المركزي وإدارة العوائد بنجاح!');
    updateBalanceDisplay();
}

// ==========================================
// 🛫 لعبة الطائرة والمضاعف (Crash) - بدون إعلانات منبثقة مزعجة عند الإقلاع
// ==========================================
const startCrashBtn = document.getElementById('startCrashBtn');
const cashoutCrashBtn = document.getElementById('cashoutCrashBtn');
const crashMultiplierDisplay = document.getElementById('crashMultiplierDisplay');
const crashPlaneLine = document.getElementById('crashPlaneLine');
const crashStatusEl = document.getElementById('crashStatus');

let crashInterval = null;
let currentCrashMultiplier = 1.00;
let crashPoint = 0.00;
let isCrashActive = false;
let crashBetAmount = 0;

if (startCrashBtn && cashoutCrashBtn) {
    startCrashBtn.addEventListener('click', () => {
        checkBanStatus();
        crashBetAmount = parseFloat(document.getElementById('betAmountCrash').value);
        if (isNaN(crashBetAmount) || crashBetAmount <= 0 || crashBetAmount > balance) { return alert('الرصيد غير كافٍ أو رهان خاطئ!'); }
        balance -= crashBetAmount; syncBalanceToCloud();
        isCrashActive = true; currentCrashMultiplier = 1.00;
        crashStatusEl.textContent = "الطائرة تحلق وتتصاعد حابسة للأنفاس حتى 20x! 🛫";
        crashMultiplierDisplay.className = "text-5xl font-black text-indigo-400 font-mono tracking-wide z-10";
        
        let calculatedMax = 1 + (19 * (1 - (adminSettings.houseEdgeRate / 100)));
        crashPoint = parseFloat((1 + Math.random() * calculatedMax).toFixed(2));
        
        startCrashBtn.classList.add('hidden'); cashoutCrashBtn.classList.remove('hidden'); cashoutCrashBtn.textContent = `كاش أوت (1.00x)`;
        crashInterval = setInterval(() => {
            currentCrashMultiplier += currentCrashMultiplier > 10 ? 0.15 : 0.05;
            crashMultiplierDisplay.textContent = `${currentCrashMultiplier.toFixed(2)}x`;
            cashoutCrashBtn.textContent = `كاش أوت (${(crashBetAmount * currentCrashMultiplier).toFixed(2)} TRX)`;
            let movement = Math.min((currentCrashMultiplier - 1) * 8, 140);
            crashPlaneLine.style.transform = `translate(${movement}px, -${movement}px)`;
            if (currentCrashMultiplier >= crashPoint) {
                clearInterval(crashInterval); isCrashActive = false; startCrashBtn.classList.remove('hidden'); cashoutCrashBtn.classList.add('hidden');
                crashMultiplierDisplay.textContent = `💥 BOOM!`; crashMultiplierDisplay.className = "text-5xl font-black text-rose-600 font-mono tracking-wide z-10";
                crashStatusEl.textContent = `انفجرت الطائرة عند ${crashPoint.toFixed(2)}x! حظاً أوفر.`; crashPlaneLine.style.transform = "translate(0px, 0px)";
            }
        }, 100);
    });
    cashoutCrashBtn.addEventListener('click', () => {
        if (!isCrashActive) return; clearInterval(crashInterval); isCrashActive = false;
        let totalWin = crashBetAmount * currentCrashMultiplier; balance += totalWin; dataSync = syncBalanceToCloud();
        startCrashBtn.classList.remove('hidden'); cashoutCrashBtn.classList.add('hidden');
        crashMultiplierDisplay.className = "text-5xl font-black text-emerald-400 font-mono tracking-wide z-10 win-glow";
        crashStatusEl.textContent = `كاش أوت ناجح! ربحت +${totalWin.toFixed(2)} TRX 🎉`; crashPlaneLine.style.transform = "translate(0px, 0px)";
    });
}

// لعبة النرد 
const rollDiceBtn = document.getElementById('rollDiceBtn');
const diceResultEl = document.getElementById('diceResult');
const diceStatusEl = document.getElementById('diceStatus');
if (rollDiceBtn) {
    rollDiceBtn.addEventListener('click', () => {
        checkBanStatus();
        let bet = parseFloat(document.getElementById('betAmountDice').value); if (isNaN(bet) || bet <= 0 || bet > balance) return alert('الرصيد غير كافٍ!');
        balance -= bet; syncBalanceToCloud();
        rollDiceBtn.disabled = true; diceResultEl.className = "text-5xl font-black my-2 font-mono dice-spinning"; diceResultEl.textContent = "🎲";
        setTimeout(() => {
            let isLossForced = (Math.random() * 100) < adminSettings.houseEdgeRate;
            let roll = isLossForced ? Math.floor(Math.random() * 50) + 1 : Math.floor(Math.random() * 50) + 51;
            diceResultEl.textContent = roll; rollDiceBtn.disabled = false;
            if (roll > 50) {
                balance += (bet * 2); diceResultEl.className = "text-5xl font-black text-emerald-400 my-2 font-mono win-glow";
                diceStatusEl.textContent = `فوز! ربحت +${(bet*2).toFixed(2)} TRX`;
            } else {
                diceResultEl.className = "text-5xl font-black text-rose-500 my-2 font-mono"; diceStatusEl.textContent = "خسارة النرد!";
            }
            syncBalanceToCloud();
        }, 600);
    });
}

// تشغيل الفحص التلقائي للجلسات فور الإقلاع
window.addEventListener('DOMContentLoaded', () => {
    checkActiveSession();
    updateBalanceDisplay();
});
