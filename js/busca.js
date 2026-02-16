// js/busca.js

const searchInput = document.getElementById('search');
const resultadosDiv = document.getElementById('resultados');
let timeoutId;

searchInput.oninput = () => {
    // Debounce: espera 300ms antes de buscar para não travar
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
        realizarBusca();
    }, 300);
};

function realizarBusca() {
    const termo = searchInput.value.toLowerCase();
    
    if (termo.length === 0) {
        resultadosDiv.innerHTML = '';
        return;
    }

    getAll(list => {
        resultadosDiv.innerHTML = '';
        
        // Filtra procurando o termo em VÁRIOS campos
        const filtrados = list.filter(p => {
            const nome = p.nome ? p.nome.toLowerCase() : '';
            const celular = p.celular ? p.celular : '';
            const bairro = p.bairro ? p.bairro.toLowerCase() : '';
            const endereco = p.endereco ? p.endereco.toLowerCase() : '';
            
            return nome.includes(termo) || 
                   celular.includes(termo) || 
                   bairro.includes(termo) || 
                   endereco.includes(termo);
        });

        if (filtrados.length === 0) {
            resultadosDiv.innerHTML = '<p style="text-align:center; color:#666; padding: 20px;">Nenhum resultado encontrado.</p>';
        } else {
            filtrados.forEach(p => renderCard(resultadosDiv, p));
        }
    });
}
