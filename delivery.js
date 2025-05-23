let map;
let directionsService;
let directionsRenderer;
let carMarker;

function initMap() {
  // Inicializa o mapa centralizado no Brasil
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -14.2350, lng: -51.9253 },
    zoom: 4,
  });

  // Instancia os serviços de rota
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);
}

function calculateRoute() {
  const origin = document.getElementById("origin").value;
  const destination = document.getElementById("destination").value;

  if (!origin || !destination) {
    alert("Por favor, preencha os campos de origem e destino.");
    return;
  }

  const request = {
    origin: origin,
    destination: destination,
    travelMode: google.maps.TravelMode.DRIVING,
  };

  directionsService.route(request, (result, status) => {
    if (status === "OK") {
      directionsRenderer.setDirections(result);
      displayRouteInfo(result);
    } else {
      alert("Não foi possível calcular a rota: " + status);
    }
  });
}

function displayRouteInfo(result) {
  const route = result.routes[0].legs[0];
  const distance = route.distance.text;
  const duration = route.duration.text;

  const routeInfo = document.getElementById("routeInfo");
  routeInfo.classList.remove("d-none");
  routeInfo.innerHTML = `
    <p><strong>Origem:</strong> ${route.start_address}</p>
    <p><strong>Destino:</strong> ${route.end_address}</p>
    <p><strong>Distância:</strong> ${distance}</p>
    <p><strong>Duração Estimada:</strong> ${duration}</p>
    <button class="btn btn-success w-100" onclick="startDelivery()">Iniciar Entrega</button>
  `;
}

function startDelivery() {
  // Desabilitar botões durante entrega
  const calculateButton = document.querySelector('button[onclick="calculateRoute()"]');
  const deliveryButton = document.querySelector('button[onclick="startDelivery()"]');
  calculateButton.disabled = true;
  deliveryButton.disabled = true;

  // Mostrar overlay de carregamento
  const loadingDiv = document.getElementById("loading");
  loadingDiv.classList.remove("d-none");

  // Remover marcador anterior, se existir
  if (carMarker) {
    carMarker.setMap(null);
  }

  // Criar marcador de carro
  carMarker = new google.maps.Marker({
    map: map,
    icon: {
      url: "https://img.icons8.com/ios-filled/50/000000/car.png",
      // url: "./car.png",
      scaledSize: new google.maps.Size(32, 32),
    },
  });

  // Obter a rota atual
  const route = directionsRenderer.getDirections().routes[0];
  const path = route.overview_path;
  let step = 0;
  const totalSteps = path.length;
  const animationDuration = 20000; // 20 segundos
  const interval = animationDuration / totalSteps;

  // Ajustar zoom e centralizar o mapa na origem
  map.setCenter(path[0]);
  map.setZoom(15);

  // Função de animação
  function animateCar() {
    if (step < totalSteps) {
      carMarker.setPosition(path[step]);
      step++;
      setTimeout(animateCar, interval);
    } else {
      // Fim da animação
      carMarker.setMap(null);
      loadingDiv.classList.add("d-none");
      
      // Reabilitar o botão de calcular rota
      calculateButton.disabled = false;

      // Criar um overlay de sucesso
      const successOverlay = document.createElement('div');
      successOverlay.className = 'success-overlay';
      successOverlay.innerHTML = `
        <div class="success-content">
          <h3>Entrega Concluída!</h3>
          <p class="success-message">Boa viagem! 🎉</p>
          <button class="btn btn-primary" onclick="resetForm()">Nova Entrega</button>
        </div>
      `;
      document.body.appendChild(successOverlay);

      // Adicionar animação de fade
      setTimeout(() => {
        successOverlay.style.opacity = '1';
      }, 100);

      // Remover overlay após 3 segundos
      setTimeout(() => {
        successOverlay.style.opacity = '0';
        setTimeout(() => {
          successOverlay.remove();
        }, 300);
      }, 3000);
    }
  }

  // Iniciar animação após um pequeno atraso para mostrar o overlay
  setTimeout(() => {
    loadingDiv.classList.add("d-none");
    animateCar();
  }, 1000);
}

// Função para resetar o formulário
function resetForm() {
  // Habilitar botões
  const calculateButton = document.querySelector('button[onclick="calculateRoute()"]');
  const deliveryButton = document.querySelector('button[onclick="startDelivery()"]');
  calculateButton.disabled = false;
  deliveryButton.disabled = false;

  // Limpar campos
  document.getElementById('origin').value = '';
  document.getElementById('destination').value = '';

  // Remover informações da rota
  const routeInfo = document.getElementById('routeInfo');
  routeInfo.classList.add('d-none');
  routeInfo.innerHTML = '<h5>Informações da Rota</h5>';

  // Limpar a rota do mapa
  directionsRenderer.setDirections(null);
  
  // Resetar zoom do mapa
  map.setCenter({ lat: -14.2350, lng: -51.9253 });
  map.setZoom(4);
}