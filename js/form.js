/* 
   Nicolas Zarate Portfolio - Contact Form Handler
   Manages form submission, loading state, reCAPTCHA validation, and EmailJS delivery.
*/

// reCAPTCHA callback: enables submit button when verified
window.enableSubmitBtn = function() {
    const btn = document.getElementById('submit-btn');
    if (btn) {
        btn.removeAttribute('disabled');
        // Clear any previous error status
        const statusDiv = document.getElementById('status');
        if (statusDiv) statusDiv.innerHTML = '';
    }
};

// reCAPTCHA callback: disables submit button when expired
window.disableSubmitBtn = function() {
    const btn = document.getElementById('submit-btn');
    if (btn) {
        btn.setAttribute('disabled', 'true');
    }
};

$(function() {
    const isSpanish = window.location.pathname.includes('translate.html');
    const contactForm = document.getElementById('form');
    const statusDiv = document.getElementById('status');
    const submitBtn = document.getElementById('submit-btn');

    if (!contactForm) return;

    // Reset button disabled state initially on page load
    if (submitBtn) {
        submitBtn.setAttribute('disabled', 'true');
    }

    contactForm.addEventListener('submit', function(event) {
        event.preventDefault();

        // 1. Double check reCAPTCHA verification and load state
        if (typeof grecaptcha === 'undefined') {
            const errorMsg = isSpanish 
                ? 'El validador reCAPTCHA de Google no se cargó correctamente. Por favor, recarga la página o inténtalo de nuevo.' 
                : 'Google reCAPTCHA failed to load. Please reload the page or try again.';
            
            showStatusAlert('danger', errorMsg);
            return;
        }

        const recaptchaResponse = grecaptcha.getResponse();
        if (recaptchaResponse.length === 0) {
            const errorMsg = isSpanish 
                ? 'Por favor, resuelve el reCAPTCHA antes de enviar el mensaje.' 
                : 'Please solve the reCAPTCHA before sending your message.';
            
            showStatusAlert('danger', errorMsg);
            return;
        }

        // 2. Extract values and disable form to prevent double submission
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const subject = document.getElementById('subject').value.trim();
        const message = document.getElementById('message').value.trim();

        setFormLoadingState(true);

        // 3. Prepare parameters for the server
        const templateParams = {
            name: name,
            email: email,
            subject: subject,
            message: message,
            'g-recaptcha-response': recaptchaResponse
        };

        // 4. Send Email via local PHP handler
        $.ajax({
            type: 'POST',
            url: 'contact.php',
            data: templateParams,
            dataType: 'json'
        })
        .done(function(response) {
            if (response.success) {
                console.log('SUCCESS!', response);
                
                // Show beautiful success alert
                const successMsg = isSpanish 
                    ? `¡Gracias ${name}! Tu mensaje ha sido enviado con éxito. Me pondré en contacto contigo pronto.`
                    : `Thanks ${name}! Your message has been sent successfully. I'll get back to you shortly.`;
                
                showStatusAlert('success', successMsg);
                
                // Reset form, recaptcha, and disable button again
                contactForm.reset();
                if (typeof grecaptcha !== 'undefined') {
                    grecaptcha.reset();
                }
                setFormLoadingState(false);
                if (submitBtn) submitBtn.setAttribute('disabled', 'true');
            } else {
                console.error('FAILED...', response.message);
                showStatusAlert('danger', response.message);
                setFormLoadingState(false);
            }
        })
        .fail(function(xhr, status, error) {
            console.error('FAILED...', error);
            
            // Show error message
            const errorMsg = isSpanish 
                ? 'Hubo un error al enviar el mensaje. Por favor, inténtalo de nuevo o escríbeme directamente a mi correo.'
                : 'Failed to send the message. Please try again or email me directly at my address.';
            
            showStatusAlert('danger', errorMsg);
            setFormLoadingState(false);
        });
    });

    // Helper: shows loading spinner on button and disables fields
    function setFormLoadingState(isLoading) {
        if (!submitBtn) return;

        if (isLoading) {
            submitBtn.setAttribute('disabled', 'true');
            const loadingText = isSpanish 
                ? '<i class="fa fa-spinner fa-spin mr-2"></i> Enviando...' 
                : '<i class="fa fa-spinner fa-spin mr-2"></i> Sending...';
            submitBtn.innerHTML = loadingText;
            
            // Disable inputs
            toggleInputs(true);
        } else {
            submitBtn.removeAttribute('disabled');
            const defaultText = isSpanish ? 'Enviar Mensaje' : 'Send Message';
            submitBtn.innerHTML = defaultText;
            
            // Enable inputs
            toggleInputs(false);
        }
    }

    // Helper: toggles disable state on input elements
    function toggleInputs(disabled) {
        const inputs = contactForm.querySelectorAll('input:not([type="submit"]):not([type="button"]), textarea');
        inputs.forEach(input => {
            if (disabled) {
                input.setAttribute('disabled', 'true');
            } else {
                input.removeAttribute('disabled');
            }
        });
    }

    // Helper: renders a clean Bootstrap alert using custom glassmorphic styling
    function showStatusAlert(type, message) {
        if (!statusDiv) return;

        const iconClass = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        const titleText = type === 'success' 
            ? (isSpanish ? '¡Éxito!' : 'Success!') 
            : (isSpanish ? '¡Error!' : 'Error!');
        const alertClass = type === 'success' ? 'alert-custom-success' : 'alert-custom-danger';

        statusDiv.innerHTML = `
            <div class="alert ${alertClass} alert-dismissible fade show shadow-sm" role="alert">
                <i class="fa ${iconClass} mr-2"></i>
                <strong>${titleText}</strong> ${message}
                <button type="button" class="close" data-dismiss="alert" aria-label="Close" style="color: inherit; opacity: 0.8; background: none; border: none; font-size: 20px; line-height: 1; float: right;">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        `;
    }
});
