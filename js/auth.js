// js/auth.js - AUTENTICAÇÃO VIA GOOGLE APPS SCRIPT
// Simples sistema de token para UI

async function isAdmin() {
    // 1. Verifica se já tem token salvo
    const token = localStorage.getItem('app_token');
    if (token) return true;

    // 2. Se não, pede credenciais
    const email = prompt('🔒 Área Restrita\nDigite o EMAIL de administrador:');
    if (!email) return false;

    const password = prompt('Digite a SENHA de administrador:');
    if (!password) return false;

    if (!checkUrl()) return false;

    // 3. Valida no Google Apps Script
    try {
        // Mostra um feedback visual simples (cursor)
        document.body.style.cursor = 'wait';

        const resp = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'login',
                email: email,
                password: password
            })
        });

        const json = await resp.json();
        document.body.style.cursor = 'default';

        if (json.status === 'success') {
            localStorage.setItem('app_token', json.token);
            alert('Login efetuado com sucesso!');
            return true;
        } else {
            alert('Acesso negado: ' + json.message);
            return false;
        }

    } catch (err) {
        document.body.style.cursor = 'default';
        console.error("Erro no login:", err);
        alert('Erro ao tentar fazer login. Verifique a conexão.');
        return false;
    }
}

async function logout() {
    if (confirm('Deseja realmente sair?')) {
        localStorage.removeItem('app_token');
        alert('Desconectado.');
        location.reload();
    }
}
