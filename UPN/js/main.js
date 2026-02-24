(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    
    // Initiate the wowjs
    new WOW().init();


    // Sticky Navbar
    $(window).scroll(function () {
        if ($(this).scrollTop() > 90) {
            $('.nav-bar').addClass('fixed-top').css('padding', '0');
        } else {
            $('.nav-bar').removeClass('fixed-top').css('padding', '0px 90px');
        }
    });
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Modal Video
    $(document).ready(function () {
        var $videoSrc;
        $('.btn-play').click(function () {
            $videoSrc = $(this).data("src");
        });
        console.log($videoSrc);

        $('#videoModal').on('shown.bs.modal', function (e) {
            $("#video").attr('src', $videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0");
        })

        $('#videoModal').on('hide.bs.modal', function (e) {
            $("#video").attr('src', $videoSrc);
        })
    });


    // Facts counter
    $('[data-toggle="counter-up"]').counterUp({
        delay: 10,
        time: 2000
    });


    // Donation progress
    $('.donation-item .donation-progress').waypoint(function () {
        $('.donation-item .progress .progress-bar').each(function () {
            $(this).css("height", $(this).attr("aria-valuenow") + '%');
        });
    }, {offset: '80%'});


    // Header carousel
    $(".header-carousel").owlCarousel({
        animateOut: 'rotateOutUpRight',
        animateIn: 'rotateInDownLeft',
        items: 1,
        autoplay: true,
        smartSpeed: 1000,
        dots: false,
        loop: true,
        nav : true,
        navText : [
            '<i class="bi bi-chevron-left"></i>',
            '<i class="bi bi-chevron-right"></i>'
        ]
    });


    // Testimonials carousel
    $(".testimonial-carousel").owlCarousel({
        items: 1,
        autoplay: true,
        smartSpeed: 1000,
        animateIn: 'fadeIn',
        animateOut: 'fadeOut',
        dots: false,
        loop: true,
        nav: true,
        navText : [
            '<i class="bi bi-chevron-left"></i>',
            '<i class="bi bi-chevron-right"></i>'
        ]
    });

    
})(jQuery);

const BASE_PATH = "/UPN/";

fetch(BASE_PATH + "navbar.html")
  .then(response => response.text())
  .then(data => {
    document.getElementById("navbar").innerHTML = data;
  });

fetch(BASE_PATH + "footer.html")
  .then(response => response.text())
  .then(data => {
    document.getElementById("footer").innerHTML = data;
  });
// =========================================
// CONFIGURACIÓN DE GOOGLE DRIVE
// =========================================
const API_KEY = 'AIzaSyC3_PI9T4LqW5H-3qgDOr61Q3_JkDFZaLs'; 
const FOLDER_ID = '1Gzku80mhQi6UmtPBAFEHaAq6zcshgcfz';

let todosLosPDFs = []; 

async function cargarContenidoDrive() {
    const url = `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents+and+mimeType='application/pdf'+and+trashed=false&fields=files(id,name,webViewLink,description,createdTime)&key=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        document.getElementById('pdf-loader').style.display = 'none';

        if (data.files && data.files.length > 0) {
            todosLosPDFs = data.files; 
            renderizarCarruselPDF(todosLosPDFs); // Ahora sí existe esta función abajo
            renderizarListaPDF(todosLosPDFs); 
        } else {
            document.getElementById('pdf-carousel-slide').innerHTML = "<p>No se encontraron PDFs.</p>";
            document.getElementById('pdf-list-container').innerHTML = "<p class='text-center w-100'>No hay archivos disponibles.</p>";
        }
    } catch (error) {
        console.error("Error:", error);
        document.getElementById('pdf-loader').style.display = 'none';
        document.getElementById('pdf-list-container').innerHTML = "<p class='text-center w-100 text-danger'>Error al conectar con Google Drive. Revisa la consola.</p>";
    }
}

// =========================================
// LÓGICA DEL CARRUSEL (Estaba faltando)
// =========================================
let slideActual = 0;

function renderizarCarruselPDF(archivos) {
    const slideContainer = document.getElementById('pdf-carousel-slide');
    const dotsContainer = document.getElementById('pdf-carousel-dots');
    
    if(!slideContainer) return; // Por si no existe en el HTML
    
    slideContainer.innerHTML = '';
    dotsContainer.innerHTML = '';

    // Tomamos solo los 5 más recientes para no saturar el carrusel
    const archivosCarrusel = archivos.slice(0, 5);

    archivosCarrusel.forEach((file, index) => {
        const slide = document.createElement('div');
        slide.className = 'pdf-slide-item';
        const nombreLimpio = file.name.replace(/\.[^/.]+$/, "");
        
        slide.innerHTML = `
            <img src="https://drive.google.com/thumbnail?id=${file.id}&sz=w800" alt="Carátula" onclick="window.open('${file.webViewLink}', '_blank')">
            <div class="pdf-label" title="${nombreLimpio}">${nombreLimpio}</div>
        `;
        slideContainer.appendChild(slide);

        // Crear los puntitos (dots)
        const dot = document.createElement('div');
        dot.className = `pdf-dot ${index === 0 ? 'active' : ''}`;
        dot.onclick = () => moverCarrusel(index);
        dotsContainer.appendChild(dot);
    });

    // Botones Siguiente y Anterior
    document.getElementById('pdf-prevBtn').onclick = () => {
        slideActual = (slideActual > 0) ? slideActual - 1 : archivosCarrusel.length - 1;
        moverCarrusel(slideActual);
    };
    
    document.getElementById('pdf-nextBtn').onclick = () => {
        slideActual = (slideActual < archivosCarrusel.length - 1) ? slideActual + 1 : 0;
        moverCarrusel(slideActual);
    };
}

function moverCarrusel(index) {
    slideActual = index;
    const slideContainer = document.getElementById('pdf-carousel-slide');
    slideContainer.style.transform = `translateX(-${index * 100}%)`;
    
    document.querySelectorAll('.pdf-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
}

// =========================================
// LÓGICA DE LA LISTA, BUSCADOR Y PAGINACIÓN
// =========================================
let paginaActual = 1;
const itemsPorPagina = 12; 
let pdfsFiltrados = []; 

function renderizarListaPDF(archivos) {
    const listContainer = document.getElementById('pdf-list-container');
    listContainer.innerHTML = ''; 

    if (archivos.length === 0) {
        listContainer.innerHTML = `<div class="col-12 text-center text-muted py-5">
            <i class="fa fa-folder-open fa-3x mb-3 text-light"></i>
            <h5>No se encontraron resultados.</h5>
        </div>`;
        document.getElementById('pdf-pagination').innerHTML = ''; 
        return;
    }

    const startIndex = (paginaActual - 1) * itemsPorPagina;
    const endIndex = startIndex + itemsPorPagina;
    const archivosA_Mostrar = archivos.slice(startIndex, endIndex);

    archivosA_Mostrar.forEach(file => {
        const col = document.createElement('div');
        col.className = 'col-sm-6 col-md-4 col-lg-3 wow fadeIn';
        
        const nombreLimpio = file.name.replace(/\.[^/.]+$/, "");
        const fecha = new Date(file.createdTime).toLocaleDateString('es-ES');
        const descripcion = file.description ? file.description : `Añadido el: ${fecha}`;

        col.innerHTML = `
            <div class="pdf-list-card" onclick="window.open('${file.webViewLink}', '_blank')">
                <div class="pdf-list-img-container">
                    <img src="https://drive.google.com/thumbnail?id=${file.id}&sz=w400" alt="Carátula">
                </div>
                <div class="p-3">
                    <h5 class="pdf-list-title" title="${nombreLimpio}">${nombreLimpio}</h5>
                    <p class="pdf-list-desc mb-0">${descripcion}</p>
                </div>
            </div>
        `;
        listContainer.appendChild(col);
    });

    renderizarControlesPaginacion(archivos);
}

function renderizarControlesPaginacion(archivos) {
    const pagContenedor = document.getElementById('pdf-pagination');
    pagContenedor.innerHTML = '';

    const totalPaginas = Math.ceil(archivos.length / itemsPorPagina);

    if (totalPaginas <= 1) return;

    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${paginaActual === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `<a class="page-link">Anterior</a>`;
    prevLi.onclick = () => {
        if (paginaActual > 1) {
            paginaActual--;
            renderizarListaPDF(archivos);
            document.getElementById('pdf-search').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };
    pagContenedor.appendChild(prevLi);

    for (let i = 1; i <= totalPaginas; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${paginaActual === i ? 'active' : ''}`;
        li.innerHTML = `<a class="page-link">${i}</a>`;
        li.onclick = () => {
            paginaActual = i;
            renderizarListaPDF(archivos);
            document.getElementById('pdf-search').scrollIntoView({ behavior: 'smooth', block: 'center' });
        };
        pagContenedor.appendChild(li);
    }

    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${paginaActual === totalPaginas ? 'disabled' : ''}`;
    nextLi.innerHTML = `<a class="page-link">Siguiente</a>`;
    nextLi.onclick = () => {
        if (paginaActual < totalPaginas) {
            paginaActual++;
            renderizarListaPDF(archivos);
            document.getElementById('pdf-search').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };
    pagContenedor.appendChild(nextLi);
}

document.getElementById('pdf-search')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    paginaActual = 1; 
    
    pdfsFiltrados = todosLosPDFs.filter(file => {
        const nombre = file.name.toLowerCase();
        const descripcion = file.description ? file.description.toLowerCase() : "";
        const fecha = file.createdTime ? file.createdTime.toLowerCase() : "";
        
        return nombre.includes(term) || descripcion.includes(term) || fecha.includes(term);
    });

    renderizarListaPDF(pdfsFiltrados);
});

// =========================================
// ¡AQUÍ ESTÁ LA LLAVE! INICIAR LA FUNCIÓN
// =========================================
cargarContenidoDrive();