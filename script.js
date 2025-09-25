document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.header');
    const hamburger = document.querySelector('.hamburger');
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    function toggleMenu() {
        const isExpanded = navbar.classList.toggle('active');
        document.body.style.overflow = isExpanded ? 'hidden' : '';
        hamburger.setAttribute('aria-expanded', isExpanded);
        const icon = hamburger.querySelector('svg');
        if (isExpanded) {
            icon.innerHTML = '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>';
        } else {
            icon.innerHTML = '<line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>';
        }
    }

    function scrollToSection(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId.length <= 1) {
            window.location.href = targetId;
            return;
        }
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            if (navbar.classList.contains('active')) {
                toggleMenu();
            }
            const headerOffset = 100;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }

    function setActiveSection() {
        const scrollPosition = window.scrollY + 150;
        let currentSectionId = '';
        sections.forEach(section => {
            if (scrollPosition >= section.offsetTop) {
                currentSectionId = '#' + section.getAttribute('id');
            }
        });
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
            const lastSection = document.querySelector('.nav-link[href="#contato"]');
            if (lastSection) currentSectionId = '#contato';
        }
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentSectionId) {
                link.classList.add('active');
            }
        });
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    if (hamburger && navbar) {
        hamburger.addEventListener('click', toggleMenu);
    }
    navLinks.forEach(link => {
        link.addEventListener('click', scrollToSection);
    });
    window.addEventListener('scroll', setActiveSection);
    window.addEventListener('load', setActiveSection);

    // --- CÓDIGO DO SLIDER DE DEPOIMENTOS ---
    // (nenhuma alteração nesta parte)
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
            currentIndex = (currentIndex < totalSlides - 1) ? currentIndex + 1 : 0;
            updateSliderPosition();
        });
        prevButton.addEventListener('click', () => {
            currentIndex = (currentIndex > 0) ? currentIndex - 1 : totalSlides - 1;
            updateSliderPosition();
        });
        window.addEventListener('resize', updateSliderPosition);
    }

    // --- CÓDIGO DO TICKER E CALCULADORA DE SOJA (COM FORMATAÇÃO) ---
    const tickerPriceEl = document.getElementById('ticker-price');
    const tickerChangeEl = document.getElementById('ticker-change');
    const tickerPercentEl = document.getElementById('ticker-percent');
    const openCalculatorBtn = document.getElementById('open-calculator-btn');
    const closeCalculatorBtn = document.getElementById('close-calculator-btn');
    const calculatorModal = document.getElementById('calculator-modal');
    const calculateValueBtn = document.getElementById('calculate-value-btn');
    const quantityInput = document.getElementById('quantity');
    const unitSelect = document.getElementById('unit');
    const resultDiv = document.getElementById('calculator-result');
    const resultValueEl = document.getElementById('result-value');

    async function fetchSoybeanData() {
        console.log("Buscando dados de cotação da API FMP (versão completa)...");
        const apiKey = "pujzdnNxZypG3dHjFsKz9UnqoHtcsQw8";
        const apiUrl = `https://financialmodelingprep.com/api/v3/quote/ZS=F?apikey=${apiKey}`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error(`Erro na API: ${response.statusText}`);

            const data = await response.json();
            const soyData = data[0];
            if (!soyData) throw new Error("Dados da soja não encontrados na resposta da API.");

            // **CORREÇÃO**: O preço já vem em dólares, não precisa multiplicar.
            return {
                price: soyData.price, // Retorna o valor em dólares diretamente
                change: soyData.change,
                percentChange: soyData.changesPercentage
            };
        } catch (error) {
            console.error("Erro ao buscar dados de cotação:", error);
            if (tickerPriceEl) tickerPriceEl.textContent = "Erro";
            if (tickerChangeEl) tickerChangeEl.textContent = "N/A";
            if (tickerPercentEl) tickerPercentEl.textContent = "N/A";
            return null;
        }
    }

    function updateTickerUI(data) {
        if (!data || !tickerPriceEl) return;

        // **CORREÇÃO**: Formata o número para o padrão americano (vírgula para milhar)
        tickerPriceEl.textContent = data.price.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        tickerChangeEl.textContent = data.change.toFixed(2);
        tickerPercentEl.textContent = `${data.percentChange.toFixed(2)}%`;

        tickerChangeEl.classList.remove('positive', 'negative');
        tickerPercentEl.classList.remove('positive', 'negative');

        if (data.change > 0) {
            tickerChangeEl.classList.add('positive');
            tickerPercentEl.classList.add('positive');
        } else if (data.change < 0) {
            tickerChangeEl.classList.add('negative');
            tickerPercentEl.classList.add('negative');
        }
    }

    async function refreshTicker() {
        const data = await fetchSoybeanData();
        if (data) {
            updateTickerUI(data);
        }
    }

    function calculateSoyValue() {
        const quantity = parseFloat(quantityInput.value);
        if (isNaN(quantity) || quantity <= 0) {
            alert("Por favor, insira uma quantidade válida.");
            return;
        }

        // **CORREÇÃO**: Remove as vírgulas do texto para converter para número
        const currentBushelPriceString = tickerPriceEl.textContent.replace(/,/g, '');
        const currentBushelPriceInDollars = parseFloat(currentBushelPriceString);

        if (isNaN(currentBushelPriceInDollars)) {
            alert("Não foi possível obter a cotação atual. Tente novamente mais tarde.");
            return;
        }

        const unit = unitSelect.value;
        const BUSHEL_IN_KG = 27.2155;
        const pricePerKg = currentBushelPriceInDollars / BUSHEL_IN_KG;
        let totalValue = 0;

        if (unit === 'bags') { // Sacos de 60kg
            totalValue = quantity * (pricePerKg * 60);
        } else if (unit === 'tonnes') { // Toneladas
            totalValue = quantity * (pricePerKg * 1000);
        }

        resultValueEl.textContent = `US$ ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        resultDiv.style.display = 'block';
    }

    if (openCalculatorBtn) openCalculatorBtn.addEventListener('click', () => calculatorModal.classList.add('visible'));
    if (closeCalculatorBtn) closeCalculatorBtn.addEventListener('click', () => calculatorModal.classList.remove('visible'));
    if (calculatorModal) {
        calculatorModal.addEventListener('click', (event) => {
            if (event.target === calculatorModal) calculatorModal.classList.remove('visible');
        });
    }
    if (calculateValueBtn) calculateValueBtn.addEventListener('click', calculateSoyValue);

    refreshTicker();
});