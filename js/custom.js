/* 
   Nicolas Zarate Portfolio - Custom Interactive Logic
   Includes: Particle System, Typing Effect, Interactive Terminal CLI, Matrix Digital Rain
*/

document.addEventListener('DOMContentLoaded', () => {
    // 1. Check Language Page
    const isSpanish = window.location.pathname.includes('translate.html');

    // 2. Typing/Typewriter Effect
    initTypewriter(isSpanish);

    // 3. HTML5 Canvas Particles System
    initParticles();

    // 4. Interactive Terminal Console
    initTerminal(isSpanish);

    // 5. Scroll Skills Animator
    initSkillsAnimation();
});

/* ========================================================================= */
/* Typing Effect */
/* ========================================================================= */
function initTypewriter(isSpanish) {
    const textElement = document.getElementById('typing-text');
    if (!textElement) return;

    const words = isSpanish 
        ? ["Desarrollador Web", "Ingeniero UX/UI", "Creador de Sistemas", "Desarrollador Full-Stack"]
        : ["Web Developer", "UX/UI Engineer", "System Creator", "Full-Stack Developer"];
    
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    function type() {
        const currentWord = words[wordIndex];
        
        if (isDeleting) {
            textElement.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 50;
        } else {
            textElement.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 100;
        }

        if (!isDeleting && charIndex === currentWord.length) {
            isDeleting = true;
            typeSpeed = 1500; // Pause at full word
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typeSpeed = 500; // Pause before typing next word
        }

        setTimeout(type, typeSpeed);
    }

    type();
}

/* ========================================================================= */
/* Canvas Particles Background */
/* ========================================================================= */
function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;

    const particles = [];
    const maxParticles = window.innerWidth < 768 ? 40 : 80;
    const maxDistance = 110;
    
    const mouse = {
        x: null,
        y: null,
        radius: 120
    };

    window.addEventListener('resize', () => {
        width = canvas.parentElement.offsetWidth;
        height = canvas.parentElement.offsetHeight;
        canvas.width = width;
        canvas.height = height;
    });

    canvas.parentElement.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    canvas.parentElement.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.8;
            this.vy = (Math.random() - 0.5) * 0.8;
            this.radius = Math.random() * 2 + 1;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off boundaries
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;

            // Mouse interaction (push away)
            if (mouse.x !== null && mouse.y !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.hypot(dx, dy);
                if (dist < mouse.radius) {
                    const force = (mouse.radius - dist) / mouse.radius;
                    const angle = Math.atan2(dy, dx);
                    this.x += Math.cos(angle) * force * 3;
                    this.y += Math.sin(angle) * force * 3;
                }
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 210, 255, 0.4)';
            ctx.fill();
        }
    }

    // Initialize particles
    for (let i = 0; i < maxParticles; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        // Render lines between nearby particles
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();

            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.hypot(dx, dy);

                if (dist < maxDistance) {
                    const alpha = (1 - dist / maxDistance) * 0.18;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0, 210, 255, ${alpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }

    animate();
}

/* ========================================================================= */
/* Interactive Terminal Console */
/* ========================================================================= */
let runTerminalCmd = null; // Exposed globally to handle click shortcuts

function initTerminal(isSpanish) {
    const input = document.getElementById('terminal-input');
    const content = document.getElementById('terminal-content');
    if (!input || !content) return;

    // Command outputs definitions
    const commands = {
        en: {
            help: `Available commands:
  <span class="text-cyan">about</span>     - Learn who I am
  <span class="text-cyan">skills</span>    - View my programming stack
  <span class="text-cyan">projects</span>  - See my featured accomplishments
  <span class="text-cyan">contact</span>   - Get in touch with me
  <span class="text-cyan">cv</span>        - Download my Curriculum Vitae
  <span class="text-cyan">secret</span>    - Run a fun hacker visual script
  <span class="text-cyan">clear</span>     - Clear the terminal screen`,
            
            about: `Nicolas Zarate - Web Developer & Systems Designer
--------------------------------------------------
I am an enthusiastic web developer focused on building functional,
highly performant systems for my clients. I specialize in backend 
logic and modern UI/UX frontend interfaces. 
Passionate about self-learning, optimization, and shell scripting.`,
            
            skills: `Nicolas's Skills Profile:
--------------------------------------------------
<span class="text-cyan">JavaScript</span>  [████████████████░░░] 85%
<span class="text-cyan">Python</span>      [██████████████░░░░░] 75%
<span class="text-cyan">SQL</span>         [██████████████░░░░░] 70%
<span class="text-cyan">HTML/CSS</span>    [████████████████░░░] 85%
<span class="text-cyan">Bootstrap</span>   [████████████████░░░] 80%
<span class="text-cyan">Unix Shell</span>  [████████████████░░░] 85%
<span class="text-cyan">Git/GitHub</span>  [██████████████████░] 90%
<span class="text-cyan">English</span>     [████████████████░░░] 80%`,
            
            projects: `Featured Accomplishments:
--------------------------------------------------
1. <span class="text-green">Files Manager</span> (Unix Shell / JavaScript)
   Backend system to upload, resize, and manage file assets.
   URL: <a href="https://github.com/duvanjm/holbertonschool-files_manager" target="_blank" class="text-cyan">https://github.com/.../files_manager</a>

2. <span class="text-green">Pet Tracker</span> (Python / Flask / Web App)
   Full-stack app to register, search, and map pet profiles.
   URL: <a href="https://github.com/Nicolanz/pet_tracker" target="_blank" class="text-cyan">https://github.com/Nicolanz/pet_tracker</a>

3. <span class="text-green">AirBnB Clone Console</span> (Python / OOP)
   A command line console to manage hotel system records.
   URL: <a href="https://github.com/Nicolanz/AirBnB_clone" target="_blank" class="text-cyan">https://github.com/Nicolanz/AirBnB_clone</a>`,
            
            contact: `Get in Touch:
--------------------------------------------------
Email    : <a href="mailto:nicolasandreszarate@gmail.com" class="text-cyan">nicolasandreszarate@gmail.com</a>
Phone    : +57 (319) 267 1867
LinkedIn : <a href="https://www.linkedin.com/in/nicolas-zarate/" target="_blank" class="text-cyan">linkedin.com/in/nicolas-zarate</a>
GitHub   : <a href="https://github.com/Nicolanz" target="_blank" class="text-cyan">github.com/Nicolanz</a>

* Auto-scrolling you down to the contact form...`,
            
            cv: `Triggering Resume Download...
* nicolaszarate-cv.pdf successfully requested.`,
            
            invalid: `Command not found. Type <span class="text-cyan">'help'</span> for available commands.`
        },
        es: {
            help: `Comandos disponibles:
  <span class="text-cyan">about</span>     - Quién soy y mi perfil
  <span class="text-cyan">skills</span>    - Mis lenguajes y tecnologías
  <span class="text-cyan">projects</span>  - Mis proyectos destacados
  <span class="text-cyan">contact</span>   - Información de contacto
  <span class="text-cyan">cv</span>        - Descargar mi Hoja de Vida
  <span class="text-cyan">secret</span>    - Ejecutar animación estilo matrix
  <span class="text-cyan">clear</span>     - Limpiar la pantalla de la consola`,
            
            about: `Nicolas Zarate - Desarrollador Web y Diseñador de Sistemas
--------------------------------------------------
Soy un desarrollador web entusiasta enfocado en crear sistemas
funcionales y de alto rendimiento. Me especializo en lógica backend
y en el diseño de interfaces web dinámicas mediante frontend moderno.
Apasionado por la optimización, el autoaprendizaje y scripting Unix.`,
            
            skills: `Perfil Técnico de Nicolas:
--------------------------------------------------
<span class="text-cyan">JavaScript</span>  [████████████████░░░] 85%
<span class="text-cyan">Python</span>      [██████████████░░░░░] 75%
<span class="text-cyan">SQL</span>         [██████████████░░░░░] 70%
<span class="text-cyan">HTML/CSS</span>    [████████████████░░░] 85%
<span class="text-cyan">Bootstrap</span>   [████████████████░░░] 80%
<span class="text-cyan">Unix Shell</span>  [████████████████░░░] 85%
<span class="text-cyan">Git/GitHub</span>  [██████████████████░] 90%
<span class="text-cyan">Inglés</span>      [████████████████░░░] 80%`,
            
            projects: `Proyectos Destacados:
--------------------------------------------------
1. <span class="text-green">Files Manager</span> (Unix Shell / JavaScript)
   Sistema backend para subir, redimensionar y gestionar archivos.
   URL: <a href="https://github.com/duvanjm/holbertonschool-files_manager" target="_blank" class="text-cyan">https://github.com/.../files_manager</a>

2. <span class="text-green">Pet Tracker</span> (Python / Flask / Web App)
   Aplicación full-stack para registrar, buscar y mapear mascotas.
   URL: <a href="https://github.com/Nicolanz/pet_tracker" target="_blank" class="text-cyan">https://github.com/Nicolanz/pet_tracker</a>

3. <span class="text-green">Consola AirBnB</span> (Python / OOP)
   Consola de comandos para administrar registros del hotel.
   URL: <a href="https://github.com/Nicolanz/AirBnB_clone" target="_blank" class="text-cyan">https://github.com/Nicolanz/AirBnB_clone</a>`,
            
            contact: `Datos de Contacto:
--------------------------------------------------
Correo   : <a href="mailto:nicolasandreszarate@gmail.com" class="text-cyan">nicolasandreszarate@gmail.com</a>
Teléfono : +57 (319) 267 1867
LinkedIn : <a href="https://www.linkedin.com/in/nicolas-zarate/" target="_blank" class="text-cyan">linkedin.com/in/nicolas-zarate</a>
GitHub   : <a href="https://github.com/Nicolanz" target="_blank" class="text-cyan">github.com/Nicolanz</a>

* Desplazándote automáticamente al formulario de contacto...`,
            
            cv: `Iniciando descarga de Hoja de Vida...
* hojadevida-med.pdf solicitada correctamente.`,
            
            invalid: `Comando no reconocido. Escribe <span class="text-cyan">'help'</span> para ver los comandos.`
        }
    };

    const activeLang = isSpanish ? 'es' : 'en';
    const langCmds = commands[activeLang];

    // Handle inputs
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const rawValue = input.value.trim();
            const cmd = rawValue.toLowerCase();
            input.value = '';
            
            if (cmd) {
                executeCommand(cmd, rawValue);
            }
        }
    });

    // Expose command runner globally for shortcuts click
    runTerminalCmd = function(cmd) {
        executeCommand(cmd, cmd);
    };

    function executeCommand(cmd, rawInput) {
        // Echo input line
        const echoLine = document.createElement('div');
        echoLine.className = 'terminal-line';
        echoLine.innerHTML = `<span class="prompt">nicolas@zarate:~$</span> <span class="cmd-run">${rawInput}</span>`;
        content.appendChild(echoLine);

        const responseLine = document.createElement('div');
        responseLine.className = 'output';

        switch (cmd) {
            case 'clear':
                content.innerHTML = `<div class="text-cyan mb-1">${isSpanish ? 'Nicolas OS v2.0.0 (Escribe \'help\' para ver los comandos)' : 'Nicolas OS v2.0.0 (Type \'help\' for available commands)'}</div>`;
                break;
            case 'help':
                responseLine.innerHTML = langCmds.help;
                content.appendChild(responseLine);
                break;
            case 'about':
                responseLine.innerHTML = langCmds.about;
                content.appendChild(responseLine);
                break;
            case 'skills':
                responseLine.innerHTML = langCmds.skills;
                content.appendChild(responseLine);
                break;
            case 'projects':
                responseLine.innerHTML = langCmds.projects;
                content.appendChild(responseLine);
                break;
            case 'contact':
                responseLine.innerHTML = langCmds.contact;
                content.appendChild(responseLine);
                setTimeout(() => {
                    const contactSection = document.getElementById('contact-section');
                    if (contactSection) {
                        contactSection.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 1500);
                break;
            case 'cv':
                responseLine.innerHTML = langCmds.cv;
                content.appendChild(responseLine);
                const cvLink = document.createElement('a');
                cvLink.href = isSpanish ? './hojadevida-med.pdf' : './nicolaszarate-cv-med.pdf';
                cvLink.download = isSpanish ? 'nicolaszarate-hojadevida.pdf' : 'nicolaszarate-cv.pdf';
                document.body.appendChild(cvLink);
                cvLink.click();
                document.body.removeChild(cvLink);
                break;
            case 'secret':
            case 'matrix':
                startMatrixRain();
                break;
            default:
                responseLine.innerHTML = langCmds.invalid;
                content.appendChild(responseLine);
                break;
        }

        // Scroll to bottom
        content.scrollTop = content.scrollHeight;
    }

    // Matrix Rain Effect Logic
    function startMatrixRain() {
        // Create canvas wrapper
        const canvas = document.createElement('canvas');
        canvas.id = 'matrix-canvas';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'matrix-overlay-close';
        closeBtn.innerText = isSpanish ? 'Cerrar [X]' : 'Close [X]';

        const terminalContainer = content.parentElement;
        terminalContainer.appendChild(canvas);
        terminalContainer.appendChild(closeBtn);

        const ctx = canvas.getContext('2d');
        
        let width = canvas.width = terminalContainer.offsetWidth;
        let height = canvas.height = 330; // matches body height
        
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&*+-/\\{}[]';
        const fontSize = 12;
        const columns = Math.floor(width / fontSize);

        const rainDrops = Array(columns).fill(1);

        const drawMatrix = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = '#0f0'; // green hacker text
            ctx.font = fontSize + 'px monospace';

            for (let i = 0; i < rainDrops.length; i++) {
                const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
                ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);

                if (rainDrops[i] * fontSize > height && Math.random() > 0.975) {
                    rainDrops[i] = 0;
                }
                rainDrops[i]++;
            }
        };

        const intervalId = setInterval(drawMatrix, 30);

        // Resize handler inside matrix
        const handleMatrixResize = () => {
            width = canvas.width = terminalContainer.offsetWidth;
            height = canvas.height = 330;
        };
        window.addEventListener('resize', handleMatrixResize);

        // Close Matrix handler
        const closeMatrix = () => {
            clearInterval(intervalId);
            window.removeEventListener('resize', handleMatrixResize);
            canvas.remove();
            closeBtn.remove();
            
            const exitLine = document.createElement('div');
            exitLine.className = 'output text-green';
            exitLine.innerHTML = isSpanish 
                ? 'Conexión segura de Matrix finalizada.' 
                : 'Matrix secure connection closed.';
            content.appendChild(exitLine);
            content.scrollTop = content.scrollHeight;
        };

        closeBtn.addEventListener('click', closeMatrix);
        
        // Let escape key close it as well
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closeMatrix();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }
}

/* ========================================================================= */
/* Scroll Skills Animator */
/* ========================================================================= */
function initSkillsAnimation() {
    const skillsSection = document.getElementById('skills-section');
    if (!skillsSection) return;

    const progressElements = document.querySelectorAll('#skills-section .progress');
    if (progressElements.length === 0) return;

    // Set initial text content to 0% and record value
    progressElements.forEach(el => {
        const textValEl = el.querySelector('.h2.font-weight-bold');
        if (textValEl) {
            textValEl.innerHTML = `0<span class="small">%</span>`;
        }
    });

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateProgressCircles();
                observer.unobserve(entry.target); // Trigger once
            }
        });
    }, {
        threshold: 0.15
    });

    observer.observe(skillsSection);

    function animateProgressCircles() {
        progressElements.forEach(el => {
            const value = parseInt(el.getAttribute('data-value'), 10) || 0;
            const leftBar = el.querySelector('.progress-left .progress-bar');
            const rightBar = el.querySelector('.progress-right .progress-bar');
            const textValEl = el.querySelector('.h2.font-weight-bold');

            // 1. Rotate circle segments
            if (value > 0) {
                setTimeout(() => {
                    if (value <= 50) {
                        const deg = (value / 100) * 360;
                        if (rightBar) rightBar.style.transform = `rotate(${deg}deg)`;
                    } else {
                        const degLeft = ((value - 50) / 100) * 360;
                        if (rightBar) rightBar.style.transform = `rotate(180deg)`;
                        if (leftBar) leftBar.style.transform = `rotate(${degLeft}deg)`;
                    }
                }, 100);
            }

            // 2. Count up percentage text
            if (textValEl) {
                let currentNum = 0;
                const duration = 1500; // 1.5s animation duration
                const stepTime = Math.max(Math.floor(duration / value), 12);
                
                const counterInterval = setInterval(() => {
                    currentNum++;
                    textValEl.innerHTML = `${currentNum}<span class="small">%</span>`;
                    
                    if (currentNum >= value) {
                        clearInterval(counterInterval);
                    }
                }, stepTime);
            }
        });
    }
}
