<?php
/**
 * Nicolas Zarate Portfolio - Secure Contact Form Handler
 * Verifies reCAPTCHA server-side and sends contact emails.
 */

// Set header to return JSON responses
header('Content-Type: application/json; charset=utf-8');

// 1. CONFIGURATION
// Define the recipient email address
define('RECIPIENT_EMAIL', 'nicolasandreszarate@gmail.com');

// Define your Google reCAPTCHA Secret Key (obtain from Google reCAPTCHA Admin Console)
define('RECAPTCHA_SECRET_KEY', '6LcGZRwtAAAAAB22V7ZVl80FvVfcEwZ-dkNddrDu'); // Replace this placeholder if it doesn't match your actual secret key

// Determine the language (based on Referer or request header, default to English)
$referer = $_SERVER['HTTP_REFERER'] ?? '';
$isSpanish = (strpos($referer, 'translate.html') !== false);

// 2. RETRIEVE & SANITIZE INPUTS
$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$subject = trim($_POST['subject'] ?? '');
$message = trim($_POST['message'] ?? '');
$recaptcha_response = $_POST['g-recaptcha-response'] ?? '';

// Prevent email header injections by stripping newline characters
$name = str_replace(array("\r", "\n", "%0a", "%0d"), '', $name);
$subject = str_replace(array("\r", "\n", "%0a", "%0d"), '', $subject);
$email = filter_var($email, FILTER_SANITIZE_EMAIL);

// 3. VALIDATE REQUIRED FIELDS
if (empty($name) || empty($email) || empty($subject) || empty($message)) {
    echo json_encode([
        'success' => false,
        'message' => $isSpanish 
            ? 'Todos los campos son obligatorios.' 
            : 'All fields are required.'
    ]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        'success' => false,
        'message' => $isSpanish 
            ? 'La dirección de correo electrónico no es válida.' 
            : 'Invalid email address.'
    ]);
    exit;
}

// 4. VERIFY RECAPTCHA WITH GOOGLE
if (empty($recaptcha_response)) {
    echo json_encode([
        'success' => false,
        'message' => $isSpanish 
            ? 'Por favor, resuelve el reCAPTCHA antes de enviar.' 
            : 'Please solve the reCAPTCHA challenge.'
    ]);
    exit;
}

$verify_url = 'https://www.google.com/recaptcha/api/siteverify';
$recaptcha_data = [
    'secret'   => RECAPTCHA_SECRET_KEY,
    'response' => $recaptcha_response,
    'remoteip' => $_SERVER['REMOTE_ADDR']
];

$options = [
    'http' => [
        'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
        'method'  => 'POST',
        'content' => http_build_query($recaptcha_data),
        'timeout' => 10 // Timeout in seconds
    ]
];

$context = stream_context_create($options);
$verify_result = @file_get_contents($verify_url, false, $context);

if ($verify_result === false) {
    // If the server cannot connect to Google APIs, fail gracefully
    echo json_encode([
        'success' => false,
        'message' => $isSpanish 
            ? 'No se pudo verificar el reCAPTCHA con Google. Por favor, inténtelo de nuevo.' 
            : 'Could not verify reCAPTCHA with Google. Please try again.'
    ]);
    exit;
}

$recaptcha_keys = json_decode($verify_result, true);
if (empty($recaptcha_keys['success'])) {
    echo json_encode([
        'success' => false,
        'message' => $isSpanish 
            ? 'La validación del reCAPTCHA ha fallado o es inválida.' 
            : 'reCAPTCHA validation failed or expired.'
    ]);
    exit;
}

// 5. CONSTRUCT & SEND THE EMAIL
$email_subject = "Nuevo mensaje de contacto: " . $subject;

// Construct HTML Headers
$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
$headers .= "From: Portfolio Contact <noreply@nicolaszarate.com>" . "\r\n";
$headers .= "Reply-To: " . $name . " <" . $email . ">" . "\r\n";

// HTML Email Body with Premium Styles
$email_body = "
<html>
<head>
  <title>Nuevo Mensaje desde el Portafolio</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f6f9fc; color: #333; margin: 0; padding: 20px; }
    .container { max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 8px 20px rgba(0,0,0,0.08); border: 1px solid #eef2f5; overflow: hidden; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%); color: #ffffff; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px; }
    .content { padding: 30px; line-height: 1.6; }
    .field { margin-bottom: 20px; border-bottom: 1px solid #f2f5f8; padding-bottom: 15px; }
    .field:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
    .field-title { font-weight: bold; color: #4facfe; text-transform: uppercase; font-size: 11px; letter-spacing: 1.5px; margin-bottom: 5px; }
    .field-value { font-size: 16px; color: #333333; }
    .footer { background-color: #fcfdfe; text-align: center; padding: 15px; font-size: 12px; color: #9ca3af; border-top: 1px solid #f2f5f8; }
  </style>
</head>
<body>
  <div class='container'>
    <div class='header'>
      <h1>Nuevo Mensaje de Contacto</h1>
    </div>
    <div class='content'>
      <div class='field'>
        <div class='field-title'>Nombre</div>
        <div class='field-value'>" . htmlspecialchars($name) . "</div>
      </div>
      <div class='field'>
        <div class='field-title'>Correo Electrónico</div>
        <div class='field-value'><a href='mailto:" . htmlspecialchars($email) . "'>" . htmlspecialchars($email) . "</a></div>
      </div>
      <div class='field'>
        <div class='field-title'>Asunto</div>
        <div class='field-value'>" . htmlspecialchars($subject) . "</div>
      </div>
      <div class='field'>
        <div class='field-title'>Mensaje</div>
        <div class='field-value' style='white-space: pre-wrap;'>" . nl2br(htmlspecialchars($message)) . "</div>
      </div>
    </div>
    <div class='footer'>
      Este correo fue enviado de forma segura desde el formulario de contacto de tu portafolio.
    </div>
  </div>
</body>
</html>
";

// Execute native mail
if (@mail(RECIPIENT_EMAIL, $email_subject, $email_body, $headers)) {
    echo json_encode([
        'success' => true,
        'message' => $isSpanish 
            ? 'Tu mensaje ha sido enviado con éxito.' 
            : 'Your message has been sent successfully.'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => $isSpanish 
            ? 'Hubo un error del servidor al intentar enviar el correo. Por favor, intente de nuevo o escriba a ' . RECIPIENT_EMAIL 
            : 'Server failed to send email. Please try again or email directly to ' . RECIPIENT_EMAIL
    ]);
}
exit;
