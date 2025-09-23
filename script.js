document.addEventListener('DOMContentLoaded', () => {

    // --- CÓDIGO DEL MENÚ HAMBURGUESA ---
    const hamburger = document.querySelector('.hamburger');
    const navbar = document.querySelector('.navbar');

    if (hamburger && navbar) {
        hamburger.addEventListener('click', () => {
            navbar.classList.toggle('active');
        });
    }

    // --- CÓDIGO DEL SLIDER DE TESTIMONIOS ---
    const slider = document.querySelector('.testimonial-slider');
    if (slider) {
        const slides = document.querySelectorAll('.testimonial-card');
        const prevButton = document.querySelector('.slider-btn.prev');
        const nextButton = document.querySelector('.slider-btn.next');

        let currentIndex = 0;
        const totalSlides = slides.length;

        function updateSliderPosition() {
            slider.style.transform = `translateX(-${currentIndex * 100}%)`;
        }

        nextButton.addEventListener('click', () => {
            if (currentIndex < totalSlides - 1) {
                currentIndex++;
            } else {
                currentIndex = 0;
            }
            updateSliderPosition();
        });

        prevButton.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
            } else {
                currentIndex = totalSlides - 1;
            }
            updateSliderPosition();
        });
        
        window.addEventListener('resize', updateSliderPosition);
    }

    // --- CÓDIGO DEL TICKER Y CALCULADORA DE SOJA ---

    // Elementos do Ticker
    const tickerPriceEl = document.getElementById('ticker-price');
    const tickerChangeEl = document.getElementById('ticker-change');
    const tickerPercentEl = document.getElementById('ticker-percent');

    // Elementos da Calculadora
    const openCalculatorBtn = document.getElementById('open-calculator-btn');
    const closeCalculatorBtn = document.getElementById('close-calculator-btn');
    const calculatorModal = document.getElementById('calculator-modal');
    const calculateValueBtn = document.getElementById('calculate-value-btn');
    const quantityInput = document.getElementById('quantity');
    const unitSelect = document.getElementById('unit');
    const resultDiv = document.getElementById('calculator-result');
    const resultValueEl = document.getElementById('result-value');

    // Función para buscar datos de cotización (simulada)
    async function fetchSoybeanData() {
        // **IMPORTANTE**: Reemplace esta parte por la llamada a su API real.
        // El ejemplo a continuación usa datos estáticos de su página.
        console.log("Buscando datos de cotización (usando valores estáticos)...");
        try {
            // Ejemplo de cómo sería con una API real:
            // const response = await fetch('https://sua-api.com/soybean-price');
            // const data = await response.json();
            // return {
            //     price: data.lastPrice,
            //     change: data.change,
            //     percentChange: data.percentChange
            // };

            // Simulación con datos estáticos:
            return {
                price: 991.00,
                change: -7.50,
                percentChange: -0.75
            };
        } catch (error) {
            console.error("Error al buscar datos de cotización:", error);
            // Retorna los valores actuales si la API falla
            return {
                price: parseFloat(tickerPriceEl.textContent),
                change: parseFloat(tickerChangeEl.textContent),
                percentChange: parseFloat(tickerPercentEl.textContent.replace('%',''))
            };
        }
    }

    // Función para actualizar el ticker en pantalla
    function updateTickerUI(data) {
        tickerPriceEl.textContent = data.price.toFixed(2);
        tickerChangeEl.textContent = data.change.toFixed(2);
        tickerPercentEl.textContent = `${data.percentChange.toFixed(2)}%`;

        // Elimina clases de color existentes
        tickerChangeEl.classList.remove('positive', 'negative');
        tickerPercentEl.classList.remove('positive', 'negative');

        // Agrega la clase de color apropiada
        if (data.change > 0) {
            tickerChangeEl.classList.add('positive');
            tickerPercentEl.classList.add('positive');
        } else if (data.change < 0) {
            tickerChangeEl.classList.add('negative');
            tickerPercentEl.classList.add('negative');
        }
    }

    // Función principal que ejecuta la búsqueda y actualización
    async function refreshTicker() {
        const data = await fetchSoybeanData();
        updateTickerUI(data);
    }

    // --- LÓGICA DE LA CALCULADORA ---

    function calculateSoyValue() {
        const quantity = parseFloat(quantityInput.value);
        if (isNaN(quantity) || quantity <= 0) {
            alert("Por favor, ingrese una cantidad válida.");
            return;
        }

        const unit = unitSelect.value;
        const currentBushelPriceInCents = parseFloat(tickerPriceEl.textContent);
        const currentBushelPriceInDollars = currentBushelPriceInCents / 100;

        // Factores de conversión
        const BUSHEL_IN_KG = 27.2155;
        
        const pricePerKg = currentBushelPriceInDollars / BUSHEL_IN_KG;
        
        let totalValue = 0;

        if (unit === 'bags') {
            const pricePerBag = pricePerKg * 60; 
            totalValue = quantity * pricePerBag;
        } else if (unit === 'tonnes') {
            const pricePerTonne = pricePerKg * 1000;
            totalValue = quantity * pricePerTonne;
        }

        // Muestra el resultado formateado en Dólares
        resultValueEl.textContent = `US$ ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        resultDiv.style.display = 'block';
    }


    // Escuchadores de Eventos
    if (openCalculatorBtn && calculatorModal) {
        openCalculatorBtn.addEventListener('click', () => {
            calculatorModal.classList.add('visible');
        });
    }

    if (closeCalculatorBtn && calculatorModal) {
        closeCalculatorBtn.addEventListener('click', () => {
            calculatorModal.classList.remove('visible');
        });
    }

    // Cerrar el modal haciendo clic fuera de él
    if (calculatorModal) {
        calculatorModal.addEventListener('click', (event) => {
            if (event.target === calculatorModal) {
                calculatorModal.classList.remove('visible');
            }
        });
    }

    if (calculateValueBtn) {
        calculateValueBtn.addEventListener('click', calculateSoyValue);
    }


    // Inicializa el ticker al cargar la página
    refreshTicker();

    // Opcional: Actualiza el ticker cada 5 minutos (300000 ms)
    // setInterval(refreshTicker, 300000); 

});