function carregarRelatorio(){
getAll(list=>{
relatorioLista.innerHTML='';
list.forEach(p=>renderCard(relatorioLista,p))
})
}