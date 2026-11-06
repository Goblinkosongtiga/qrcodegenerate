(function () {
    'use strict';

    // ===== DOM References =====
    const urlInput       = document.getElementById('urlInput');
    const generateBtn    = document.getElementById('generateBtn');
    const resetBtn       = document.getElementById('resetBtn');
    const sizeSelect     = document.getElementById('sizeSelect');
    const colorDark      = document.getElementById('colorDark');
    const colorLight     = document.getElementById('colorLight');
    const errorLevel     = document.getElementById('errorLevel');
    const qrContainer    = document.getElementById('qrContainer');
    const downloadPngBtn = document.getElementById('downloadPngBtn');
    const copyUrlBtn     = document.getElementById('copyUrlBtn');
    const historySection = document.getElementById('historySection');
    const historyList    = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const downloadHistoryBtn = document.getElementById('downloadHistoryBtn');

    // ===== Constants =====
    const HISTORY_KEY = 'qr_generator_history';
    const MAX_HISTORY = 10;

    // ===== State =====
    let lastValidUrl = '';

    // ===== Helpers =====
    function normalizeUrl(raw) {
        const trimmed = raw.trim();
        if (!trimmed) return null;
        if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed;
        return 'https://' + trimmed;
    }

    function showError(message) {
        alert(message);
    }

    // ===== LocalStorage History =====
    function loadHistory() {
        try {
            const raw = localStorage.getItem(HISTORY_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch { return []; }
    }

    function saveHistory(list) {
        try { localStorage.setItem(HISTORY_KEY, JSON.stringify(list)); } catch {}
    }

    function renderHistory() {
        const list = loadHistory();
        historyList.innerHTML = '';

        if (list.length === 0) {
            historySection.hidden = true;
            return;
        }

        historySection.hidden = false;

        list.forEach((url) => {
            const li = document.createElement('li');
            const span = document.createElement('span');
            span.textContent = url;
            span.title = url;

            const delBtn = document.createElement('button');
            delBtn.textContent = '✕';
            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const updated = loadHistory().filter((item) => item !== url);
                saveHistory(updated);
                renderHistory();
            });

            li.appendChild(span);
            li.appendChild(delBtn);
            li.addEventListener('click', () => {
                urlInput.value = url;
                generateQr();
            });

            historyList.appendChild(li);
        });
    }

    // ===== Core: Generate QR =====
    function pushHistory(url) {
        const list = loadHistory().filter((item) => item !== url);
        list.unshift(url);
        saveHistory(list.slice(0, MAX_HISTORY));
        renderHistory();

        // Kirim ke Backend Vercel -> GitHub
        fetch('/api/save-history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url })
        })
        .then(res => res.json())
        .then(data => {
            if(data.success) console.log("✅ Riwayat tercatat di GitHub!");
        })
        .catch(err => console.error("❌ Gagal ke backend:", err));
    }

    function generateQr() {
        const url = normalizeUrl(urlInput.value);
        if (!url) {
            showError('Silakan masukkan link/URL terlebih dahulu!');
            urlInput.focus();
            return;
        }

        // Cek apakah library sudah termuat
        if (typeof QRCode === 'undefined') {
            showError("Library QR belum termuat. Coba refresh (F5) halaman ini.");
            return;
        }

        qrContainer.innerHTML = '';
        const size = parseInt(sizeSelect.value, 10) || 256;
        const canvas = document.createElement('canvas');
        qrContainer.appendChild(canvas);

        // Gunakan API bawaan library
        QRCode.toCanvas(canvas, url, {
            width: size,
            margin: 2, 
            color: {
                dark: colorDark.value,
                light: colorLight.value
            },
            errorCorrectionLevel: errorLevel.value
        }, function (error) {
            if (error) {
                showError('Gagal membuat QR Code.');
                console.error(error);
                return;
            }
            
            lastValidUrl = url;
            urlInput.value = url;
            downloadPngBtn.disabled = false;
            copyUrlBtn.disabled = false;
            
            pushHistory(url);
        });
    }

    // ===== Reset =====
    function resetAll() {
        urlInput.value = '';
        qrContainer.innerHTML = '<span class="placeholder">QR Code akan muncul di sini</span>';
        downloadPngBtn.disabled = true;
        copyUrlBtn.disabled = true;
        lastValidUrl = '';
        sizeSelect.value = '256';
        colorDark.value = '#000000';
        colorLight.value = '#ffffff';
        errorLevel.value = 'H';
        urlInput.focus();
    }

    // ===== Download PNG =====
    function downloadPng() {
        const canvas = qrContainer.querySelector('canvas');
        if (!canvas) return;

        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `qrcode-${Date.now()}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // ===== Copy URL =====
    async function copyUrl() {
        if (!lastValidUrl) return;
        try {
            await navigator.clipboard.writeText(lastValidUrl);
            const original = copyUrlBtn.textContent;
            copyUrlBtn.textContent = '✅ Tersalin!';
            setTimeout(() => { copyUrlBtn.textContent = original; }, 1500);
        } catch {
            urlInput.select();
            document.execCommand('copy');
        }
    }

    // ===== Download Riwayat Lokal ke .txt =====
    function downloadHistoryToTxt() {
        const list = loadHistory();
        if (list.length === 0) {
            showError("Belum ada riwayat untuk disimpan.");
            return;
        }

        let textContent = "--- RIWAYAT GENERATE QR CODE (LOKAL) ---\n";
        textContent += `Tanggal: ${new Date().toLocaleString('id-ID')}\n\n`;
        list.forEach((url, index) => {
            textContent += `${index + 1}. ${url}\n`;
        });

        const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
        const urlBlob = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = urlBlob;
        link.download = 'riwayat.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(urlBlob);
    }

    // ===== Event Listeners =====
    generateBtn.addEventListener('click', generateQr);
    resetBtn.addEventListener('click', resetAll);
    downloadPngBtn.addEventListener('click', downloadPng);
    copyUrlBtn.addEventListener('click', copyUrl);
    downloadHistoryBtn.addEventListener('click', downloadHistoryToTxt);

    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const dark = e.target.getAttribute('data-dark');
            const light = e.target.getAttribute('data-light');
            colorDark.value = dark;
            colorLight.value = light;
            if (urlInput.value.trim() !== '') generateQr();
        });
    });

    clearHistoryBtn.addEventListener('click', () => {
        if (confirm('Hapus semua riwayat lokal?')) {
            localStorage.removeItem(HISTORY_KEY);
            renderHistory();
        }
    });

    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            generateQr();
        }
    });

    // ===== Init =====
    renderHistory();
    urlInput.focus();
})();
