// js/app.js - ATUALIZADO (UX/UI + SEGURANÇA)

// Configura os botões de navegação
document.querySelectorAll('nav button').forEach(b => b.onclick = () => openTab(b.dataset.tab));

// js/app.js - ATUALIZAÇÃO NO INÍCIO DO ARQUIVO

// Configura os botões de navegação
// Note que agora chamamos a função, mas o click não espera o async, o que é OK para UI.
document.querySelectorAll('nav button').forEach(b => b.onclick = () => openTab(b.dataset.tab));

// ADICIONADO "async" AQUI NA DECLARAÇÃO
async function openTab(id) {
    
    // --- SEGURANÇA: Bloqueia aba Banco se não for admin ---
    if (id === 'banco') {
        // Verifica se a função isAdmin existe
        if (typeof isAdmin === 'function') {
            // ADICIONADO "await" AQUI - O código vai PAUSAR aqui até o Supabase responder
            const autorizado = await isAdmin(); 
            
            if (!autorizado) {
                // Se falhar o login, volta para a aba de busca ou mantém onde está
                return; 
            }
        }
    }
    // -----------------------------------------------------

    // ... (O RESTANTE DO CÓDIGO DA FUNÇÃO openTab CONTINUA IGUAL ABAIXO) ...
    
    // Lógica de Relatório (Acessível via Admin)
    if (id === 'relatorio') {
        if (typeof carregarRelatorio === 'function') carregarRelatorio();
    }
    
    // Carrega tabela admin
    if (id === 'banco') {
        if (typeof carregarTabelaAdmin === 'function') carregarTabelaAdmin();
    }

    // Remove classe 'active' de todas as seções e botões
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
    
    // Ativa a seção
    const section = document.getElementById(id);
    if (section) section.classList.add('active');

    // Ativa o botão da nav
    const btn = document.querySelector(`nav button[data-tab="${id}"]`);
    if (btn) btn.classList.add('active');
}

// ... Resto do arquivo app.js continua igual ...
// Renderização dos Cards (Busca e Relatório)
function renderCard(container, p) {
    const d = document.createElement('div');
    d.className = 'person-card';
    
    const nomeSeguro = p.nome ? p.nome.replace(/</g, "&lt;").replace(/>/g, "&gt;") : 'Sem Nome';
    const fotoUrl = p.foto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(nomeSeguro) + '&background=random';
    
    const num = p.numero ? `, ${p.numero}` : '';
    const comp = p.complemento ? ` - ${p.complemento}` : '';
    const bairro = p.bairro ? ` - ${p.bairro}` : '';
    const enderecoCompleto = `${p.endereco || ''}${num}${comp}${bairro} - CEP: ${p.cep || ''}`;

    let htmlFamiliar = '';
    if (p.familiar_nome || p.familiar_telefone) {
        htmlFamiliar = `
            <div class="info-row" style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed #eee; color: #d946ef;">
                <i class="ph ph-heart-beat" style="font-weight: bold;"></i>
                <span style="font-size: 0.85rem;">
                    <strong>Familiar:</strong> ${p.familiar_nome || ''} ${p.familiar_telefone ? ' - ' + p.familiar_telefone : ''}
                </span>
            </div>
        `;
    }

    // --- UX UPDATE: REMOVIDO BOTÃO DE EXCLUIR DAQUI ---
    // Somente edição é permitida na busca pública
    d.innerHTML = `
        <div class="card-header">
            <img src="${fotoUrl}" alt="Avatar" class="card-avatar">
        </div>
        <div class="card-body">
            <div class="info-block-nome">
                <h3>${nomeSeguro} <span class="id-tag">#${p.id}</span></h3>
            </div>
            <div class="info-row address-row" style="align-items: flex-start; margin-bottom: 8px;">
                <i class="ph ph-map-pin" style="margin-top:2px; color: var(--primary); flex-shrink: 0;"></i>
                <span style="font-size: 0.85rem; line-height: 1.3;">${enderecoCompleto}</span>
            </div>
            <div class="phones-container">
                <div class="info-row">
                    <i class="ph ph-whatsapp-logo" style="color: #25D366;"></i>
                    <span>${p.celular || ''}</span>
                </div>
                ${p.fixo ? `<div class="info-row"><i class="ph ph-phone" style="color: var(--text-muted);"></i><span>${p.fixo}</span></div>` : ''}
            </div>
            ${htmlFamiliar}
        </div>
        
        <div class="card-actions">
            <button class="btn-icon-small edit" data-id="${p.id}" style="width:100%">
                <i class="ph ph-pencil-simple"></i> Editar / Ver Detalhes
            </button>
        </div>
    `;

    const btnEdit = d.querySelector('.edit');
    if(btnEdit) btnEdit.onclick = () => window.preencherForm(p);

    container.appendChild(d);
}

// Renderização da Tabela Admin (AGORA COM EXCLUSÃO)
function carregarTabelaAdmin() {
    const tbody = document.getElementById('tabelaCorpo');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Carregando dados...</td></tr>';

    getAll(list => {
        tbody.innerHTML = '';
        if(!list || list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Nenhum registro encontrado.</td></tr>';
            return;
        }

        list.forEach(p => {
            const tr = document.createElement('tr');
            const fotoUrl = p.foto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(p.nome) + '&background=random';
            const end = `${p.endereco || ''}, ${p.numero || 'S/N'}`;

            // --- UX UPDATE: ADICIONADO BOTÃO DE EXCLUIR AQUI ---
            tr.innerHTML = `
                <td>#${p.id}</td>
                <td><img src="${fotoUrl}" class="thumb-table"></td>
                <td><strong>${p.nome}</strong></td>
                <td>${p.celular}</td>
                <td>${end}</td>
                <td>
                    <div style="display:flex; gap: 5px;">
                        <button class="btn-icon-small edit" onclick="editarViaAdmin(${p.id})" title="Editar">
                            <i class="ph ph-pencil-simple"></i>
                        </button>
                        <button class="btn-icon-small delete" onclick="confirmarExclusao(${p.id})" title="Excluir" style="border-color: #fecaca; color: #ef4444; background: #fef2f2;">
                            <i class="ph ph-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    });
}

// Atalho para editar vindo da tabela Admin
window.editarViaAdmin = function(id) {
    if(typeof pegarPessoaPorId === 'function') {
        pegarPessoaPorId(id).then(p => { if(p) window.preencherForm(p); });
    } else {
        getAll(list => {
            const p = list.find(item => item.id === id);
            if(p) window.preencherForm(p);
        });
    }
}

// Função de exclusão (Só funciona se chamado da área admin agora)
window.confirmarExclusao = function(id) {
    if(confirm('ATENÇÃO ADMIN: Tem certeza que deseja excluir este registro permanentemente?')) {
        if (typeof remove === 'function') {
            remove(id, () => {
                // Atualiza apenas a tabela, pois agora só deleta por aqui
                carregarTabelaAdmin(); 
            });
        }
    }
}

// --- AUTOMACAO DE BACKUP (00:00) ---
// Verifica a cada minuto se é meia noite
setInterval(() => {
    const agora = new Date();
    // Se for 00:00 (ou entre 00:00 e 00:01)
    if (agora.getHours() === 0 && agora.getMinutes() === 0) {
        // Verifica se já fizemos o backup hoje para não fazer loop
        const dataHoje = agora.toLocaleDateString();
        const ultimoBackup = localStorage.getItem('ultimo_backup_automatico');
        
        if (ultimoBackup !== dataHoje) {
            console.log("Iniciando backup automático das 00:00...");
            
            // Chama a função de exportar do backup.js
            if(typeof exportarBackup === 'function') {
                exportarBackup(); 
                localStorage.setItem('ultimo_backup_automatico', dataHoje);
            }
        }
    }
}, 60000); // Checa a cada 60 segundos

