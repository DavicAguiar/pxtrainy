let currentMap = null;
let currentMarker = null;

// Função para inicializar o mapa
function initMap() {
    // Verifica se o Google Maps API está disponível
    if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
        console.error('Google Maps API não carregado');
        return;
    }

    const mapElement = document.getElementById('map');
    if (!mapElement) {
        console.error('Elemento do mapa não encontrado');
        return;
    }

    const defaultLocation = { lat: -23.550520, lng: -46.633308 }; // São Paulo, Brasil
    currentMap = new google.maps.Map(mapElement, {
        center: defaultLocation,
        zoom: 15,
        styles: [
            { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
            {
                featureType: 'administrative.locality',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#d59563' }],
            },
            {
                featureType: 'poi',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#d59563' }],
            },
            {
                featureType: 'poi.park',
                elementType: 'geometry',
                stylers: [{ color: '#263c3f' }],
            },
            {
                featureType: 'poi.park',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#6b9a76' }],
            },
            {
                featureType: 'road',
                elementType: 'geometry',
                stylers: [{ color: '#38414e' }],
            },
            {
                featureType: 'road',
                elementType: 'geometry.stroke',
                stylers: [{ color: '#212a37' }],
            },
            {
                featureType: 'road',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#9ca5b3' }],
            },
            {
                featureType: 'road.highway',
                elementType: 'geometry',
                stylers: [{ color: '#746855' }],
            },
            {
                featureType: 'road.highway',
                elementType: 'geometry.stroke',
                stylers: [{ color: '#1f2835' }],
            },
            {
                featureType: 'road.highway',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#f3d19c' }],
            },
            {
                featureType: 'transit',
                elementType: 'geometry',
                stylers: [{ color: '#2f3948' }],
            },
            {
                featureType: 'transit.station',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#d59563' }],
            },
            {
                featureType: 'water',
                elementType: 'geometry',
                stylers: [{ color: '#17263c' }],
            },
            {
                featureType: 'water',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#515c6d' }],
            },
            {
                featureType: 'water',
                elementType: 'labels.text.stroke',
                stylers: [{ color: '#17263c' }],
            },
        ],
    });

    // Adiciona o marcador
    currentMarker = new google.maps.Marker({
        position: defaultLocation,
        map: currentMap,
        title: 'PxTrainy - Academia',
        animation: google.maps.Animation.DROP,
        icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
            scaledSize: new google.maps.Size(32, 32)
        }
    });

    // Adiciona os event listeners
    setupEventListeners();
}

function setupEventListeners() {
    document.getElementById('cepInput').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 5) {
            value = value.slice(0, 5) + '-' + value.slice(5, 8);
        }
        e.target.value = value;
        if (value.length === 9) {
            fetchAddress(value);
        }
    });

    document.getElementById('searchCep').addEventListener('click', function() {
        const cep = document.getElementById('cepInput').value;
        if (cep.length === 9) {
            fetchAddress(cep);
        }
    });
}

async function fetchAddress(cep) {
    // Verifica se o mapa foi inicializado
    if (!currentMap) {
        alert('Mapa não inicializado. Por favor, recarregue a página.');
        return;
    }

    // Exibir loading
    document.getElementById('loading').classList.remove('d-none');
    try {
        // Consultar ViaCEP
        const response = await fetch(`https://viacep.com.br/ws/${cep.replace('-', '')}/json/`);
        const data = await response.json();
        if (data.erro) {
            alert('CEP inválido. Tente novamente.');
            return;
        }
        // Exibir detalhes do endereço
        const addressInfo = document.getElementById('addressInfo');
        const addressDetails = document.getElementById('addressDetails');
        addressDetails.innerHTML = `
            Rua: ${data.logradouro || 'Não disponível'}<br>
            Bairro: ${data.bairro || 'Não disponível'}<br>
            Cidade: ${data.localidade || 'Não disponível'}<br>
            Estado: ${data.uf || 'Não disponível'}
        `;
        addressInfo.classList.remove('d-none');

        // Geocodificar endereço para obter coordenadas
        const geocoder = new google.maps.Geocoder();
        const address = `${data.logradouro}, ${data.bairro}, ${data.localidade}, ${data.uf}, Brasil`;
        geocoder.geocode({ address: address }, (results, status) => {
            if (status === 'OK') {
                const location = results[0].geometry.location;
                // Atualizar mapa e marcador
                currentMap.setCenter(location);
                currentMarker.setPosition(location);
                currentMarker.setTitle(`PxTrainy - ${data.localidade}`);
            } else {
                alert('Não foi possível localizar o endereço no mapa.');
            }
            // Ocultar loading
            document.getElementById('loading').classList.add('d-none');
        });
    } catch (error) {
        alert('Erro ao consultar o CEP. Tente novamente.');
        document.getElementById('loading').classList.add('d-none');
    }
}

// Função para inicializar o mapa quando o Google Maps API estiver pronto
function initMap() {
    // Verifica se o Google Maps API está disponível
    if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
        console.error('Google Maps API não carregado');
        return;
    }

    const mapElement = document.getElementById('map');
    if (!mapElement) {
        console.error('Elemento do mapa não encontrado');
        return;
    }

    const defaultLocation = { lat: -23.550520, lng: -46.633308 }; // São Paulo, Brasil
    currentMap = new google.maps.Map(mapElement, {
        center: defaultLocation,
        zoom: 15,
        styles: [
            { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
            {
                featureType: 'administrative.locality',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#d59563' }],
            },
            {
                featureType: 'poi',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#d59563' }],
            },
            {
                featureType: 'poi.park',
                elementType: 'geometry',
                stylers: [{ color: '#263c3f' }],
            },
            {
                featureType: 'poi.park',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#6b9a76' }],
            },
            {
                featureType: 'road',
                elementType: 'geometry',
                stylers: [{ color: '#38414e' }],
            },
            {
                featureType: 'road',
                elementType: 'geometry.stroke',
                stylers: [{ color: '#212a37' }],
            },
            {
                featureType: 'road',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#9ca5b3' }],
            },
            {
                featureType: 'road.highway',
                elementType: 'geometry',
                stylers: [{ color: '#746855' }],
            },
            {
                featureType: 'road.highway',
                elementType: 'geometry.stroke',
                stylers: [{ color: '#1f2835' }],
            },
            {
                featureType: 'road.highway',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#f3d19c' }],
            },
            {
                featureType: 'transit',
                elementType: 'geometry',
                stylers: [{ color: '#2f3948' }],
            },
            {
                featureType: 'transit.station',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#d59563' }],
            },
            {
                featureType: 'water',
                elementType: 'geometry',
                stylers: [{ color: '#17263c' }],
            },
            {
                featureType: 'water',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#515c6d' }],
            },
            {
                featureType: 'water',
                elementType: 'labels.text.stroke',
                stylers: [{ color: '#17263c' }],
            },
        ],
    });

    // Adiciona o marcador
    currentMarker = new google.maps.Marker({
        position: defaultLocation,
        map: currentMap,
        title: 'PxTrainy - Academia',
        animation: google.maps.Animation.DROP,
        icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
            scaledSize: new google.maps.Size(32, 32)
        }
    });

    // Adiciona os event listeners
    setupEventListeners();
}