document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. POPULATE TIME SLOTS (8 AM to 9 PM, 1-hour intervals) ---
    const timeSelect = document.getElementById('time');
    for (let i = 8; i <= 20; i++) {
        let hour = i > 12 ? i - 12 : i;
        let ampm = i >= 12 ? 'PM' : 'AM';
        if (hour === 0) hour = 12; // Handle midnight if needed, though we stop at 9PM
        
        let timeString = `${hour}:00 ${ampm}`;
        let option = document.createElement('option');
        option.value = timeString;
        option.textContent = timeString;
        timeSelect.appendChild(option);
    }

    // --- 2. SET MINIMUM DATE TO TODAY ---
    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;

    // --- 3. CAROUSEL LOGIC ---
    const track = document.querySelector('.carousel-track');
    const slides = Array.from(track.children);
    const nextButton = document.getElementById('nextBtn');
    const prevButton = document.getElementById('prevBtn');
    
    let currentIndex = 0;

    const updateCarousel = () => {
        const width = slides[0].getBoundingClientRect().width;
        track.style.transform = `translateX(-${currentIndex * width}px)`;
    };

    nextButton.addEventListener('click', () => {
        if (currentIndex < slides.length - 1) {
            currentIndex++;
        } else {
            currentIndex = 0; // Loop back to start
        }
        updateCarousel();
    });

    prevButton.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
        } else {
            currentIndex = slides.length - 1; // Loop to end
        }
        updateCarousel();
    });

    // Handle window resize for carousel
    window.addEventListener('resize', updateCarousel);

    // --- 4. BOOKING FORM SUBMISSION (Google Script + WhatsApp) ---
    
    // REPLACE THIS URL WITH YOUR GOOGLE APPS SCRIPT WEB APP URL
    const scriptURL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE'; 
    
    const bookingForm = document.getElementById('bookingForm');
    
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('name').value;
        const service = document.getElementById('service').value;
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        
        const submitBtn = document.querySelector('.submit-btn');
        const originalBtnText = submitBtn.innerText;
        submitBtn.innerText = "Processing...";
        submitBtn.disabled = true;

        // Prepare data for Google Sheet
        const formData = new FormData();
        formData.append('name', name);
        formData.append('service', service);
        formData.append('date', date);
        formData.append('time', time);

        // Send to Google Sheets
        fetch(scriptURL, { method: 'POST', body: formData })
            .then(response => {
                // Construct WhatsApp Message
                const phone = "233596656436";
                const message = `Hello Bobby! I would like to book an appointment.%0A%0A*Name:* ${name}%0A*Service:* ${service}%0A*Date:* ${date}%0A*Time:* ${time}%0A%0AThank you!`;
                
                // Open WhatsApp
                window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
                
                // Reset form
                bookingForm.reset();
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            })
            .catch(error => {
                console.error('Error!', error.message);
                alert("There was an issue saving to the database, but we will redirect you to WhatsApp to complete your booking.");
                
                // Still open WhatsApp even if sheet fails
                const phone = "233596656436";
                const message = `Hello Bobby! I would like to book an appointment.%0A%0A*Name:* ${name}%0A*Service:* ${service}%0A*Date:* ${date}%0A*Time:* ${time}%0A%0AThank you!`;
                window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
                
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            });
    });
});