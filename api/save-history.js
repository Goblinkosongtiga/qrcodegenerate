
// api/save-history.js
export default async function handler(req, res) {
    // Hanya izinkan metode POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL tidak boleh kosong' });
    }

    // Konfigurasi Repositori GitHub Anda
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO_OWNER = 'Goblinkosongtiga'; // GANTI DENGAN USERNAME GITHUB ANDA
    const REPO_NAME = 'qrcodedegenerate';  // GANTI DENGAN NAMA REPO ANDA
    const FILE_PATH = 'riwayat.txt';       // File target

    // URL API GitHub untuk mengambil/mengedit file
    const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
    const headers = {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Vercel-QR-App'
    };

    try {
        // 1. Ambil isi file riwayat.txt saat ini (jika ada)
        let currentContent = "";
        let sha = null;

        const getRes = await fetch(apiUrl, { headers });
        if (getRes.ok) {
            const data = await getRes.json();
            // GitHub mengembalikan konten dalam format Base64, kita decode
            currentContent = Buffer.from(data.content, 'base64').toString('utf-8');
            sha = data.sha; // SHA diperlukan untuk update file
        }

        // 2. Tambahkan data baru ke konten lama
        const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
        const newLine = `[${timestamp}] ${url}\n`;
        const updatedContent = currentContent + newLine;

        // 3. Ubah kembali ke Base64
        const encodedContent = Buffer.from(updatedContent).toString('base64');

        // 4. Kirim perintah ke GitHub untuk menyimpan file
        const putRes = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                ...headers,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Update riwayat: ${url}`, // Pesan commit
                content: encodedContent,
                sha: sha || undefined // Sertakan sha jika file sudah ada
            })
        });

        if (!putRes.ok) {
            const errorData = await putRes.json();
            throw new Error(errorData.message || 'Gagal update GitHub');
        }

        return res.status(200).json({ success: true, message: 'Riwayat tersimpan di GitHub' });

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: error.message });
    }
}
