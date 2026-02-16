// scripts/backup-automatico.js
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Pega as senhas que vamos configurar no GitHub (Segurança)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Erro: Variáveis de ambiente não encontradas.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function realizarBackup() {
    console.log("Iniciando backup via GitHub Actions...");

    const { data, error } = await supabase
        .from('pessoas')
        .select('*');

    if (error) {
        console.error("Erro ao baixar dados:", error);
        process.exit(1);
    }

    // Cria o nome do arquivo com a data de hoje (ex: backup-2023-10-25.json)
    const dataHoje = new Date().toISOString().split('T')[0];
    const nomeArquivo = `backups/backup-${dataHoje}.json`;

    // Garante que a pasta backups existe
    if (!fs.existsSync('backups')){
        fs.mkdirSync('backups');
    }

    // Salva o arquivo
    fs.writeFileSync(nomeArquivo, JSON.stringify(data, null, 2));
    
    console.log(`Backup salvo com sucesso: ${nomeArquivo}`);
}

realizarBackup();
