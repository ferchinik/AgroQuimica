document.addEventListener('DOMContentLoaded', () => {
    // --- FUNCIONALIDADE DO CABEÇALHO ---
    const header = document.querySelector('.header');
    const hamburger = document.querySelector('.hamburger');
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    // Função para abrir e fechar o menu mobile
    function toggleMenu() {
        const isExpanded = navbar.classList.toggle('active');
        // Impede a rolagem do corpo da página quando o menu está aberto
        document.body.style.overflow = isExpanded ? 'hidden' : '';
        hamburger.setAttribute('aria-expanded', isExpanded);

        // Atualiza o ícone do hamburger para um "X" quando o menu está aberto
        const icon = hamburger.querySelector('svg');
        if (isExpanded) {
            // Ícone "X" para fechar
            icon.innerHTML = '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>';
        } else {
            // Ícone "hambúrguer" padrão
            icon.innerHTML = '<line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>';
        }
    }

    // Função para rolagem suave até a seção
    function scrollToSection(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');

        // Permite a navegação normal para links que não são âncoras de seção
        if (targetId.length <= 1) {
            window.location.href = targetId;
            return;
        }

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            // Fecha o menu mobile, se estiver aberto, antes de rolar
            if (navbar.classList.contains('active')) {
                toggleMenu();
            }

            // Calcula a posição de rolagem, compensando a altura do cabeçalho
            const headerOffset = 100;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }

    // Função para destacar a seção ativa na navegação
    function setActiveSection() {
        const scrollPosition = window.scrollY + 150; // Ajuste para maior precisão

        let currentSectionId = '';
        sections.forEach(section => {
            if (scrollPosition >= section.offsetTop) {
                currentSectionId = '#' + section.getAttribute('id');
            }
        });

        // Caso especial para garantir que o último item seja destacado no final da página
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

        // Adiciona uma sombra ao cabeçalho ao rolar a página
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    // Adiciona os "escutadores" de eventos
    if (hamburger && navbar) {
        hamburger.addEventListener('click', toggleMenu);
    }

    navLinks.forEach(link => {
        link.addEventListener('click', scrollToSection);
    });

    window.addEventListener('scroll', setActiveSection);
    window.addEventListener('load', setActiveSection); // Executa ao carregar a página

    // --- CÓDIGO DO SLIDER DE DEPOIMENTOS ---
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

    // --- CÓDIGO DO TICKER E CALCULADORA DE SOJA ---
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
    
    // --- NOVA FUNÇÃO PARA BUSCAR DADOS REAIS DA COTAÇÃO ---
    async function fetchSoybeanData() {
        console.log("Buscando dados de cotação da API...");
        // URL da API gratuita para cotação de commodities (Soja = SOYBN)
        const apiUrl = 'https://api.commodities.ai/v1/commodities/SOYBN';
        
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`Erro na API: ${response.statusText}`);
            }
            const data = await response.json();
            
            // A API retorna o preço em dólares. O ticker original mostrava em centavos, então multiplicamos por 100.
            const priceInCents = data.price * 100;

            return {
                price: priceInCents,
                change: data.change, 
                percentChange: data.percentChange 
            };
        } catch (error) {
            console.error("Erro ao buscar dados de cotação:", error);
            // Se a API falhar, retorna os valores antigos para não quebrar o site
            return {
                price: 991.00, // Valor de fallback
                change: -7.50,
                percentChange: -0.75
            };
        }
    }

    // Função para atualizar a interface do ticker (sem alterações)
    function updateTickerUI(data) {
        if (!tickerPriceEl) return;
        
        // O ticker mostra o valor em centavos, então usamos o valor já convertido.
        tickerPriceEl.textContent = data.price.toFixed(2);
        
        // A variação na API já vem em dólares, então não precisa converter.
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
        updateTickerUI(data);
    }

    // --- LÓGICA DA CALCULADORA (sem alterações) ---
    function calculateSoyValue() {
        const quantity = parseFloat(quantityInput.value);
        if (isNaN(quantity) || quantity <= 0) {
            alert("Por favor, insira uma quantidade válida.");
            return;
        }

        const unit = unitSelect.value;
        const currentBushelPriceInCents = parseFloat(tickerPriceEl.textContent);
        const currentBushelPriceInDollars = currentBushelPriceInCents / 100;
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

    // Eventos para abrir e fechar a calculadora
    if (openCalculatorBtn) {
        openCalculatorBtn.addEventListener('click', () => calculatorModal.classList.add('visible'));
    }
    if (closeCalculatorBtn) {
        closeCalculatorBtn.addEventListener('click', () => calculatorModal.classList.remove('visible'));
    }
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

    // Inicia o ticker ao carregar a página
    refreshTicker();

    // Opcional: Atualiza o ticker a cada 5 minutos
    setInterval(refreshTicker, 300000); 
});