console.log('Cloud Closet App Initialized');

// (Assumendo che ci sia altro codice sopra, altrimenti questo blocco funzionerà comunque in modo autonomo)

document.addEventListener('DOMContentLoaded', () => {

  /* =========================================
     1. LOGICA PER I PULSANTI PRICING (CON EMAILJS)
     Flusso: Check City -> Not Available/Email -> Send Data -> Success
     ========================================= */
  const pricingModal = document.getElementById('pricing-modal');
  const closePricingBtn = document.getElementById('close-pricing-modal');
  const pricingButtons = document.querySelectorAll('.pricing-card button');

  const stepCity = document.getElementById('pm-step-city');
  const stepEmail = document.getElementById('pm-step-email');
  const stepSuccess = document.getElementById('pm-step-success');

  const cityForm = document.getElementById('pm-city-form');
  const emailForm = document.getElementById('pm-email-form');

  const cityInput = document.getElementById('pm-city-input');
  // Selezioniamo l'input email specificamente (aggiungi questo ID nel tuo HTML se manca, o usa querySelector)
  const emailInput = emailForm ? emailForm.querySelector('input[type="email"]') : null;

  const displayCityName = document.getElementById('pm-display-city-name');

  // Variabile per salvare temporaneamente la città scelta
  let selectedCity = "";

  if (pricingModal) {
    // APERTURA MODALE
    pricingButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        document.body.style.overflow = 'hidden';

        pricingModal.style.display = 'flex';
        pricingModal.style.opacity = '1';
        pricingModal.style.visibility = 'visible';
        pricingModal.classList.add('active');

        // Reset visualizzazione steps
        if(stepCity) stepCity.style.display = 'block';
        if(stepEmail) stepEmail.style.display = 'none';
        if(stepSuccess) stepSuccess.style.display = 'none';

        if(cityForm) cityForm.reset();
        if(emailForm) emailForm.reset();
        selectedCity = ""; // Reset variabile
      });
    });

    // CHIUSURA MODALE
    const closeFunc = () => {
      document.body.style.overflow = '';
      pricingModal.classList.remove('active');
      pricingModal.style.display = 'none';
      pricingModal.style.opacity = '';
      pricingModal.style.visibility = '';
    };

    if (closePricingBtn) closePricingBtn.addEventListener('click', closeFunc);

    pricingModal.addEventListener('click', (e) => {
        if (e.target === pricingModal) closeFunc();
    });

    // LOGICA STEP 1 -> STEP 2 (Salva Città)
    if (cityForm) {
      cityForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Salva il valore nella variabile globale
        selectedCity = cityInput.value;

        if(displayCityName) displayCityName.textContent = selectedCity;

        stepCity.style.display = 'none';
        stepEmail.style.display = 'block';
      });
    }

    // LOGICA STEP 2 -> INVIO EMAIL -> STEP 3
    if (emailForm) {
      emailForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const userEmail = emailInput.value;
        const submitBtn = emailForm.querySelector('button');
        const originalBtnText = submitBtn.innerText;

        // Cambia testo bottone per feedback utente
        submitBtn.innerText = "Sending...";
        submitBtn.disabled = true;

        // Preparazione parametri per EmailJS
        // Assicurati che nel template EmailJS usi {{city}} e {{user_email}}
        const templateParams = {
            city: selectedCity,
            user_email: userEmail,
            message: "New waitlist request for Cloud Closet"
        };

        // INVIO CON EMAILJS
        // Sostituisci 'YOUR_SERVICE_ID' e 'YOUR_TEMPLATE_ID' con i tuoi veri ID
        emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
          .then(() => {
            console.log('SUCCESS!');
            // Mostra successo
            stepEmail.style.display = 'none';
            stepSuccess.style.display = 'block';
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
          }, (error) => {
            console.log('FAILED...', error);
            alert("Sorry, something went wrong. Please try again.");
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
          });
      });
    }
  }

  /* =========================================
       2. LOGICA PER WAITLIST / CITY (ESISTENTE)
       Apre il modale "City Selection" dopo aver messo l'email in fondo
       ========================================= */
  const cityModal = document.getElementById('city-modal');
  const closeCityBtn = cityModal ? cityModal.querySelector('.close-modal') : null;
  const waitingListForm = document.getElementById('waiting-list-form'); // Il form nella sezione #join-us
  const confirmCityBtn = document.getElementById('confirm-city-btn');
  const modalStep1 = document.getElementById('modal-step-1');
  const modalSuccess = document.getElementById('modal-success');

  if (cityModal && waitingListForm) {

    // Funzione chiusura generica per questo modale
    const closeCityModalFunc = () => {
      document.body.style.overflow = ''; // Riabilita scroll
      cityModal.classList.remove('active');
      cityModal.style.display = 'none';
    };

    // Submit "Notify Me" footer
    waitingListForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Blocca scroll
      document.body.style.overflow = 'hidden';

      cityModal.classList.add('active');
      cityModal.style.display = 'flex';

      if(modalStep1) modalStep1.style.display = 'block';
      if(modalSuccess) modalSuccess.style.display = 'none';
    });

    if (closeCityBtn) {
      closeCityBtn.addEventListener('click', closeCityModalFunc);
    }

    if (confirmCityBtn) {
      confirmCityBtn.addEventListener('click', () => {
        if(modalStep1) modalStep1.style.display = 'none';
        if(modalSuccess) modalSuccess.style.display = 'block';
      });
    }

    cityModal.addEventListener('click', (e) => {
        if (e.target === cityModal) {
          closeCityModalFunc();
        }
    });
  }

  /* =========================================
     3. LOGICA FAQ ACCORDION (DINAMICA)
     ========================================= */
  const faqQuestions = document.querySelectorAll('.faq-question');

  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const item = question.parentElement;
      const answer = item.querySelector('.faq-answer');

      // 1. Chiudi tutti gli altri aperti (Opzionale, ma consigliato per pulizia)
      document.querySelectorAll('.faq-item').forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('active')) {
          otherItem.classList.remove('active');
          otherItem.querySelector('.faq-answer').style.maxHeight = null; // Resetta altezza
        }
      });

      // 2. Toggle dello stato corrente
      item.classList.toggle('active');

      // 3. Gestione altezza dinamica
      if (item.classList.contains('active')) {
        // Imposta l'altezza al valore reale del contenuto (scrollHeight)
        answer.style.maxHeight = answer.scrollHeight + "px";
      } else {
        // Resetta a null (che corrisponde a 0 via CSS) per chiudere
        answer.style.maxHeight = null;
      }
    });
  });

}); // Fine DOMContentLoaded
