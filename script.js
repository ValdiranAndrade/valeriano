// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== DOM CARREGADO ===');
    console.log('Inicializando funcionalidades...');
    
    // Teste básico
    console.log('Testando elementos...');
    const testSlides = document.querySelectorAll('.hero-slide');
    const testIndicators = document.querySelectorAll('.indicator');
    console.log('Slides no DOM:', testSlides.length);
    console.log('Indicadores no DOM:', testIndicators.length);
    
    // Inicializar todas as funcionalidades
    initScrollEffects();
    
    // Inicializar carrossel da hero
    initHeroCarousel();
    
    // Inicializar showcase de produtos
    initShowcase();
    
    // Verificar logo do rodapé
    checkFooterLogo();
    
    initCarousel();
    initButtons();
    initSmoothScrolling();
    initAnimations();
    clearAutoFavorites(); // Limpar favoritos automáticos
    checkFavoritesState();
    initSearch();
    initWarningModal(); // Inicializar modal de aviso
    initHamburgerMenu(); // Inicializar menu hamburger para mobile
    
    // Listener para atualizar favoritos quando removidos da página de favoritos
    window.addEventListener('message', function(event) {
        if (event.data.type === 'REMOVE_FROM_FAVORITES') {
            const productName = event.data.productName;
            const likeButtons = document.querySelectorAll('.like-btn');
            
            likeButtons.forEach(button => {
                const productCard = button.closest('.product-card');
                const cardProductName = productCard.querySelector('h3').textContent;
                
                if (cardProductName === productName) {
                    button.classList.remove('liked');
                    const icon = button.querySelector('i');
                    icon.className = 'far fa-heart';
                }
            });
        }
    });
});


// Efeitos de Scroll
function initScrollEffects() {
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = 'none';
        }
    });
}

// Carrossel da Hero - Versão Simplificada
function initHeroCarousel() {
    console.log('=== INICIANDO CARROSSEL DA HERO ===');
    
    // Aguardar um pouco mais para garantir que o DOM está pronto
    setTimeout(() => {
        const slides = document.querySelectorAll('.hero-slide');
        const indicators = document.querySelectorAll('.indicator');
        
        console.log('Slides encontrados:', slides.length);
        console.log('Indicadores encontrados:', indicators.length);
        
        if (slides.length === 0) {
            // Não é erro - algumas páginas não têm carrossel
            return;
        }
        
        if (indicators.length === 0) {
            // Não é erro - algumas páginas não têm indicadores
            return;
        }
        
        let currentSlide = 0;
        const totalSlides = slides.length;
        let autoSlideInterval;
        
        // Função para mostrar slide
        function showSlide(index) {
            console.log('Mostrando slide:', index);
            
            // Remover active de todos
            slides.forEach(slide => slide.classList.remove('active'));
            indicators.forEach(indicator => indicator.classList.remove('active'));
            
            // Adicionar active ao atual
            if (slides[index]) {
                slides[index].classList.add('active');
                console.log('Slide', index, 'ativado');
            }
            if (indicators[index]) {
                indicators[index].classList.add('active');
                console.log('Indicador', index, 'ativado');
            }
            
            currentSlide = index;
        }
        
        // Função para próximo slide
        function nextSlide() {
            const nextIndex = (currentSlide + 1) % totalSlides;
            console.log('Próximo slide:', nextIndex);
            showSlide(nextIndex);
        }
        
        // Iniciar auto slide
        function startAutoSlide() {
            if (autoSlideInterval) {
                clearInterval(autoSlideInterval);
            }
            autoSlideInterval = setInterval(() => {
                console.log('Auto slide executando...');
                nextSlide();
            }, 4000);
            console.log('Auto slide iniciado (4 segundos)');
        }
        
        // Parar auto slide
        function stopAutoSlide() {
            if (autoSlideInterval) {
                clearInterval(autoSlideInterval);
                autoSlideInterval = null;
                console.log('Auto slide parado');
            }
        }
        
        // Adicionar eventos aos indicadores
        indicators.forEach((indicator, index) => {
            console.log('Configurando indicador', index);
            
            // Tornar clicável
            indicator.style.cursor = 'pointer';
            indicator.style.pointerEvents = 'auto';
            
            // Adicionar evento de clique
            indicator.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('CLIQUE NO INDICADOR', index);
                showSlide(index);
                stopAutoSlide();
                setTimeout(startAutoSlide, 3000);
            });
            
            // Adicionar evento de hover
            indicator.addEventListener('mouseenter', function() {
                console.log('Hover no indicador', index);
            });
        });
        
        // Inicializar
        console.log('Inicializando carrossel...');
        showSlide(0);
        startAutoSlide();
        
        // Adicionar movimento automático das imagens
        function animateImages() {
            const time = Date.now() * 0.001;
            const parallaxY = Math.sin(time * 0.5) * 15; // Movimento vertical suave
            const parallaxX = Math.cos(time * 0.3) * 10; // Movimento horizontal suave
            
            slides.forEach(slide => {
                const heroImage = slide.querySelector('.hero-image img');
                if (heroImage) {
                    heroImage.style.transform = `scale(1.05) translate(${parallaxX}px, ${parallaxY}px)`;
                }
            });
            
            requestAnimationFrame(animateImages);
        }
        
        // Iniciar animação automática
        animateImages();
        
        console.log('=== CARROSSEL INICIALIZADO COM SUCESSO ===');
        
    }, 1000); // Aguardar 1 segundo
}

// Showcase de Produtos
// Variável global para o índice do showcase
let showcaseCurrentIndex = 0;

function initShowcase() {
    console.log('Inicializando showcase de produtos...');
    
    const showcaseTrack = document.querySelector('.showcase-track');
    const showcaseContainer = document.querySelector('.showcase-container');
    const productCards = document.querySelectorAll('.product-card');
    const prevBtn = document.querySelector('.showcase-nav.prev');
    const nextBtn = document.querySelector('.showcase-nav.next');
    
    if (!showcaseTrack || !productCards.length) {
        console.log('Showcase não encontrado');
        return;
    }
    
    // Verificar se é mobile
    const isMobile = window.innerWidth <= 768;
    
    showcaseCurrentIndex = 0;
    const cardsPerView = 3;
    const totalCards = productCards.length;
    const maxIndex = Math.max(0, totalCards - cardsPerView);
    
    console.log('Cards encontrados:', totalCards);
    console.log('Cards por visualização:', cardsPerView);
    console.log('É mobile:', isMobile);
    
    function updateShowcase() {
        // No mobile, não usar transform, deixar o scroll nativo funcionar
        if (isMobile) {
            showcaseTrack.style.transform = 'none';
            // Atualizar estado dos botões (opcional no mobile)
            if (prevBtn) prevBtn.style.opacity = '0.3';
            if (nextBtn) nextBtn.style.opacity = '0.3';
            return;
        }
        
        const cardWidth = productCards[0].offsetWidth + 32; // width + gap
        const translateX = -showcaseCurrentIndex * cardWidth;
        showcaseTrack.style.transform = `translateX(${translateX}px)`;
        
        // Atualizar estado dos botões
        if (prevBtn) prevBtn.style.opacity = showcaseCurrentIndex === 0 ? '0.5' : '1';
        if (nextBtn) nextBtn.style.opacity = showcaseCurrentIndex >= maxIndex ? '0.5' : '1';
        
        console.log('Showcase atualizado - índice:', showcaseCurrentIndex);
    }
    
    // Event listeners
    if (prevBtn) {
        prevBtn.addEventListener('click', () => moveShowcase(-1));
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => moveShowcase(1));
    }
    
    // No mobile, esconder os botões de navegação ou torná-los menos visíveis
    if (isMobile) {
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
    }
    
    // Funcionalidade dos botões de like
    const likeButtons = document.querySelectorAll('.like-btn');
    likeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            this.classList.toggle('liked');
            const icon = this.querySelector('i');
            
            if (this.classList.contains('liked')) {
                icon.className = 'fas fa-heart';
                showNotification('Adicionado aos favoritos!', 'success');
                
                // Adicionar produto aos favoritos
                const productCard = this.closest('.product-card');
                const productName = productCard.querySelector('h3').textContent;
                const productPrice = productCard.querySelector('.price').textContent;
                const productImage = productCard.querySelector('img').src;
                const productAlt = productCard.querySelector('img').alt;
                
                addToFavorites({
                    id: Date.now(), // ID único baseado no timestamp
                    name: productName,
                    price: productPrice,
                    image: productImage,
                    alt: productAlt
                });
            } else {
                icon.className = 'far fa-heart';
                showNotification('Removido dos favoritos', 'info');
                
                // Remover produto dos favoritos
                const productCard = this.closest('.product-card');
                const productName = productCard.querySelector('h3').textContent;
                removeFromFavorites(productName);
            }
        });
    });
    
    // Funcionalidade das opções de cores
    const colorSwatches = document.querySelectorAll('.color-swatch');
    colorSwatches.forEach(swatch => {
        swatch.addEventListener('click', function() {
            // Remover active de todos os swatches do mesmo produto
            const productCard = this.closest('.product-card');
            const allSwatches = productCard.querySelectorAll('.color-swatch');
            allSwatches.forEach(s => s.classList.remove('active'));
            
            // Adicionar active ao clicado
            this.classList.add('active');
            
            // Atualizar texto da cor selecionada
            const colorName = this.getAttribute('data-color');
            const selectedColorSpan = productCard.querySelector('.selected-color');
            if (selectedColorSpan) {
                selectedColorSpan.textContent = colorName.charAt(0).toUpperCase() + colorName.slice(1);
            }
        });
    });
    
    // Inicializar
    updateShowcase();
    console.log('Showcase inicializado com sucesso!');
}

// Função global para o showcase (para uso nos botões HTML)
function moveShowcase(direction) {
    const showcaseTrack = document.querySelector('.showcase-track');
    const showcaseContainer = document.querySelector('.showcase-container');
    const productCards = document.querySelectorAll('.product-card');
    
    if (!showcaseTrack || !productCards.length) return;
    
    // Verificar se é mobile
    const isMobile = window.innerWidth <= 768;
    
    // No mobile, usar scroll nativo
    if (isMobile && showcaseContainer) {
        const scrollAmount = showcaseContainer.offsetWidth * 0.8;
        const currentScroll = showcaseContainer.scrollLeft;
        const newScroll = currentScroll + (direction * scrollAmount);
        showcaseContainer.scrollTo({
            left: newScroll,
            behavior: 'smooth'
        });
        return;
    }
    
    const cardsPerView = 3;
    const totalCards = productCards.length;
    const maxIndex = Math.max(0, totalCards - cardsPerView);
    
    if (direction === -1 && showcaseCurrentIndex > 0) {
        showcaseCurrentIndex--;
    } else if (direction === 1 && showcaseCurrentIndex < maxIndex) {
        showcaseCurrentIndex++;
    }
    
    const cardWidth = productCards[0].offsetWidth + 32;
    const translateX = -showcaseCurrentIndex * cardWidth;
    showcaseTrack.style.transform = `translateX(${translateX}px)`;
    
    // Atualizar estado dos botões
    const prevBtn = document.querySelector('.showcase-nav.prev');
    const nextBtn = document.querySelector('.showcase-nav.next');
    
    if (prevBtn) prevBtn.style.opacity = showcaseCurrentIndex === 0 ? '0.5' : '1';
    if (nextBtn) nextBtn.style.opacity = showcaseCurrentIndex >= maxIndex ? '0.5' : '1';
}

// Verificar logo do rodapé
function checkFooterLogo() {
    const footerLogoImg = document.querySelector('.footer-logo-image');
    
    if (!footerLogoImg) {
        console.log('Logo do rodapé não encontrada');
        return;
    }
    
    // Verificar se a imagem carregou
    footerLogoImg.addEventListener('load', function() {
        console.log('Logo do rodapé carregada com sucesso');
        this.style.display = 'block';
    });
    
    footerLogoImg.addEventListener('error', function() {
        console.log('Erro ao carregar logo do rodapé, usando fallback');
        this.style.display = 'none';
        
        // Mostrar texto de fallback
        const footerLogo = document.querySelector('.footer-logo');
        if (footerLogo) {
            footerLogo.innerHTML = '<h3 style="color: #fff; font-size: 1.5rem; font-weight: 700; letter-spacing: 2px; margin: 0;">VALERIANO</h3>';
        }
    });
    
    // Verificar se a imagem já carregou
    if (footerLogoImg.complete && footerLogoImg.naturalHeight !== 0) {
        console.log('Logo do rodapé já carregada');
    } else {
        console.log('Aguardando carregamento da logo do rodapé...');
    }
}


// Carrossel de Produtos
function initCarousel() {
    const carouselTrack = document.querySelector('.carousel-track');
    const productItems = document.querySelectorAll('.product-item');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    
    if (!carouselTrack || !productItems.length) return;
    
    let currentIndex = 0;
    const itemsPerView = 4;
    const totalItems = productItems.length;
    
    function updateCarousel() {
        const itemWidth = productItems[0].offsetWidth + 32; // width + gap
        const translateX = -currentIndex * itemWidth;
        carouselTrack.style.transform = `translateX(${translateX}px)`;
        
        // Atualizar estado dos botões
        prevBtn.style.opacity = currentIndex === 0 ? '0.5' : '1';
        nextBtn.style.opacity = currentIndex >= totalItems - itemsPerView ? '0.5' : '1';
    }
    
    function moveCarousel(direction) {
        const maxIndex = Math.max(0, totalItems - itemsPerView);
        
        if (direction === -1 && currentIndex > 0) {
            currentIndex--;
        } else if (direction === 1 && currentIndex < maxIndex) {
            currentIndex++;
        }
        
        updateCarousel();
    }
    
    // Event listeners
    if (prevBtn) prevBtn.addEventListener('click', () => moveCarousel(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => moveCarousel(1));
    
    // Inicializar
    updateCarousel();
    
    // Responsividade
    function handleResize() {
        const newItemsPerView = window.innerWidth <= 768 ? 1 : window.innerWidth <= 1024 ? 2 : 4;
        if (newItemsPerView !== itemsPerView) {
            currentIndex = 0;
            updateCarousel();
        }
    }
    
    window.addEventListener('resize', handleResize);
    
    // Adicionar ao carrinho
    const productItemsCart = document.querySelectorAll('.product-item');
    productItemsCart.forEach(item => {
        item.addEventListener('click', function() {
            const productName = this.querySelector('h3').textContent;
            showNotification(`${productName} adicionado ao carrinho!`, 'success');
        });
    });
}

// Função global para o carrossel (para uso nos botões HTML)
function moveCarousel(direction) {
    const carouselTrack = document.querySelector('.carousel-track');
    const productItems = document.querySelectorAll('.product-item');
    
    if (!carouselTrack || !productItems.length) return;
    
    let currentIndex = parseInt(carouselTrack.dataset.currentIndex || '0');
    const itemsPerView = window.innerWidth <= 768 ? 1 : window.innerWidth <= 1024 ? 2 : 4;
    const totalItems = productItems.length;
    const maxIndex = Math.max(0, totalItems - itemsPerView);
    
    if (direction === -1 && currentIndex > 0) {
        currentIndex--;
    } else if (direction === 1 && currentIndex < maxIndex) {
        currentIndex++;
    }
    
    const itemWidth = productItems[0].offsetWidth + 32;
    const translateX = -currentIndex * itemWidth;
    carouselTrack.style.transform = `translateX(${translateX}px)`;
    carouselTrack.dataset.currentIndex = currentIndex;
    
    // Atualizar estado dos botões
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    
    if (prevBtn) prevBtn.style.opacity = currentIndex === 0 ? '0.5' : '1';
    if (nextBtn) nextBtn.style.opacity = currentIndex >= maxIndex ? '0.5' : '1';
}

// Scroll Suave
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Funcionalidades dos botões
function initButtons() {
    // Botões do catálogo
    const catalogButtons = document.querySelectorAll('.btn-catalog, .btn-catalog-outline');
    catalogButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Removido: showNotification('Redirecionando para o catálogo...', 'info');
        });
    });
}


// Animações de Entrada
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, observerOptions);
    
    // Observar elementos para animação
    const animatedElements = document.querySelectorAll('.feature-item, .product-card, .about-text, .about-image, .contact-item');
    animatedElements.forEach(el => {
        el.classList.add('scroll-reveal');
        observer.observe(el);
    });
}

// Sistema de Notificações - Desabilitado
function showNotification(message, type = 'info') {
    // Notificações desabilitadas
    return;
}

// Função para adicionar produtos aos favoritos
function addToFavorites(product) {
    let favorites = JSON.parse(localStorage.getItem('favoriteProducts')) || [];
    
    // Verificar se o produto já existe nos favoritos
    const existingProduct = favorites.find(fav => fav.name === product.name);
    if (!existingProduct) {
        favorites.push(product);
        localStorage.setItem('favoriteProducts', JSON.stringify(favorites));
        console.log('Produto adicionado aos favoritos:', product);
    }
}

// Função para remover produtos dos favoritos
function removeFromFavorites(productName) {
    let favorites = JSON.parse(localStorage.getItem('favoriteProducts')) || [];
    favorites = favorites.filter(fav => fav.name !== productName);
    localStorage.setItem('favoriteProducts', JSON.stringify(favorites));
    console.log('Produto removido dos favoritos:', productName);
}

// Função para verificar estado dos favoritos ao carregar a página
function checkFavoritesState() {
    const favorites = JSON.parse(localStorage.getItem('favoriteProducts')) || [];
    const likeButtons = document.querySelectorAll('.like-btn');
    
    likeButtons.forEach(button => {
        const productCard = button.closest('.product-card');
        const productName = productCard.querySelector('h3').textContent;
        const icon = button.querySelector('i');
        
        // Verificar se o produto está nos favoritos
        const isInFavorites = favorites.some(fav => fav.name === productName);
        
        if (isInFavorites) {
            button.classList.add('liked');
            icon.className = 'fas fa-heart';
        } else {
            button.classList.remove('liked');
            icon.className = 'far fa-heart';
        }
    });
}

// Função para limpar favoritos automáticos (executar uma vez para limpar)
function clearAutoFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favoriteProducts')) || [];
    
    // Remover produtos que foram adicionados automaticamente
    const autoProducts = ['Conjunto Branco', 'Vestido Branco', 'Camiseta Casual'];
    const cleanedFavorites = favorites.filter(fav => !autoProducts.includes(fav.name));
    
    if (cleanedFavorites.length !== favorites.length) {
        localStorage.setItem('favoriteProducts', JSON.stringify(cleanedFavorites));
        console.log('Favoritos automáticos removidos');
    }
}

// Funções de Pesquisa
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    
    if (searchInput) {
        // Pesquisar ao pressionar Enter
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        // Pesquisar ao digitar (com delay)
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                if (this.value.trim().length > 2) {
                    performSearch();
                }
            }, 500);
        });
    }
}

// Lista de produtos disponíveis em todas as páginas
const produtosDisponiveis = [
    { nome: 'camiseta', nomeExibicao: 'Camiseta', pagina: 'camisetas.html', termos: ['camiseta', 'camisa', 'blusa'] },
    { nome: 'camiseta oversize', nomeExibicao: 'Camiseta Oversize', pagina: 'produto.html', termos: ['camiseta oversize', 'oversize', 'camiseta grande'] },
    { nome: 'shorts', nomeExibicao: 'Shorts', pagina: 'SHORTZIN.html', termos: ['shorts', 'bermuda', 'short'] },
    { nome: 'casaco', nomeExibicao: 'Casaco', pagina: 'casacos.html', termos: ['casaco', 'jaqueta', 'blusa de frio'] },
    { nome: 'casaco sem capuz', nomeExibicao: 'Casaco sem Capuz', pagina: 'casacosemcapuz.html', termos: ['casaco sem capuz', 'casaco', 'sem capuz'] },
    { nome: 'casaco com capuz', nomeExibicao: 'Casaco com Capuz', pagina: 'casacocomcapuz.html', termos: ['casaco com capuz', 'casaco', 'com capuz', 'moletom'] },
    { nome: 'boné', nomeExibicao: 'Boné', pagina: 'Catalogo_Boné.html', termos: ['boné', 'bone', 'chapeu', 'chapéu'] }
];

function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (!searchTerm) {
        return;
    }
    
    // Primeiro, tentar buscar produtos na página atual
    const productCards = document.querySelectorAll('.product-card');
    let foundProduct = null;
    
    productCards.forEach(card => {
        const productName = card.querySelector('h3')?.textContent.toLowerCase() || '';
        const productLink = card.closest('a') || card.querySelector('a');
        
        if (productName.includes(searchTerm)) {
            foundProduct = { card, link: productLink };
        }
    });
    
    // Se encontrou na página atual, destacar e rolar até ele
    if (foundProduct && foundProduct.card) {
        foundProduct.card.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
        
        // Destacar o produto encontrado
        foundProduct.card.style.border = '3px solid #000';
        foundProduct.card.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.3)';
        
        // Remover destaque após 3 segundos
        setTimeout(() => {
            foundProduct.card.style.border = '';
            foundProduct.card.style.boxShadow = '';
        }, 3000);
        
        // Limpar o campo de pesquisa
        if (searchInput) {
            searchInput.value = '';
        }
        return;
    }
    
    // Se não encontrou na página atual, buscar em todas as páginas
    const produtoEncontrado = produtosDisponiveis.find(produto => {
        // Verificar se o termo de busca corresponde ao nome ou aos termos de busca
        return produto.nome.toLowerCase().includes(searchTerm) ||
               produto.termos.some(termo => termo.toLowerCase().includes(searchTerm)) ||
               searchTerm.includes(produto.nome.toLowerCase());
    });
    
    if (produtoEncontrado) {
        // Redirecionar para a página do produto
        window.location.href = produtoEncontrado.pagina;
    } else {
        // Se não encontrou nenhum produto, mostrar mensagem
        showSearchNotification('Produto não encontrado. Tente buscar por: Camiseta, Shorts, Casaco ou Boné', 'info');
        if (searchInput) {
            searchInput.value = '';
        }
    }
}

// Função para mostrar notificação de pesquisa
function showSearchNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Estilos da notificação
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
        color: white;
        padding: 15px 20px;
        border-radius: 4px;
        font-size: 0.9rem;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover após 4 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Modal de Aviso
function initWarningModal() {
    // Verificar se o modal já foi aceito nesta sessão
    const modalAccepted = sessionStorage.getItem('modalAccepted');
    
    if (!modalAccepted) {
        showWarningModal();
    } else {
        // Se já foi aceito, esconder o modal
        const modal = document.getElementById('warningModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
}

function showWarningModal() {
    const modal = document.getElementById('warningModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevenir scroll da página
    }
}

function closeScamWarning() {
    // Apenas esconder a seção de golpes
    const scamWarning = document.querySelector('.scam-warning');
    if (scamWarning) {
        scamWarning.style.display = 'none';
    }
    
    // Verificar se os cookies também foram aceitos
    const cookiesAccepted = sessionStorage.getItem('cookiesAccepted');
    if (cookiesAccepted) {
        hideWarningModal();
    }
}

function acceptCookies() {
    // Marcar modal como aceito nesta sessão
    sessionStorage.setItem('modalAccepted', 'true');
    sessionStorage.setItem('cookiesAccepted', 'true');
    
    // Esconder o modal completamente
    hideWarningModal();
}

function hideWarningModal() {
    const modal = document.getElementById('warningModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restaurar scroll da página
    }
}

// ===== CARRINHO FUNCTIONALITY =====

// Sistema de Carrinho
let cartItems = [];

// Função para adicionar produto ao carrinho
function addToCart(product) {
    const existingItem = cartItems.find(item => 
        item.id === product.id && 
        item.color === product.color && 
        item.size === product.size
    );
    
    if (existingItem) {
        existingItem.quantity += product.quantity || 1;
    } else {
        cartItems.push({
            ...product,
            quantity: product.quantity || 1
        });
    }
    
    // Salvar no localStorage
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    
    // Atualizar contador do carrinho
    updateCartCounter();
    
    console.log('Produto adicionado ao carrinho:', product);
}

// Função para remover produto do carrinho
function removeFromCart(productId, color, size) {
    cartItems = cartItems.filter(item => 
        !(item.id === productId && item.color === color && item.size === size)
    );
    
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    updateCartCounter();
    
    console.log('Produto removido do carrinho');
}

// Função para atualizar quantidade no carrinho
function updateCartQuantity(productId, color, size, newQuantity) {
    const item = cartItems.find(item => 
        item.id === productId && item.color === color && item.size === size
    );
    
    if (item) {
        item.quantity = Math.max(1, Math.min(10, newQuantity));
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        updateCartCounter();
    }
}

// Função para atualizar contador do carrinho no header
function updateCartCounter() {
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const cartIcon = document.querySelector('.nav-icons .fa-shopping-bag');
    
    if (cartIcon) {
        // Remover contador existente
        const existingCounter = cartIcon.querySelector('.cart-counter');
        if (existingCounter) {
            existingCounter.remove();
        }
        
        // Adicionar novo contador se houver itens
        if (totalItems > 0) {
            const counter = document.createElement('span');
            counter.className = 'cart-counter';
            counter.textContent = totalItems;
            counter.style.cssText = `
                position: absolute;
                top: -8px;
                right: -8px;
                background: #000;
                color: #fff;
                width: 18px;
                height: 18px;
                border-radius: 50%;
                font-size: 0.7rem;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
            `;
            cartIcon.style.position = 'relative';
            cartIcon.appendChild(counter);
        }
    }
}

// Função para carregar carrinho do localStorage
function loadCartFromStorage() {
    const storedCart = localStorage.getItem('cartItems');
    if (storedCart) {
        cartItems = JSON.parse(storedCart);
        updateCartCounter();
    }
}

// Função para limpar carrinho
function clearCart() {
    cartItems = [];
    localStorage.removeItem('cartItems');
    updateCartCounter();
}

// Função para obter total do carrinho
function getCartTotal() {
    return cartItems.reduce((total, item) => {
        const price = parseFloat(item.price.replace('R$ ', '').replace(',', '.'));
        return total + (price * item.quantity);
    }, 0);
}

// Função para obter quantidade total de itens
function getCartItemsCount() {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
}

// Função para aplicar código promocional
function applyPromoCode(code) {
    const validCodes = {
        'VALERIANO10': { discount: 0.10, description: 'Desconto de 10%' },
        'FRETE20': { discount: 0.20, description: 'Desconto de 20%' },
        'BOASVINDAS': { discount: 0.15, description: 'Desconto de 15%' }
    };
    
    const promo = validCodes[code.toUpperCase()];
    if (promo) {
        return {
            success: true,
            discount: promo.discount,
            description: promo.description
        };
    }
    
    return { success: false, message: 'Código inválido' };
}

// Função para calcular frete
function calculateShipping(total) {
    if (total >= 200) {
        return { value: 0, message: 'Frete Grátis' };
    } else {
        return { value: 15.90, message: 'R$ 15,90' };
    }
}

// Função para mostrar notificação (versão melhorada)
function showCartNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `cart-notification ${type}`;
    notification.textContent = message;
    
    // Estilos da notificação
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
        color: white;
        padding: 15px 20px;
        border-radius: 4px;
        font-size: 0.9rem;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Inicializar carrinho quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    loadCartFromStorage();
    
    // Se estivermos na página do carrinho, inicializar funcionalidades específicas
    if (document.body.classList.contains('carrinho-page')) {
        initCartPage();
    }
});

// Função para inicializar página do carrinho
function initCartPage() {
    console.log('Inicializando página do carrinho...');
    
    // Carregar itens do carrinho e renderizar na página
    renderCartItems();
    
    // Configurar eventos dos controles de quantidade
    const quantityInputs = document.querySelectorAll('.qty-input');
    quantityInputs.forEach(input => {
        input.addEventListener('change', function() {
            const cartItem = this.closest('.cart-item');
            const productName = cartItem.querySelector('h3').textContent;
            const quantity = parseInt(this.value);
            
            // Atualizar quantidade no carrinho
            const item = cartItems.find(item => item.name === productName);
            if (item) {
                item.quantity = quantity;
                localStorage.setItem('cartItems', JSON.stringify(cartItems));
                updateItemTotal(cartItem);
                updateCartSummary();
            }
        });
    });
    
    // Configurar eventos dos botões de remover
    const removeButtons = document.querySelectorAll('.remove-btn');
    removeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const cartItem = this.closest('.cart-item');
            const productName = cartItem.querySelector('h3').textContent;
            
            // Remover do carrinho
            cartItems = cartItems.filter(item => item.name !== productName);
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
            
            // Remover da interface
            cartItem.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                cartItem.remove();
                updateCartSummary();
                updateItemsCount();
                updateCartCounter();
            }, 300);
        });
    });
}

// Função para renderizar itens do carrinho na página
function renderCartItems() {
    const cartItemsList = document.querySelector('.cart-items-list');
    if (!cartItemsList) return;
    
    // Limpar lista atual
    cartItemsList.innerHTML = '';
    
    if (cartItems.length === 0) {
        cartItemsList.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">
                    <i class="fas fa-shopping-cart"></i>
                </div>
                <h3>Seu carrinho está vazio</h3>
                <p>Adicione alguns produtos para começar sua compra</p>
                <a href="index.html" class="btn-continue-shopping">
                    <i class="fas fa-arrow-left"></i>
                    Continuar Comprando
                </a>
            </div>
        `;
        return;
    }
    
    // Renderizar cada item
    cartItems.forEach(item => {
        const cartItemElement = createCartItemElement(item);
        cartItemsList.appendChild(cartItemElement);
    });
    
    updateCartSummary();
    updateItemsCount();
}

// Função para criar elemento de item do carrinho
function createCartItemElement(item) {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
        <div class="item-image">
            <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="item-details">
            <h3>${item.name}</h3>
            <div class="item-attributes">
                <span class="attribute">Cor: ${item.color || 'N/A'}</span>
                <span class="attribute">Tamanho: ${item.size || 'N/A'}</span>
            </div>
            <div class="item-price">
                <span class="price">${item.price}</span>
            </div>
        </div>
        <div class="item-quantity">
            <label>Quantidade</label>
            <div class="quantity-controls">
                <button class="qty-btn minus" onclick="updateQuantity(this, -1)">
                    <i class="fas fa-minus"></i>
                </button>
                <input type="number" class="qty-input" value="${item.quantity}" min="1" max="10">
                <button class="qty-btn plus" onclick="updateQuantity(this, 1)">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        </div>
        <div class="item-total">
            <span class="total-price">R$ ${(parseFloat(item.price.replace('R$ ', '').replace(',', '.')) * item.quantity).toFixed(2).replace('.', ',')}</span>
        </div>
        <div class="item-actions">
            <button class="remove-btn" onclick="removeItem(this)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    return cartItem;
}

// Função para atualizar total do item
function updateItemTotal(input) {
    const cartItem = input.closest('.cart-item');
    const priceElement = cartItem.querySelector('.price');
    const totalElement = cartItem.querySelector('.total-price');
    const quantity = parseInt(input.value);
    
    const price = parseFloat(priceElement.textContent.replace('R$ ', '').replace(',', '.'));
    const total = price * quantity;
    
    totalElement.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

// Função para atualizar resumo do carrinho
function updateCartSummary() {
    const subtotal = getCartTotal();
    const shipping = calculateShipping(subtotal);
    
    // Verificar se há desconto promocional aplicado
    const discountLine = document.querySelector('.promo-discount');
    let discount = 0;
    
    if (discountLine && discountLine.style.display !== 'none') {
        const discountText = document.querySelector('.promo-discount .discount').textContent;
        discount = parseFloat(discountText.replace('-R$ ', '').replace(',', '.'));
    }
    
    const total = subtotal + shipping.value - discount;
    
    // Atualizar elementos na página
    const subtotalElement = document.querySelector('.summary-line span:last-child');
    const shippingElement = document.querySelector('.shipping-free');
    const totalElement = document.querySelector('.summary-total span:last-child');
    
    if (subtotalElement) {
        subtotalElement.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    }
    
    if (shippingElement) {
        shippingElement.textContent = shipping.message;
        shippingElement.className = shipping.value === 0 ? 'shipping-free' : '';
    }
    
    if (totalElement) {
        totalElement.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    }
}

// Função para atualizar contador de itens
function updateItemsCount() {
    const countElement = document.querySelector('.items-count');
    if (countElement) {
        const count = getCartItemsCount();
        countElement.textContent = `${count} ${count === 1 ? 'item' : 'itens'}`;
    }
}

// Função para adicionar produto ao carrinho e redirecionar
function addToCartAndRedirect() {
    // Detectar informações do produto baseado na página atual
    let productInfo = {};
    
    // Se estivermos em uma página de produto específica
    if (document.body.classList.contains('product-page')) {
        const productName = document.querySelector('.product-header h1')?.textContent || 'Produto';
        const productPrice = document.querySelector('.price')?.textContent || 'R$ 0,00';
        const productImage = document.querySelector('.main-image img')?.src || '';
        const selectedColor = document.querySelector('.color-btn.active')?.getAttribute('data-color') || 'N/A';
        const selectedSize = document.querySelector('.size-btn.active')?.textContent || 'N/A';
        const quantity = parseInt(document.getElementById('quantity')?.value) || 1;
        
        productInfo = {
            id: Date.now(),
            name: productName,
            price: productPrice,
            image: productImage,
            color: selectedColor,
            size: selectedSize,
            quantity: quantity
        };
    } else {
        // Para outras páginas, criar um produto genérico baseado na página
        const pageClass = document.body.className;
        let productName = 'Produto';
        let productPrice = 'R$ 199,90';
        let productImage = 'imagens/c1.png';
        
        if (pageClass.includes('shorts')) {
            productName = 'Shorts';
            productPrice = 'R$ 249,90';
            productImage = 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
        } else if (pageClass.includes('casaco')) {
            productName = 'Casaco';
            productPrice = 'R$ 199,90';
            productImage = 'imagens/c2.png';
        } else if (pageClass.includes('bone')) {
            productName = 'Boné';
            productPrice = 'R$ 159,90';
            productImage = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
        } else {
            productName = 'Camiseta';
            productPrice = 'R$ 299,90';
            productImage = 'imagens/c1.png';
        }
        
        productInfo = {
            id: Date.now(),
            name: productName,
            price: productPrice,
            image: productImage,
            color: 'Preto',
            size: 'M',
            quantity: 1
        };
    }
    
    // Adicionar ao carrinho
    addToCart(productInfo);
    
    // Mostrar notificação
    showCartNotification('Produto adicionado ao carrinho!', 'success');
    
    // Redirecionar para o carrinho após um pequeno delay
    setTimeout(() => {
        window.location.href = 'carrinho.html';
    }, 1000);
}

// ===== LOGIN MODAL FUNCTIONALITY =====


// Função para fechar o modal de login
function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto'; // Restaurar scroll da página
    }
}

// Função para mostrar formulário de código por email
function showEmailCodeForm() {
    showCartNotification('Funcionalidade de código por email em desenvolvimento', 'info');
    // Aqui você pode implementar a lógica para código por email
}

// Função para mostrar formulário de email e senha
function showEmailPasswordForm() {
    showCartNotification('Funcionalidade de login com email e senha em desenvolvimento', 'info');
    // Aqui você pode implementar a lógica para login com email e senha
}


// Fechar modal ao clicar fora dele
document.addEventListener('click', function(event) {
    const modal = document.getElementById('loginModal');
    if (modal && event.target === modal) {
        closeLoginModal();
    }
});

// Fechar modal com tecla ESC
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeLoginModal();
    }
});

// Função para verificar se usuário está logado e atualizar ícone
function updateUserIcon() {
    const userIcon = document.querySelector('.login-icon');
    
    if (userIcon) {
        const isLoggedIn = localStorage.getItem('userLoggedIn');
        
        if (isLoggedIn === 'true') {
            // Usuário logado - redirecionar para perfil
            userIcon.href = 'perfil.html';
            userIcon.onclick = null; // Remover onclick do modal
            
            // Adicionar indicador visual
            userIcon.style.color = '#000';
            userIcon.style.fontWeight = '600';
        } else {
            // Usuário não logado - redirecionar para cadastro
            userIcon.href = 'cadastro.html';
            userIcon.onclick = null; // Remover onclick do modal
            
            // Adicionar indicador visual
            userIcon.style.color = '#000';
            userIcon.style.fontWeight = '600';
        }
    }
}

// Atualizar ícone quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    updateUserIcon();
});

// Menu Hamburger para Mobile
function initHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const mainNav = document.querySelector('.main-nav');
    
    if (!hamburger || !mainNav) {
        return; // Elementos não encontrados, não fazer nada
    }
    
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        mainNav.classList.toggle('active');
        
        // Prevenir scroll do body quando menu estiver aberto
        if (mainNav.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });
    
    // Fechar menu ao clicar em um link
    const navLinks = mainNav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            mainNav.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    // Fechar menu ao clicar fora dele
    document.addEventListener('click', function(event) {
        const isClickInsideNav = mainNav.contains(event.target);
        const isClickOnHamburger = hamburger.contains(event.target);
        
        if (!isClickInsideNav && !isClickOnHamburger && mainNav.classList.contains('active')) {
            hamburger.classList.remove('active');
            mainNav.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

