// js/cadastro.js

document.addEventListener('DOMContentLoaded', () => {
    const formCadastro = document.getElementById('formCadastro');
    const elEditId = document.getElementById('editId');
    const elFoto = document.getElementById('foto');

    // --- MÁSCARAS ---
    const inputCelular = document.getElementById('celular');
    const inputFixo = document.getElementById('fixo');
    const inputCep = document.getElementById('cep');
    const inputFamiliarTel = document.getElementById('familiarTel'); // NOVO

    // Função auxiliar de máscara de telefone
    const mascaraTelefone = (e) => {
        let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
        e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
    };

    inputCelular.addEventListener('input', mascaraTelefone);
    inputFixo.addEventListener('input', mascaraTelefone);
    
    // Aplica máscara no telefone do familiar também
    if(inputFamiliarTel) inputFamiliarTel.addEventListener('input', mascaraTelefone);

    if(inputCep) {
        inputCep.addEventListener('input', (e) => {
            let x = e.target.value.replace(/\D/g, '').match(/(\d{0,5})(\d{0,3})/);
            e.target.value = !x[2] ? x[1] : x[1] + '-' + x[2];
        });
    }

    // --- SALVAR ---
    formCadastro.onsubmit = async (e) => {
        e.preventDefault(); 

        const idAtual = elEditId.value ? Number(elEditId.value) : null;
        const celularInput = inputCelular.value;

        getAll(async (lista) => {
            // Verifica duplicidade apenas pelo celular do titular
            const duplicado = lista.find(p => p.celular === celularInput && p.id !== idAtual);
            
            if (duplicado) {
                if (confirm('Celular já cadastrado. Deseja editar este registro?')) {
                    preencherForm(duplicado);
                }
                return;
            }

            let fotoFinal = '';
            if (elFoto.files[0]) {
                if (elFoto.files[0].size > 1024 * 1024) return alert('Foto muito grande (Max 1MB)');
                fotoFinal = await toBase64(elFoto.files[0]);
            } else if (idAtual) {
                try {
                    const pessoaAntiga = await pegarPessoaPorId(idAtual);
                    if (pessoaAntiga) fotoFinal = pessoaAntiga.foto;
                } catch (erro) { console.log(erro); }
            }

            const obj = {
                nome: document.getElementById('nome').value,
                endereco: document.getElementById('endereco').value,
                numero: document.getElementById('numero').value,
                complemento: document.getElementById('complemento').value,
                bairro: document.getElementById('bairro').value,
                cep: document.getElementById('cep').value,
                celular: celularInput,
                fixo: document.getElementById('fixo').value,
                // --- NOVOS CAMPOS ---
                familiar_nome: document.getElementById('familiarNome').value,
                familiar_telefone: document.getElementById('familiarTel').value,
                // --------------------
                foto: fotoFinal
            };

            if (idAtual) obj.id = idAtual;

            save(obj, () => {
                alert('Salvo com sucesso!');
                formCadastro.reset();
                elEditId.value = '';
                document.getElementById('foto').value = '';
                
                // Volta para o topo e muda aba
                document.querySelector('.content').scrollTo({ top: 0, behavior: 'smooth' });
                if (typeof openTab === 'function') {
                    openTab('busca');
                    const searchInput = document.getElementById('search');
                    if (searchInput) searchInput.dispatchEvent(new Event('input'));
                }
            });
        });
    };
});

// Funções Auxiliares
function toBase64(file) {
    return new Promise((r, j) => {
        const fr = new FileReader();
        fr.readAsDataURL(file);
        fr.onload = () => r(fr.result);
        fr.onerror = j;
    });
}

function pegarPessoaPorId(id) {
    return new Promise((r) => {
        if (typeof getById === 'function') getById(id, res => r(res)); else r(null);
    });
}

// --- PREENCHER FORM (EDITAR) ---
window.preencherForm = function(p) {
    if (typeof openTab === 'function') openTab('cadastro');
    
    document.getElementById('nome').value = p.nome || '';
    document.getElementById('endereco').value = p.endereco || '';
    document.getElementById('numero').value = p.numero || '';
    document.getElementById('complemento').value = p.complemento || '';
    document.getElementById('bairro').value = p.bairro || '';
    document.getElementById('cep').value = p.cep || '';
    document.getElementById('celular').value = p.celular || '';
    document.getElementById('fixo').value = p.fixo || '';
    
    // Novos Campos
    document.getElementById('familiarNome').value = p.familiar_nome || '';
    document.getElementById('familiarTel').value = p.familiar_telefone || '';
    
    document.getElementById('editId').value = p.id;
    
    document.querySelector('.content').scrollTo({ top: 0, behavior: 'smooth' });
}
