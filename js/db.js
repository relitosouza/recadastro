// js/db.js
// ---------------- CONFIGURAÇÃO ----------------
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyyW6XUT6pshIq2Wms_2uJxv28kgoy0J6hnF4DCQcAPlJRu0XJLRwg86HByMHczGzu71A/exec';
// ----------------------------------------------

// Verifica se a URL foi configurada
function checkUrl() {
    if (GOOGLE_SCRIPT_URL.includes('COLE_SUA_URL')) {
        alert('ERRO: Você precisa configurar a URL do Google Apps Script no arquivo js/db.js');
        return false;
    }
    return true;
}

// Emite evento de pronto para compatibilidade com código antigo
setTimeout(() => {
    window.dispatchEvent(new Event('db-ready'));
    console.log("Sistema pronto para conexão com Google Sheets.");
}, 500);

// --- FUNÇÕES DO SISTEMA (Substituindo Supabase) ---

async function getAll(cb) {
    if (!checkUrl()) return;

    try {
        // Adiciona timestamp para evitar cache do navegador
        const url = `${GOOGLE_SCRIPT_URL}?action=read&t=${Date.now()}`;
        const resp = await fetch(url);
        const json = await resp.json();

        if (json.status === 'error') throw new Error(json.message);

        let data = json.data || [];
        // Ordenação client-side por nome
        data.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));

        // FIX: Garante que fotos do Drive usem link de visualização (export=view) e não download
        data = data.map(item => {
            if (item.foto && item.foto.includes('drive.google.com') && item.foto.includes('export=download')) {
                item.foto = item.foto.replace('export=download', 'export=view');
            }
            return item;
        });

        if (cb) cb(data);
    } catch (err) {
        console.error("Erro ao buscar:", err);
        alert("Erro ao carregar dados: " + err.message);
    }
}

async function save(obj, cb) {
    if (!checkUrl()) return;

    // Mostra loading simples (pode ser melhorado na UI)
    const btn = document.querySelector('button[type="submit"]');
    const btnText = btn ? btn.innerText : '';
    if (btn) { btn.disabled = true; btn.innerText = 'Salvando...'; }

    try {
        const payload = { ...obj };

        const resp = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        const json = await resp.json();

        if (json.status === 'error') throw new Error(json.message);

        if (cb) cb();

    } catch (err) {
        console.error("Erro ao salvar:", err);
        alert("Erro ao salvar: " + err.message);
    } finally {
        if (btn) { btn.disabled = false; btn.innerText = btnText; }
    }
}

async function remove(id, cb) {
    if (!checkUrl()) return;

    if (!confirm('Tem certeza que deseja excluir este registro?')) return;

    try {
        const resp = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'delete', id: id })
        });

        const json = await resp.json();

        if (json.status === 'error') throw new Error(json.message);

        if (cb) cb();

    } catch (err) {
        console.error("Erro ao excluir:", err);
        alert("Erro ao excluir: " + err.message);
    }
}

async function getById(id, cb) {
    // Como a leitura é rápida para poucos dados, vamos reusar o getAll
    // Se a base crescer muito, implementaremos um action=getById no backend
    getAll((data) => {
        const item = data.find(x => x.id == id); // id pode ser string ou number
        if (cb) cb(item || null);
    });
}
