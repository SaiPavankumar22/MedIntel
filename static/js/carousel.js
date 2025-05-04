<<<<<<< HEAD
const specialistsData = [
    {
        name: 'Dr. Sarah Smith',
        specialty: 'Cardiology',
        experience: '15 years experience',
        image: "{{ url_for('static', filename='images/d2.jpg') }}"
    },
    {
        name: 'Dr. John Davis',
        specialty: 'Neurology',
        experience: '12 years experience',
        image: "{{ url_for('static', filename='images/d3.jpg') }}"
    },
    {
        name: 'Dr. Emily Chen',
        specialty: 'Pediatrics',
        experience: '10 years experience',
        image: "{{ url_for('static', filename='images/d2.jpg') }}"
    },
    {
        name: 'Dr. Michael Brown',
        specialty: 'Orthopedics',
        experience: '18 years experience',
        image: "{{ url_for('static', filename='images/d2.jpg') }}"
    },
    {
        name: 'Dr. Lisa Wilson',
        specialty: 'Dermatology',
        experience: '14 years experience',
        image: "{{ url_for('static', filename='images/th2.jpg') }}"
    },
    {
        name: 'Dr. Robert Taylor',
        specialty: 'Oncology',
        experience: '20 years experience',
        image: "{{ url_for('static', filename='images/d4.jpg') }}"
    },
    {
        name: 'Dr. Amanda Martinez',
        specialty: 'Psychiatry',
        experience: '11 years experience',
        image: "{{ url_for('static', filename='images/d5.jpg') }}"
    }
];

const specialistsContainer = document.querySelector('.specialists-container');
const prevBtn = document.querySelector('.carousel-btn.prev');
const nextBtn = document.querySelector('.carousel-btn.next');

// Populate specialists
specialistsData.forEach(specialist => {
    const card = document.createElement('div');
    card.className = 'specialist-card';
    card.innerHTML = `
        <img src="${specialist.image}" alt="${specialist.name}">
        <h3>${specialist.name}</h3>
        <p class="specialty">${specialist.specialty}</p>
        <p class="experience">${specialist.experience}</p>
    `;
    specialistsContainer.appendChild(card);
});

// Carousel navigation
let scrollPosition = 0;
const cardWidth = 310; // card width + gap

function updateCarouselButtons() {
    prevBtn.style.display = scrollPosition <= 0 ? 'none' : 'block';
    nextBtn.style.display = 
        scrollPosition >= (specialistsContainer.scrollWidth - specialistsContainer.clientWidth)
        ? 'none' 
        : 'block';
}

prevBtn.addEventListener('click', () => {
    scrollPosition = Math.max(scrollPosition - cardWidth, 0);
    specialistsContainer.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
    });
    updateCarouselButtons();
});

nextBtn.addEventListener('click', () => {
    scrollPosition = Math.min(
        scrollPosition + cardWidth,
        specialistsContainer.scrollWidth - specialistsContainer.clientWidth
    );
    specialistsContainer.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
    });
    updateCarouselButtons();
});

// Initial button state
updateCarouselButtons();

// Update buttons on window resize
window.addEventListener('resize', updateCarouselButtons);
=======
const specialistsData = [
    {
        name: 'Dr. Sarah Smith',
        specialty: 'Cardiology',
        experience: '15 years experience',
        image: "{{ url_for('static', filename='images/d2.jpg') }}"
    },
    {
        name: 'Dr. John Davis',
        specialty: 'Neurology',
        experience: '12 years experience',
        image: "{{ url_for('static', filename='images/d3.jpg') }}"
    },
    {
        name: 'Dr. Emily Chen',
        specialty: 'Pediatrics',
        experience: '10 years experience',
        image: "{{ url_for('static', filename='images/d2.jpg') }}"
    },
    {
        name: 'Dr. Michael Brown',
        specialty: 'Orthopedics',
        experience: '18 years experience',
        image: "{{ url_for('static', filename='images/d2.jpg') }}"
    },
    {
        name: 'Dr. Lisa Wilson',
        specialty: 'Dermatology',
        experience: '14 years experience',
        image: "{{ url_for('static', filename='images/th2.jpg') }}"
    },
    {
        name: 'Dr. Robert Taylor',
        specialty: 'Oncology',
        experience: '20 years experience',
        image: "{{ url_for('static', filename='images/d4.jpg') }}"
    },
    {
        name: 'Dr. Amanda Martinez',
        specialty: 'Psychiatry',
        experience: '11 years experience',
        image: "{{ url_for('static', filename='images/d5.jpg') }}"
    }
];

const specialistsContainer = document.querySelector('.specialists-container');
const prevBtn = document.querySelector('.carousel-btn.prev');
const nextBtn = document.querySelector('.carousel-btn.next');

// Populate specialists
specialistsData.forEach(specialist => {
    const card = document.createElement('div');
    card.className = 'specialist-card';
    card.innerHTML = `
        <img src="${specialist.image}" alt="${specialist.name}">
        <h3>${specialist.name}</h3>
        <p class="specialty">${specialist.specialty}</p>
        <p class="experience">${specialist.experience}</p>
    `;
    specialistsContainer.appendChild(card);
});

// Carousel navigation
let scrollPosition = 0;
const cardWidth = 310; // card width + gap

function updateCarouselButtons() {
    prevBtn.style.display = scrollPosition <= 0 ? 'none' : 'block';
    nextBtn.style.display = 
        scrollPosition >= (specialistsContainer.scrollWidth - specialistsContainer.clientWidth)
        ? 'none' 
        : 'block';
}

prevBtn.addEventListener('click', () => {
    scrollPosition = Math.max(scrollPosition - cardWidth, 0);
    specialistsContainer.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
    });
    updateCarouselButtons();
});

nextBtn.addEventListener('click', () => {
    scrollPosition = Math.min(
        scrollPosition + cardWidth,
        specialistsContainer.scrollWidth - specialistsContainer.clientWidth
    );
    specialistsContainer.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
    });
    updateCarouselButtons();
});

// Initial button state
updateCarouselButtons();

// Update buttons on window resize
window.addEventListener('resize', updateCarouselButtons);
>>>>>>> 731d027ef8dbf9ec6dc2f270202fbe43ada2fd9e
