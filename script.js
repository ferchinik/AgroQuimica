document.addEventListener('DOMContentLoaded', () => {

    // --- FUNCIONALIDADE DO CABEÇALHO ---
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


    // --- CÓDIGO DO SLIDER DE DEPOIMENTOS (VERSÃO FINAL COM LOOP INFINITO) ---
    const sliderWrapper = document.querySelector('.testimonial-slider-wrapper');
    if (sliderWrapper) {
        const slider = sliderWrapper.querySelector('.testimonial-slider');
        const prevButton = sliderWrapper.querySelector('.slider-btn.prev');
        const nextButton = sliderWrapper.querySelector('.slider-btn.next');

        if (slider && prevButton && nextButton) {
            let slides = Array.from(slider.children);
            let isTransitioning = false;
            let currentIndex = 1;

            const firstClone = slides[0].cloneNode(true);
            const lastClone = slides[slides.length - 1].cloneNode(true);

            slider.appendChild(firstClone);
            slider.insertBefore(lastClone, slides[0]);

            slides = Array.from(slider.children);

            const setSliderPosition = () => {
                slider.style.transform = `translateX(-${currentIndex * 100}%)`;
            };

            const jumpToPosition = () => {
                slider.style.transition = 'none';
                setSliderPosition();
            }

            jumpToPosition();

            slider.addEventListener('transitionend', () => {
                if (currentIndex === 0) {
                    currentIndex = slides.length - 2;
                    jumpToPosition();
                } else if (currentIndex === slides.length - 1) {
                    currentIndex = 1;
                    jumpToPosition();
                }
                isTransitioning = false;
            });

            const moveToNext = () => {
                if (isTransitioning) return;
                isTransitioning = true;
                currentIndex++;
                slider.style.transition = 'transform 0.5s ease-in-out';
                setSliderPosition();
            };

            const moveToPrev = () => {
                if (isTransitioning) return;
                isTransitioning = true;
                currentIndex--;
                slider.style.transition = 'transform 0.5s ease-in-out';
                setSliderPosition();
            };

            nextButton.addEventListener('click', moveToNext);
            prevButton.addEventListener('click', moveToPrev);
            window.addEventListener('resize', jumpToPosition);
        }
    }


    // --- CÓDIGO DO TICKER E CALCULADORA ---
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
        const apiKey = "KUOcZleI4QcBT5mSxIPNBkanTEWka116";
        const apiUrl = `https://financialmodelingprep.com/api/v3/quote/ZS=F?apikey=${apiKey}`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error(`Erro na API: ${response.statusText}`);

            const data = await response.json();
            const soyData = data[0];
            if (!soyData) throw new Error("Dados da soja não encontrados na resposta da API.");

            return {
                price: soyData.price,
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
        if (!quantityInput || !unitSelect || !tickerPriceEl || !resultValueEl || !resultDiv) return;

        const quantity = parseFloat(quantityInput.value);
        if (isNaN(quantity) || quantity <= 0) {
            alert("Por favor, insira uma quantidade válida.");
            return;
        }

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

        if (unit === 'bags') {
            totalValue = quantity * (pricePerKg * 60);
        } else if (unit === 'tonnes') {
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

    if (tickerPriceEl) {
        refreshTicker();
    }

    const productData = {
        protekbio2: {
            title: "Protek Bio 2",
            image: "img/protekbio2.png",
            description: "Uma evolução do Protek Bio, com formulação aprimorada para um desenvolvimento inicial ainda mais vigoroso da planta."
        },
        sikariplus: {
            title: "Sikari Plus",
            image: "img/sikariplus.png",
            description: "Inseticida de suspensão concentrada (SC) que atua por contato e ingestão, protegendo eficazmente sua lavoura."
        },
        tempus: {
            title: "Tempus",
            image: "img/tempus.png",
            description: "Fungicida sistêmico e de contato com ação dos grupos químicos Estrobilurina e Triazol, oferecendo dupla proteção."
        },
        vitality: {
            title: "Vitality",
            image: "img/vitality.png",
            description: "Fungicida microbiológico que atua sobre os principais patógenos de solo, promovendo um ambiente saudável para as raízes."
        },
        kitcompleto_bio: {
            title: "Kit Completo +Bio",
            image: "img/kitcompleto.png",
            description: "Una solución integral que combina lo mejor de la tecnología química y biológica para proteger sus semillas desde el principio. Garantiza una germinación vigorosa y un desarrollo inicial saludable para maximizar el potencial de su cultivo."
        },
        kaosultra: {
            title: "Kaos Ultra",
            image: "img/kaos.png",
            description: "Kaos Ultra es el herbicida a base de glifosato más potente, concentrado y eficiente disponible en el mercado, con una concentración del 88,8% y un equivalente ácido del 80,83%. Este producto redefine la eficacia en el control de malezas. Su formulación en gránulos solubles en agua (SG) garantiza una disolución óptima, requiere menos espacio de almacenamiento y proporciona una facilidad de uso inigualable."
        },
        bior1: {
            title: "Bio-R1",
            image: "img/bio-r1.png",
            description: "Bio-R1 es lo mas nuevo en fungicida microbiológico con su formulación ultra concentrada y exclusiva, este producto ofrece un control superior de enfermedades de suelo como marchitez y turbamientos, garantizando un efecto residual prolongado y mayor resistencia del cultivo frente a la sequía."
        },
        bm163: {
            title: "BM 163 PRO4",
            image: "img/maiz 163.png",
            description: "Es un híbrido de ciclo precoz con grano semidentado amarillo, desarrollado para productores que buscan altas productividades y máxima eficiencia en manejo intensivo. Responde de manera excepcional a altos niveles de fertilización y aplicaciones de fungicidas, garantizando estabilidad y rendimiento."
        },
        bm166: {
            title: "BM166 VIP3",
            image: "img/maiz 166.png",
            description: "Es un híbrido superprecoz con grano semidentado amarillo, que combina alto rendimiento, excelente sanidad y gran adaptación. Su tecnología VIP3 le otorga tolerancia a las principales orugas del maíz y a la aplicación de glifosato y glufosinato, brindando mayor seguridad y flexibilidad en el manejo del cultivo."
        },
        bm767: {
            title: "BM767 ATTACK",
            image: "img/mais 767.png",
            description: "Híbrido con gen nativo de tolerancia a pulgones, no OGM, que brinda alta resistencia al pulgón de la caña y al pulgón verde, garantizando mayor sanidad y estabilidad del cultivo. De ciclo súper precoz, con grano gris de bajo contenido de tanino, ofrece excelente respuesta a la inversión y un destacado stay green, manteniendo el cultivo verde y productivo hasta la cosecha."
        },
        aminomax: {
            title: "Aminomax Extra",
            image: "img/aminomax.png",
            description: "Facilita el manejo y la aplicación, optimizando la mano de obra y reduciendo costos operativos. Mejora el metabolismo vegetal y el sistema antioxidante, favoreciendo una mayor absorción de nutrientes y agua, así como un desarrollo radicular más intenso. Aumenta la formación y retención de clorofila, elevando la actividad fotosintética y la producción de fotoasimilados."
        },
        kitduo: {
            title: "Kit Completo Duo",
            image: "img/kit duo.png",
            description: "Una formulación completa que une la eficacia química con la innovación biológica para brindar una protección integral y un desarrollo inicial superior. Favorece una emergencia uniforme, raíces más fuertes y plantas más sanas, impulsando el potencial productivo del cultivo."
        }
    };

    const productModal = document.getElementById('product-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const detailButtons = document.querySelectorAll('.btn-details');
    const modalImage = document.getElementById('modal-product-image');
    const modalTitle = document.getElementById('modal-product-title');
    const modalDescription = document.getElementById('modal-product-description');

    function openModal(productKey) {
        const product = productData[productKey];
        if (product && productModal) {
            modalImage.src = product.image;
            modalTitle.textContent = product.title;
            modalDescription.textContent = product.description;
            productModal.classList.add('visible');
        }
    }

    function closeModal() {
        if (productModal) {
            productModal.classList.remove('visible');
        }
    }

    detailButtons.forEach(button => {
        button.addEventListener('click', () => {
            const productKey = button.dataset.product;
            openModal(productKey);
        });
    });

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    if (productModal) {
        productModal.addEventListener('click', (event) => {
            if (event.target === productModal) {
                closeModal();
            }
        });
    }

    // --- LÓGICA "MOSTRAR MÁS" DA SEÇÃO DE POLÍTICAS ---
    const policyCards = document.querySelectorAll('.policy-card');
    policyCards.forEach(card => {
        const button = card.querySelector('.btn-toggle-policy');
        const content = card.querySelector('.collapsible-content');

        if (button && content) {
            button.addEventListener('click', () => {
                card.classList.toggle('expanded');
                if (card.classList.contains('expanded')) {
                    button.textContent = 'Mostrar Menos';
                } else {
                    button.textContent = 'Mostrar Más';
                }
            });
        }
        else if (button && !content) {
            button.style.display = 'none';
        }
    });

});