const product = [
    {
        id: 0,
        Images: [
            'Imagenes/MateRiver/MateRiver1.jpg',
            'Imagenes/MateRiver/MateRiver2.jpg',
            'Imagenes/MateRiver/MateRiver3.jpg',
            'Imagenes/MateRiver/MateRiver4.jpg',
            'Imagenes/MateRiver/MateRiver5.jpg'
        ],
        title: 'Mate de River(Rojo)',
        price: '15000'
    },
    {
        id: 1,
        Images: [
            'Imagenes/MateRiverOtro/MateRiverOtro4.jpg',
            'Imagenes/MateRiverOtro/MateRiverOtro3.jpg',
            'Imagenes/MateRiverOtro/MateRiverOtro2.jpg',
            'Imagenes/MateRiverOtro/MateRiverOtro1.jpg',
            'Imagenes/MateRiverOtro/MateRiverOtro6.jpg',
            'Imagenes/MateRiverOtro/MateRiverOtro5.jpg',
        ],
        title: 'Mate de River(Negro)',
        price: '----'
    },
    {
        id: 2,
        Images: [
            'Imagenes/MateRueda/MateRueda1.jpg',
            'Imagenes/MateRueda/MateRueda2.jpg'
        ],
        title: 'Mate de Ruedas',
        price: '----'
    },
    {
        id: 2,
        Images: [
            'Imagenes/MateSanLorenzo/MateSanLorenzo3.jpg',
            'Imagenes/MateSanLorenzo/MateSanLorenzo5.jpg',
            'Imagenes/MateSanLorenzo/MateSanLorenzo1.jpg',
            'Imagenes/MateSanLorenzo/MateSanLorenzo2.jpg',
            'Imagenes/MateSanLorenzo/MateSanLorenzo4.jpg'
        ],
        title: 'Mate de San Lorenzo',
        price: '----'
    },
    {
        id: 3,
        Images: [
            'Imagenes/StitchAzul/Stitch1_3.jpg',
            'Imagenes/StitchAzul/Stitch1_2.jpg',
            'Imagenes/StitchAzul/Stitch1_1.jpg',
        ],
        title: 'Mate de Stitch',
        price: '----'
    },
    {
        id: 4,
        Images: [
            'Imagenes/StitchRosa/StitchRosa2.jpg',
            'Imagenes/StitchRosa/StitchRosa1.jpg',
            'Imagenes/StitchRosa/StitchRosa3.jpg',
        ],
        title: 'Mate de Stitch(Rosa)',
        price: '----'
    },
    // Resto de los productos...
];

const categories = [...new Set(product.map((item) => item))];

document.getElementById('searchBar').addEventListener('keyup', (e) => {
    const searchData = e.target.value.toLowerCase();
    const filterData = categories.filter((item) => {
        return item.title.toLowerCase().includes(searchData);
    });
    displayItem(filterData);
});

const displayItem = (items) => {
    document.getElementById('root').innerHTML = items
        .map((item) => {
            const { Images, title, price } = item;
            return `
            <div class='box'>
                <div class='img-box'>
                    <img class='images' src='${Images[0]}' onclick="showModal(${item.id})">
                </div>
                <div class='bottom'>
                    <p>${title}</p>
                    <h2>$ ${price} </h2>
                    <button> Añadir a Carro</button>
                </div>
            </div>`;
        })
        .join('');
};

let currentImages = []; // Array de imágenes actuales del producto
let currentIndex = 0; // Índice de la imagen actualmente mostrada

const showModal = (id) => {
    const item = product.find((p) => p.id === id);
    currentImages = item.Images;
    currentIndex = 0;

    const modal = document.getElementById('imageModal');
    const modalImages = document.getElementById('modalImages');

    updateModalImage(); // Mostrar la primera imagen
    modal.style.display = 'block';

    // Agregar evento para cerrar con la tecla Esc
    document.addEventListener('keydown', handleKeyDown);
};

const closeModal = () => {
    const modal = document.getElementById('imageModal');
    modal.style.display = 'none';

    // Eliminar el evento de teclado al cerrar el modal
    document.removeEventListener('keydown', handleKeyDown);
};

const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
        closeModal();
    } else if (event.key === 'ArrowRight') {
        nextImage();
    } else if (event.key === 'ArrowLeft') {
        prevImage();
    }
};

const updateModalImage = () => {
    const modalImages = document.getElementById('modalImages');
    modalImages.innerHTML = `<img src="${currentImages[currentIndex]}" alt="Image ${currentIndex + 1}">`;
};

const nextImage = () => {
    currentIndex = (currentIndex + 1) % currentImages.length; // Ciclar al inicio si supera el índice
    updateModalImage();
};

const prevImage = () => {
    currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length; // Ciclar al final si es menor a 0
    updateModalImage();
};

displayItem(categories);







