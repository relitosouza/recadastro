// js/backup.js

function exportarBackup() {
    getAll(lista => {
        if (!lista || lista.length === 0) {
            alert("Não há dados para exportar.");
            return;
        }

        // Converte os dados para JSON bonito
        const jsonStr = JSON.stringify(lista, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        // Cria um link temporário para forçar o download
        const a = document.createElement('a');
        a.href = url;
        const dataHoje = new Date().toISOString().slice(0, 10);
        a.download = `backup_sistema_cadastro_${dataHoje}.json`;
        
        document.body.appendChild(a);
        a.click();
        
        // Limpeza
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

function importarBackup(inputElement) {
    const file = inputElement.files[0];
    if (!file) return;

    if (!confirm("Atenção: A importação irá adicionar/substituir registros com o mesmo ID. Recomendamos fazer um backup antes. Deseja continuar?")) {
        inputElement.value = ''; // Limpa o input
        return;
    }
    // Exemplo de como ficaria a função importar no js/backup.js
async function importarBackup(inputElement) {
    const file = inputElement.files[0];
    if (!file) return;

    const result = await Swal.fire({
        title: 'Restaurar Backup?',
        text: "Isso substituirá registros com o mesmo ID. Recomendamos fazer um backup antes.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#059669',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim, restaurar'
    });

    if (!result.isConfirmed) {
        inputElement.value = '';
        return;
    }
    
    // ... resto do código de importação ...
    // No final, troque o alert de sucesso por:
    // Swal.fire('Sucesso', `${importados} registros importados.`, 'success').then(() => location.reload());
}

    const reader = new FileReader();
    
    reader.onload = async (e) => {
        try {
            const dados = JSON.parse(e.target.result);
            
            if (!Array.isArray(dados)) {
                throw new Error("O arquivo não contém uma lista válida de cadastros.");
            }

            let importados = 0;
            const total = dados.length;

            // Itera sobre os dados e salva um por um (Sequencial para evitar travar o banco)
            for (const item of dados) {
                await new Promise((resolve) => {
                    // save é global (do db.js)
                    save(item, () => resolve());
                });
                importados++;
            }

            alert(`Sucesso! ${importados} de ${total} registros foram importados/atualizados.`);
            location.reload(); // Recarrega para mostrar os novos dados

        } catch (erro) {
            console.error(erro);
            alert("Erro ao processar arquivo: " + erro.message);
        } finally {
            inputElement.value = ''; // Reseta o input para permitir importar o mesmo arquivo novamente se precisar
        }
    };

    reader.readAsText(file);

}
