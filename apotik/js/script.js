// Konfigurasi API
const API_BASE = 'api';

// Fungsi utilitas
function showNotification(message, type = 'success') {
    // Implementasi notifikasi sederhana
    alert(`${type.toUpperCase()}: ${message}`);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
    }).format(amount);
}

// Fungsi navigasi
document.addEventListener('DOMContentLoaded', function() {
    // Setup navigation
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            showSection(target);
            
            // Update active button
            navButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Setup form submissions
    document.getElementById('dokterForm').addEventListener('submit', handleDokterSubmit);
    document.getElementById('pasienForm').addEventListener('submit', handlePasienSubmit);
    document.getElementById('obatForm').addEventListener('submit', handleObatSubmit);
    
    // Load initial data
    loadDashboardStats();
    loadDokter();
    loadPasien();
    loadObat();
});

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    document.getElementById(sectionId).classList.add('active');
    
    // Load section-specific data
    switch(sectionId) {
        case 'dashboard':
            loadDashboardStats();
            break;
        case 'dokter':
            loadDokter();
            break;
        case 'pasien':
            loadPasien();
            break;
        case 'obat':
            loadObat();
            break;
        case 'penjualan':
            loadPenjualan();
            break;
        case 'resep':
            loadResep();
            break;
    }
}

// API Functions
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}/${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        showNotification('Terjadi kesalahan saat memuat data', 'error');
        throw error;
    }
}

// Dashboard Functions
async function loadDashboardStats() {
    try {
        const [dokter, pasien, obat] = await Promise.all([
            apiCall('dokter.php'),
            apiCall('pasien.php'),
            apiCall('obat.php')
        ]);
        
        document.getElementById('total-dokter').textContent = dokter.length;
        document.getElementById('total-pasien').textContent = pasien.length;
        document.getElementById('total-obat').textContent = obat.length;
        
        const stokRendah = obat.filter(o => o.stok < 10).length;
        document.getElementById('stok-rendah').textContent = stokRendah;
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// Dokter Functions
function showDokterForm(dokter = null) {
    const form = document.getElementById('dokter-form');
    const title = document.getElementById('form-dokter-title');
    
    if (dokter) {
        title.textContent = 'Edit Dokter';
        document.getElementById('dokter-id').value = dokter.id_dokter;
        document.getElementById('nama-dokter').value = dokter.nama_dokter;
        document.getElementById('spesialisasi').value = dokter.spesialisasi || '';
        document.getElementById('no-telepon-dokter').value = dokter.no_telepon || '';
        document.getElementById('alamat-dokter').value = dokter.alamat || '';
        document.getElementById('nomor-sip').value = dokter.nomor_sip || '';
    } else {
        title.textContent = 'Tambah Dokter Baru';
        document.getElementById('dokterForm').reset();
        document.getElementById('dokter-id').value = '';
    }
    
    form.style.display = 'block';
}

function hideDokterForm() {
    document.getElementById('dokter-form').style.display = 'none';
}

async function handleDokterSubmit(e) {
    e.preventDefault();
    
    const formData = {
        nama_dokter: document.getElementById('nama-dokter').value,
        spesialisasi: document.getElementById('spesialisasi').value,
        no_telepon: document.getElementById('no-telepon-dokter').value,
        alamat: document.getElementById('alamat-dokter').value,
        nomor_sip: document.getElementById('nomor-sip').value
    };
    
    const dokterId = document.getElementById('dokter-id').value;
    const method = dokterId ? 'PUT' : 'POST';
    
    if (dokterId) {
        formData.id_dokter = dokterId;
    }
    
    try {
        await apiCall('dokter.php', {
            method: method,
            body: JSON.stringify(formData)
        });
        
        showNotification(`Dokter berhasil ${dokterId ? 'diupdate' : 'ditambahkan'}`);
        hideDokterForm();
        loadDokter();
    } catch (error) {
        showNotification('Gagal menyimpan data dokter', 'error');
    }
}

async function loadDokter() {
    try {
        const dokter = await apiCall('dokter.php');
        const container = document.getElementById('dokter-list');
        
        if (dokter.length === 0) {
            container.innerHTML = '<p>Tidak ada data dokter.</p>';
            return;
        }
        
        let html = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Nama Dokter</th>
                        <th>Spesialisasi</th>
                        <th>No Telepon</th>
                        <th>Nomor SIP</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        dokter.forEach(d => {
            html += `
                <tr>
                    <td>${d.nama_dokter}</td>
                    <td>${d.spesialisasi || '-'}</td>
                    <td>${d.no_telepon || '-'}</td>
                    <td>${d.nomor_sip || '-'}</td>
                    <td>
                        <button class="action-btn edit-btn" onclick="showDokterForm(${JSON.stringify(d).replace(/"/g, '&quot;')})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="deleteDokter(${d.id_dokter})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading dokter:', error);
    }
}

async function deleteDokter(id) {
    if (confirm('Apakah Anda yakin ingin menghapus dokter ini?')) {
        try {
            await apiCall('dokter.php', {
                method: 'DELETE',
                body: JSON.stringify({ id_dokter: id })
            });
            
            showNotification('Dokter berhasil dihapus');
            loadDokter();
        } catch (error) {
            showNotification('Gagal menghapus dokter', 'error');
        }
    }
}

// Pasien Functions (similar pattern as dokter)
function showPasienForm(pasien = null) {
    const form = document.getElementById('pasien-form');
    const title = document.getElementById('form-pasien-title');
    
    if (pasien) {
        title.textContent = 'Edit Pasien';
        document.getElementById('pasien-id').value = pasien.id_pasien;
        document.getElementById('nama-pasien').value = pasien.nama_pasien;
        document.getElementById('alamat-pasien').value = pasien.alamat || '';
        document.getElementById('no-telepon-pasien').value = pasien.no_telepon || '';
        document.getElementById('tanggal-lahir').value = pasien.tanggal_lahir || '';
        document.getElementById('jenis-kelamin').value = pasien.jenis_kelamin || 'L';
        document.getElementById('riwayat-penyakit').value = pasien.riwayat_penyakit || '';
    } else {
        title.textContent = 'Tambah Pasien Baru';
        document.getElementById('pasienForm').reset();
        document.getElementById('pasien-id').value = '';
    }
    
    form.style.display = 'block';
}

function hidePasienForm() {
    document.getElementById('pasien-form').style.display = 'none';
}

async function handlePasienSubmit(e) {
    e.preventDefault();
    
    const formData = {
        nama_pasien: document.getElementById('nama-pasien').value,
        alamat: document.getElementById('alamat-pasien').value,
        no_telepon: document.getElementById('no-telepon-pasien').value,
        tanggal_lahir: document.getElementById('tanggal-lahir').value,
        jenis_kelamin: document.getElementById('jenis-kelamin').value,
        riwayat_penyakit: document.getElementById('riwayat-penyakit').value
    };
    
    const pasienId = document.getElementById('pasien-id').value;
    const method = pasienId ? 'PUT' : 'POST';
    
    if (pasienId) {
        formData.id_pasien = pasienId;
    }
    
    try {
        await apiCall('pasien.php', {
            method: method,
            body: JSON.stringify(formData)
        });
        
        showNotification(`Pasien berhasil ${pasienId ? 'diupdate' : 'ditambahkan'}`);
        hidePasienForm();
        loadPasien();
    } catch (error) {
        showNotification('Gagal menyimpan data pasien', 'error');
    }
}

async function loadPasien() {
    try {
        const pasien = await apiCall('pasien.php');
        const container = document.getElementById('pasien-list');
        
        if (pasien.length === 0) {
            container.innerHTML = '<p>Tidak ada data pasien.</p>';
            return;
        }
        
        let html = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Nama Pasien</th>
                        <th>Alamat</th>
                        <th>No Telepon</th>
                        <th>Tanggal Lahir</th>
                        <th>Jenis Kelamin</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        pasien.forEach(p => {
            html += `
                <tr>
                    <td>${p.nama_pasien}</td>
                    <td>${p.alamat || '-'}</td>
                    <td>${p.no_telepon || '-'}</td>
                    <td>${p.tanggal_lahir || '-'}</td>
                    <td>${p.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                    <td>
                        <button class="action-btn edit-btn" onclick="showPasienForm(${JSON.stringify(p).replace(/"/g, '&quot;')})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="deletePasien(${p.id_pasien})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading pasien:', error);
    }
}

async function deletePasien(id) {
    if (confirm('Apakah Anda yakin ingin menghapus pasien ini?')) {
        try {
            await apiCall('pasien.php', {
                method: 'DELETE',
                body: JSON.stringify({ id_pasien: id })
            });
            
            showNotification('Pasien berhasil dihapus');
            loadPasien();
        } catch (error) {
            showNotification('Gagal menghapus pasien', 'error');
        }
    }
}

// Obat Functions (similar pattern)
function showObatForm(obat = null) {
    const form = document.getElementById('obat-form');
    const title = document.getElementById('form-obat-title');
    
    if (obat) {
        title.textContent = 'Edit Obat';
        document.getElementById('obat-id').value = obat.id_obat;
        document.getElementById('nama-obat').value = obat.nama_obat;
        document.getElementById('jenis-obat').value = obat.jenis_obat || '';
        document.getElementById('dosis').value = obat.dosis || '';
        document.getElementById('harga-obat').value = obat.harga || '';
        document.getElementById('stok-obat').value = obat.stok || '';
        document.getElementById('tanggal-kadaluarsa').value = obat.tanggal_kadaluarsa || '';
        document.getElementById('deskripsi-obat').value = obat.deskripsi || '';
    } else {
        title.textContent = 'Tambah Obat Baru';
        document.getElementById('obatForm').reset();
        document.getElementById('obat-id').value = '';
    }
    
    form.style.display = 'block';
}

function hideObatForm() {
    document.getElementById('obat-form').style.display = 'none';
}

async function handleObatSubmit(e) {
    e.preventDefault();
    
    const formData = {
        nama_obat: document.getElementById('nama-obat').value,
        jenis_obat: document.getElementById('jenis-obat').value,
        dosis: document.getElementById('dosis').value,
        harga: parseFloat(document.getElementById('harga-obat').value) || 0,
        stok: parseInt(document.getElementById('stok-obat').value) || 0,
        tanggal_kadaluarsa: document.getElementById('tanggal-kadaluarsa').value,
        deskripsi: document.getElementById('deskripsi-obat').value
    };
    
    const obatId = document.getElementById('obat-id').value;
    const method = obatId ? 'PUT' : 'POST';
    
    if (obatId) {
        formData.id_obat = obatId;
    }
    
    try {
        await apiCall('obat.php', {
            method: method,
            body: JSON.stringify(formData)
        });
        
        showNotification(`Obat berhasil ${obatId ? 'diupdate' : 'ditambahkan'}`);
        hideObatForm();
        loadObat();
    } catch (error) {
        showNotification('Gagal menyimpan data obat', 'error');
    }
}

async function loadObat() {
    try {
        const obat = await apiCall('obat.php');
        const container = document.getElementById('obat-list');
        
        if (obat.length === 0) {
            container.innerHTML = '<p>Tidak ada data obat.</p>';
            return;
        }
        
        let html = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Nama Obat</th>
                        <th>Jenis</th>
                        <th>Dosis</th>
                        <th>Harga</th>
                        <th>Stok</th>
                        <th>Kadaluarsa</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        obat.forEach(o => {
            const stokClass = o.stok < 10 ? 'style="color: red; font-weight: bold;"' : '';
            html += `
                <tr>
                    <td>${o.nama_obat}</td>
                    <td>${o.jenis_obat || '-'}</td>
                    <td>${o.dosis || '-'}</td>
                    <td>${formatCurrency(o.harga)}</td>
                    <td ${stokClass}>${o.stok}</td>
                    <td>${o.tanggal_kadaluarsa || '-'}</td>
                    <td>
                        <button class="action-btn edit-btn" onclick="showObatForm(${JSON.stringify(o).replace(/"/g, '&quot;')})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="deleteObat(${o.id_obat})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading obat:', error);
    }
}

async function deleteObat(id) {
    if (confirm('Apakah Anda yakin ingin menghapus obat ini?')) {
        try {
            await apiCall('obat.php', {
                method: 'DELETE',
                body: JSON.stringify({ id_obat: id })
            });
            
            showNotification('Obat berhasil dihapus');
            loadObat();
        } catch (error) {
            showNotification('Gagal menghapus obat', 'error');
        }
    }
}

// Fungsi untuk memuat data penjualan
async function loadPenjualan() {
    try {
        const penjualan = await apiCall('penjualan.php');
        const container = document.getElementById('penjualan-list');
        
        if (penjualan.length === 0) {
            container.innerHTML = '<p>Tidak ada data penjualan.</p>';
            return;
        }
        
        let html = `
            <div class="section-header">
                <h3>Daftar Penjualan</h3>
                <button class="btn-primary" onclick="showPenjualanForm()">Tambah Penjualan</button>
            </div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tanggal</th>
                        <th>Pasien</th>
                        <th>Total Harga</th>
                        <th>Metode Bayar</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        penjualan.forEach(p => {
            html += `
                <tr>
                    <td>${p.id_penjualan}</td>
                    <td>${p.tanggal_penjualan}</td>
                    <td>${p.nama_pasien || 'Non-Pasien'}</td>
                    <td>${formatCurrency(p.total_harga)}</td>
                    <td>${p.metode_pembayaran}</td>
                    <td>
                        <button class="action-btn view-btn" onclick="viewDetailPenjualan(${p.id_penjualan})" title="Lihat Detail">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading penjualan:', error);
        document.getElementById('penjualan-list').innerHTML = '<p>Error memuat data penjualan.</p>';
    }
}

// Fungsi untuk memuat data resep
async function loadResep() {
    try {
        const resep = await apiCall('resep.php');
        const container = document.getElementById('resep-list');
        
        if (resep.length === 0) {
            container.innerHTML = '<p>Tidak ada data resep.</p>';
            return;
        }
        
        let html = `
            <div class="section-header">
                <h3>Daftar Resep</h3>
                <button class="btn-primary" onclick="showResepForm()">Buat Resep Baru</button>
            </div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tanggal</th>
                        <th>Pasien</th>
                        <th>Dokter</th>
                        <th>Catatan</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        resep.forEach(r => {
            html += `
                <tr>
                    <td>${r.id_resep}</td>
                    <td>${r.tanggal_resep}</td>
                    <td>${r.nama_pasien}</td>
                    <td>${r.nama_dokter}</td>
                    <td>${r.catatan ? r.catatan.substring(0, 50) + '...' : '-'}</td>
                    <td>
                        <button class="action-btn view-btn" onclick="viewDetailResep(${r.id_resep})" title="Lihat Detail">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading resep:', error);
        document.getElementById('resep-list').innerHTML = '<p>Error memuat data resep.</p>';
    }
}

// Form untuk penjualan baru
function showPenjualanForm() {
    const formHtml = `
        <div class="form-container">
            <h3>Tambah Penjualan Baru</h3>
            <form id="penjualanForm">
                <div class="form-group">
                    <label>Pasien:</label>
                    <select id="penjualan-pasien">
                        <option value="">Pilih Pasien (Opsional)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Tanggal Penjualan:</label>
                    <input type="date" id="tanggal-penjualan" value="${new Date().toISOString().split('T')[0]}" required>
                </div>
                <div class="form-group">
                    <label>Metode Pembayaran:</label>
                    <select id="metode-pembayaran" required>
                        <option value="Tunai">Tunai</option>
                        <option value="Debit">Debit</option>
                        <option value="Kredit">Kredit</option>
                        <option value="QRIS">QRIS</option>
                        <option value="Transfer">Transfer</option>
                    </select>
                </div>
                
                <h4>Item Penjualan</h4>
                <div id="penjualan-items">
                    <div class="penjualan-item">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Obat:</label>
                                <select class="obat-select" onchange="updateHarga(this)" required>
                                    <option value="">Pilih Obat</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Harga Satuan:</label>
                                <input type="number" class="harga-satuan" readonly>
                            </div>
                            <div class="form-group">
                                <label>Jumlah:</label>
                                <input type="number" class="jumlah-obat" min="1" onchange="updateSubtotal(this)" required>
                            </div>
                            <div class="form-group">
                                <label>Subtotal:</label>
                                <input type="number" class="subtotal" readonly>
                            </div>
                            <button type="button" class="btn-danger" onclick="removeItem(this)">Hapus</button>
                        </div>
                    </div>
                </div>
                
                <button type="button" class="btn-secondary" onclick="addItem()">Tambah Item</button>
                
                <div class="form-group total-group">
                    <label>Total Harga:</label>
                    <input type="number" id="total-harga" readonly>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn-primary">Simpan Penjualan</button>
                    <button type="button" class="btn-secondary" onclick="hidePenjualanForm()">Batal</button>
                </div>
            </form>
        </div>
    `;
    
    document.getElementById('penjualan-list').innerHTML = formHtml;
    loadPasienOptions('penjualan-pasien');
    loadObatOptions();
    calculateTotal();
    
    document.getElementById('penjualanForm').addEventListener('submit', handlePenjualanSubmit);
}

// Form untuk resep baru
function showResepForm() {
    const formHtml = `
        <div class="form-container">
            <h3>Buat Resep Baru</h3>
            <form id="resepForm">
                <div class="form-group">
                    <label>Pasien:</label>
                    <select id="resep-pasien" required>
                        <option value="">Pilih Pasien</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Dokter:</label>
                    <select id="resep-dokter" required>
                        <option value="">Pilih Dokter</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Tanggal Resep:</label>
                    <input type="date" id="tanggal-resep" value="${new Date().toISOString().split('T')[0]}" required>
                </div>
                <div class="form-group">
                    <label>Catatan:</label>
                    <textarea id="catatan-resep" placeholder="Catatan untuk pasien..."></textarea>
                </div>
                
                <h4>Item Resep</h4>
                <div id="resep-items">
                    <div class="resep-item">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Obat:</label>
                                <select class="obat-resep-select" required>
                                    <option value="">Pilih Obat</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Jumlah:</label>
                                <input type="number" class="jumlah-resep" min="1" required>
                            </div>
                            <div class="form-group">
                                <label>Instruksi Penggunaan:</label>
                                <input type="text" class="instruksi-resep" placeholder="Contoh: 3x1 sehari setelah makan" required>
                            </div>
                            <button type="button" class="btn-danger" onclick="removeResepItem(this)">Hapus</button>
                        </div>
                    </div>
                </div>
                
                <button type="button" class="btn-secondary" onclick="addResepItem()">Tambah Item Resep</button>
                
                <div class="form-actions">
                    <button type="submit" class="btn-primary">Simpan Resep</button>
                    <button type="button" class="btn-secondary" onclick="hideResepForm()">Batal</button>
                </div>
            </form>
        </div>
    `;
    
    document.getElementById('resep-list').innerHTML = formHtml;
    loadPasienOptions('resep-pasien');
    loadDokterOptions();
    loadObatOptionsResep();
    
    document.getElementById('resepForm').addEventListener('submit', handleResepSubmit);
}

// Fungsi utilitas untuk penjualan dan resep
function hidePenjualanForm() {
    loadPenjualan();
}

function hideResepForm() {
    loadResep();
}

async function loadPasienOptions(selectId) {
    try {
        const pasien = await apiCall('pasien.php');
        const select = document.getElementById(selectId);
        
        pasien.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id_pasien;
            option.textContent = p.nama_pasien;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading pasien options:', error);
    }
}

async function loadDokterOptions() {
    try {
        const dokter = await apiCall('dokter.php');
        const select = document.getElementById('resep-dokter');
        
        dokter.forEach(d => {
            const option = document.createElement('option');
            option.value = d.id_dokter;
            option.textContent = d.nama_dokter + ' - ' + d.spesialisasi;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading dokter options:', error);
    }
}

async function loadObatOptions() {
    try {
        const obat = await apiCall('obat.php');
        const selects = document.querySelectorAll('.obat-select');
        
        selects.forEach(select => {
            select.innerHTML = '<option value="">Pilih Obat</option>';
            obat.forEach(o => {
                if (o.stok > 0) {
                    const option = document.createElement('option');
                    option.value = o.id_obat;
                    option.textContent = `${o.nama_obat} - ${formatCurrency(o.harga)} (Stok: ${o.stok})`;
                    option.dataset.harga = o.harga;
                    select.appendChild(option);
                }
            });
        });
    } catch (error) {
        console.error('Error loading obat options:', error);
    }
}

async function loadObatOptionsResep() {
    try {
        const obat = await apiCall('obat.php');
        const selects = document.querySelectorAll('.obat-resep-select');
        
        selects.forEach(select => {
            select.innerHTML = '<option value="">Pilih Obat</option>';
            obat.forEach(o => {
                const option = document.createElement('option');
                option.value = o.id_obat;
                option.textContent = `${o.nama_obat} - ${o.dosis}`;
                select.appendChild(option);
            });
        });
    } catch (error) {
        console.error('Error loading obat options for resep:', error);
    }
}

function updateHarga(select) {
    const selectedOption = select.options[select.selectedIndex];
    const harga = selectedOption.dataset.harga || 0;
    const item = select.closest('.penjualan-item');
    item.querySelector('.harga-satuan').value = harga;
    updateSubtotal(item.querySelector('.jumlah-obat'));
}

function updateSubtotal(input) {
    const item = input.closest('.penjualan-item');
    const harga = parseFloat(item.querySelector('.harga-satuan').value) || 0;
    const jumlah = parseInt(input.value) || 0;
    const subtotal = harga * jumlah;
    
    item.querySelector('.subtotal').value = subtotal;
    calculateTotal();
}

function calculateTotal() {
    const subtotals = document.querySelectorAll('.subtotal');
    let total = 0;
    
    subtotals.forEach(subtotal => {
        total += parseFloat(subtotal.value) || 0;
    });
    
    document.getElementById('total-harga').value = total;
}

function addItem() {
    const itemsContainer = document.getElementById('penjualan-items');
    const newItem = document.createElement('div');
    newItem.className = 'penjualan-item';
    newItem.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label>Obat:</label>
                <select class="obat-select" onchange="updateHarga(this)" required>
                    <option value="">Pilih Obat</option>
                </select>
            </div>
            <div class="form-group">
                <label>Harga Satuan:</label>
                <input type="number" class="harga-satuan" readonly>
            </div>
            <div class="form-group">
                <label>Jumlah:</label>
                <input type="number" class="jumlah-obat" min="1" onchange="updateSubtotal(this)" required>
            </div>
            <div class="form-group">
                <label>Subtotal:</label>
                <input type="number" class="subtotal" readonly>
            </div>
            <button type="button" class="btn-danger" onclick="removeItem(this)">Hapus</button>
        </div>
    `;
    
    itemsContainer.appendChild(newItem);
    loadObatOptions();
}

function removeItem(button) {
    const items = document.querySelectorAll('.penjualan-item');
    if (items.length > 1) {
        button.closest('.penjualan-item').remove();
        calculateTotal();
    }
}

function addResepItem() {
    const itemsContainer = document.getElementById('resep-items');
    const newItem = document.createElement('div');
    newItem.className = 'resep-item';
    newItem.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label>Obat:</label>
                <select class="obat-resep-select" required>
                    <option value="">Pilih Obat</option>
                </select>
            </div>
            <div class="form-group">
                <label>Jumlah:</label>
                <input type="number" class="jumlah-resep" min="1" required>
            </div>
            <div class="form-group">
                <label>Instruksi Penggunaan:</label>
                <input type="text" class="instruksi-resep" placeholder="Contoh: 3x1 sehari setelah makan" required>
            </div>
            <button type="button" class="btn-danger" onclick="removeResepItem(this)">Hapus</button>
        </div>
    `;
    
    itemsContainer.appendChild(newItem);
    loadObatOptionsResep();
}

function removeResepItem(button) {
    const items = document.querySelectorAll('.resep-item');
    if (items.length > 1) {
        button.closest('.resep-item').remove();
    }
}

// Handler untuk submit penjualan
async function handlePenjualanSubmit(e) {
    e.preventDefault();
    
    const items = [];
    let isValid = true;
    
    document.querySelectorAll('.penjualan-item').forEach(item => {
        const id_obat = item.querySelector('.obat-select').value;
        const jumlah = item.querySelector('.jumlah-obat').value;
        const harga_satuan = item.querySelector('.harga-satuan').value;
        const subtotal = item.querySelector('.subtotal').value;
        
        if (!id_obat || !jumlah) {
            isValid = false;
            return;
        }
        
        items.push({
            id_obat: parseInt(id_obat),
            jumlah: parseInt(jumlah),
            harga_satuan: parseFloat(harga_satuan),
            subtotal: parseFloat(subtotal)
        });
    });
    
    if (!isValid || items.length === 0) {
        showNotification('Harap isi semua item penjualan dengan benar', 'error');
        return;
    }
    
    const formData = {
        id_pasien: document.getElementById('penjualan-pasien').value || null,
        tanggal_penjualan: document.getElementById('tanggal-penjualan').value,
        total_harga: parseFloat(document.getElementById('total-harga').value),
        metode_pembayaran: document.getElementById('metode-pembayaran').value,
        items: items
    };
    
    try {
        await apiCall('penjualan.php', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        showNotification('Penjualan berhasil dicatat');
        loadPenjualan();
        loadDashboardStats(); // Refresh dashboard
    } catch (error) {
        showNotification('Gagal mencatat penjualan', 'error');
    }
}

// Handler untuk submit resep
async function handleResepSubmit(e) {
    e.preventDefault();
    
    const items = [];
    let isValid = true;
    
    document.querySelectorAll('.resep-item').forEach(item => {
        const id_obat = item.querySelector('.obat-resep-select').value;
        const jumlah = item.querySelector('.jumlah-resep').value;
        const instruksi = item.querySelector('.instruksi-resep').value;
        
        if (!id_obat || !jumlah || !instruksi) {
            isValid = false;
            return;
        }
        
        items.push({
            id_obat: parseInt(id_obat),
            jumlah: parseInt(jumlah),
            instruksi_penggunaan: instruksi
        });
    });
    
    if (!isValid || items.length === 0) {
        showNotification('Harap isi semua item resep dengan benar', 'error');
        return;
    }
    
    const formData = {
        id_pasien: document.getElementById('resep-pasien').value,
        id_dokter: document.getElementById('resep-dokter').value,
        tanggal_resep: document.getElementById('tanggal-resep').value,
        catatan: document.getElementById('catatan-resep').value,
        items: items
    };
    
    try {
        await apiCall('resep.php', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        showNotification('Resep berhasil dibuat');
        loadResep();
    } catch (error) {
        showNotification('Gagal membuat resep', 'error');
    }
}

// View detail penjualan
async function viewDetailPenjualan(id_penjualan) {
    try {
        const [penjualan, detail] = await Promise.all([
            apiCall(`penjualan.php?id_penjualan=${id_penjualan}`),
            apiCall(`detail_penjualan.php?id_penjualan=${id_penjualan}`)
        ]);
        
        const p = penjualan[0];
        let html = `
            <div class="form-container">
                <h3>Detail Penjualan #${p.id_penjualan}</h3>
                <div class="detail-info">
                    <p><strong>Tanggal:</strong> ${p.tanggal_penjualan}</p>
                    <p><strong>Pasien:</strong> ${p.nama_pasien || 'Non-Pasien'}</p>
                    <p><strong>Metode Bayar:</strong> ${p.metode_pembayaran}</p>
                    <p><strong>Total Harga:</strong> ${formatCurrency(p.total_harga)}</p>
                </div>
                <h4>Item Penjualan:</h4>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Nama Obat</th>
                            <th>Jumlah</th>
                            <th>Harga Satuan</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        detail.forEach(d => {
            html += `
                <tr>
                    <td>${d.nama_obat}</td>
                    <td>${d.jumlah}</td>
                    <td>${formatCurrency(d.harga_satuan)}</td>
                    <td>${formatCurrency(d.subtotal)}</td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="loadPenjualan()">Kembali</button>
                </div>
            </div>
        `;
        
        document.getElementById('penjualan-list').innerHTML = html;
    } catch (error) {
        console.error('Error loading penjualan detail:', error);
        showNotification('Gagal memuat detail penjualan', 'error');
    }
}

// View detail resep
async function viewDetailResep(id_resep) {
    try {
        const [resep, detail] = await Promise.all([
            apiCall(`resep.php?id_resep=${id_resep}`),
            apiCall(`detail_resep.php?id_resep=${id_resep}`)
        ]);
        
        const r = resep[0];
        let html = `
            <div class="form-container">
                <h3>Detail Resep #${r.id_resep}</h3>
                <div class="detail-info">
                    <p><strong>Tanggal:</strong> ${r.tanggal_resep}</p>
                    <p><strong>Pasien:</strong> ${r.nama_pasien}</p>
                    <p><strong>Dokter:</strong> ${r.nama_dokter}</p>
                    <p><strong>Catatan:</strong> ${r.catatan || '-'}</p>
                </div>
                <h4>Item Resep:</h4>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Nama Obat</th>
                            <th>Dosis</th>
                            <th>Jumlah</th>
                            <th>Instruksi Penggunaan</th>
                            <th>Harga</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        detail.forEach(d => {
            html += `
                <tr>
                    <td>${d.nama_obat}</td>
                    <td>${d.dosis || '-'}</td>
                    <td>${d.jumlah}</td>
                    <td>${d.instruksi_penggunaan}</td>
                    <td>${formatCurrency(d.harga)}</td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="loadResep()">Kembali</button>
                </div>
            </div>
        `;
        
        document.getElementById('resep-list').innerHTML = html;
    } catch (error) {
        console.error('Error loading resep detail:', error);
        showNotification('Gagal memuat detail resep', 'error');
    }
}