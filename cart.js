// Configuração do frete
const FRETE_CONFIG = {
    base: 10.00, // Valor base do frete
    porKm: 2.50, // Valor por km
    maximo: 149.90, // Valor máximo do frete
    origem: {
        cidade: "São Paulo",
        estado: "SP",
        bairro: "Moema",
        latitude: -23.590240,
        longitude: -46.671662
    }
};

// Função para buscar CEP
async function buscarCep() {
    const cep = document.getElementById('cepInput').value.replace(/[^0-9]/g, '');
    if (cep.length !== 8) {
        alert('Por favor, digite um CEP válido');
        return;
    }

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (data.erro) {
            alert('CEP não encontrado');
            return;
        }

        // Exibir dados do CEP
        document.getElementById('endereco').textContent = `${data.logradouro}, ${data.bairro}`;
        document.getElementById('cidade').textContent = data.localidade;
        document.getElementById('estado').textContent = data.uf;
        document.getElementById('dadosCep').classList.remove('d-none');

        // Habilitar campo de distância
        document.getElementById('distanciaInput').disabled = false;
        
        // Se não tiver latitude e longitude, usar valores padrão
        const destino = {
            latitude: data.lat ? parseFloat(data.lat) : -23.550520, // São Paulo
            longitude: data.lng ? parseFloat(data.lng) : -46.633308 // São Paulo
        };

        // Calcular distância
        const distancia = calcularDistancia(FRETE_CONFIG.origem, destino);
        
        // Atualizar valores
        document.getElementById('distanciaInput').value = distancia.toFixed(1);
        document.getElementById('valorFrete').textContent = formatarValor(calcularFrete(distancia));

    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        alert('Erro ao buscar CEP. Por favor, tente novamente.');
        
        // Se houver erro, usar valores padrão
        document.getElementById('distanciaInput').value = '0';
        document.getElementById('valorFrete').textContent = formatarValor(FRETE_CONFIG.base);
    }
}

// Função para calcular distância entre dois pontos usando a fórmula de Haversine
function calcularDistancia(ponto1, ponto2) {
    const R = 6371; // Raio da Terra em km
    const dLat = toRad(ponto2.latitude - ponto1.latitude);
    const dLon = toRad(ponto2.longitude - ponto1.longitude);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(toRad(ponto1.latitude)) * Math.cos(toRad(ponto2.latitude)) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distância em km
}

// Função auxiliar para converter graus para radianos
function toRad(value) {
    return value * Math.PI / 180;
}

// Função para calcular o frete
function calcularFrete(distanciaKm) {
    const valorPorKm = distanciaKm * FRETE_CONFIG.porKm;
    const valorTotal = FRETE_CONFIG.base + valorPorKm;
    
    // Não permitir frete menor que o valor base
    const valorMinimo = Math.max(FRETE_CONFIG.base, valorTotal);
    // Não permitir frete maior que o valor máximo
    const valorFinal = Math.min(valorMinimo, FRETE_CONFIG.maximo);
    
    return parseFloat(valorFinal.toFixed(2));
}

// Função para formatar o valor em reais
function formatarValor(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

// Adicionar evento ao botão de busca de CEP
document.getElementById('buscarCep').addEventListener('click', buscarCep);

// Função para finalizar a compra
document.getElementById('finalizarCompra').addEventListener('click', function() {
    const distancia = parseFloat(document.getElementById('distanciaInput').value);
    if (isNaN(distancia) || distancia < 0) {
        alert('Por favor, digite uma distância válida');
        return;
    }

    const frete = calcularFrete(distancia);
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    let totalCompra = 0;

    // Calcular total dos produtos
    carrinho.forEach(item => {
        totalCompra += item.preco;
    });

    // Calcular total com frete
    const totalFinal = totalCompra + frete;

    // Exibir resumo da compra
    const resumo = `
        Resumo da Compra:
        -----------------
        Total Produtos: ${formatarValor(totalCompra)}
        Frete (${distancia.toFixed(1)}km): ${formatarValor(frete)}
        Total Final: ${formatarValor(totalFinal)}
        
        Origem: ${FRETE_CONFIG.origem.bairro}, ${FRETE_CONFIG.origem.cidade} - ${FRETE_CONFIG.origem.estado}
    `;

    if (confirm(resumo + '\n\nDeseja confirmar a compra?')) {
        alert('Compra finalizada com sucesso! Em breve entraremos em contato para confirmar o endereço.');
        // Limpar carrinho
        localStorage.removeItem('carrinho');
        // Redirecionar para a página inicial
        window.location.href = 'index.html';
    }
});
