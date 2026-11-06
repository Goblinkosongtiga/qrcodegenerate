/* ============================================================
   QR Code Generator — Client-side only (no database)
   ============================================================ */

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

    // ===== Constants =====
    const HISTORY_KEY = 'qr_generator_history';
    const MAX_HISTORY = 5;

    // ===== State =====
    let lastValidUrl = '';

    // ===== Helpers =====

    /**
     * Normalisasi URL: tambahkan https:// jika belum ada scheme.
     * Kembalikan null jika kosong.
     */
    function normalizeUrl(raw) {
        const trimmed = raw.trim();
        if (!trimmed) return null;

        // Jika sudah punya scheme (http, https, mailto, tel, dll) biarkan
        if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
            return trimmed;
        }
        return 'https://' + trimmed;
    }

    /**
     * Tampilkan pesan error halus dengan alert (bisa diganti toast).
     */
    function showError(message) {
        alert(message);
    }

    /**
     * Ambil data URL dari QR (canvas atau img).
     */
    function getQrDataUrl() {
        const canvas = qrContainer.querySelector('canvas');
        if (canvas) return canvas.toDataURL('image/png');

        const img = qrContainer.querySelector('img');
        if (img) return img.src;

        return null;
    }

    /**
     * Muat riwayat dari localStorage.
     */
    function loadHistory() {
        try {
            const raw = localStorage.getItem(HISTORY_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    /**
     * Simpan riwayat ke localStorage.
     */
    function saveHistory(list) {
        try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
        } catch {
            /* localStorage penuh / disabled — abaikan */
        }
    }

    /**
     * Tambahkan URL ke riwayat (unik, terbaru di atas).
     */
    function pushHistory(url) {
        const list = loadHistory().filter((item) => item !== url);
        list.unshift(url);
        saveHistory(list.slice(0, MAX_HISTORY));
        renderHistory();
    }

    /**
     * Render daftar riwayat.
     */
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
            delBtn.title = 'Hapus dari riwayat';
            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const updated = loadHistory().filter((item) => item !== url);
                saveHistory(updated);
                renderHistory();
            });

            li.appendChild(span);
            li.appendChild(delBtn);

            // Klik item -> isi input & generate
            li.addEventListener('click', () => {
                urlInput.value = url;
                generateQr();
            });

            historyList.appendChild(li);
        });
    }

    // ===== Core: Generate QR =====

    function generateQr() {
        const url = normalizeUrl(urlInput.value);

        if (!url) {
            showError('Silakan masukkan link/URL terlebih dahulu!');
            urlInput.focus();
            return;
        }

        // Bersihkan container
        qrContainer.innerHTML = '';

        const size = parseInt(sizeSelect.value, 10) || 256;
        const levelMap = {
            L: QRCode.CorrectLevel.L,
            M: QRCode.CorrectLevel.M,
            Q: QRCode.CorrectLevel.Q,
            H: QRCode.CorrectLevel.H,
        };

        try {
            // eslint-disable-next-line no-new
            new QRCode(qrContainer, {
                text: url,
                width: size,
                height: size,
                colorDark: colorDark.value,
                colorLight: colorLight.value,
                correctLevel: levelMap[errorLevel.value] ?? QRCode.CorrectLevel.H,
            });
        } catch (err) {
            showError('Gagal membuat QR Code. Pastikan URL valid.');
            console.error(err);
            return;
        }

        lastValidUrl = url;
        urlInput.value = url;

        downloadPngBtn.disabled = false;
        copyUrlBtn.disabled = false;

        pushHistory(url);
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
        const dataUrl = getQrDataUrl();
        if (!dataUrl) return;

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
            setTimeout(() => {
                copyUrlBtn.textContent = original;
            }, 1500);
        } catch {
            // Fallback untuk browser lama
            urlInput.select();
            document.execCommand('copy');
            showError('URL disalin!');
        }
    }

    // ===== Event Listeners =====

    generateBtn.addEventListener('click', generateQr);

    resetBtn.addEventListener('click', resetAll);

    downloadPngBtn.addEventListener('click', downloadPng);

    copyUrlBtn.addEventListener('click', copyUrl);

    clearHistoryBtn.addEventListener('click', () => {
        if (confirm('Hapus semua riwayat?')) {
            localStorage.removeItem(HISTORY_KEY);
            renderHistory();
        }
    });

    // Enter di input = generate
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
