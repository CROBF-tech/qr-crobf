export type Locale = 'en' | 'es';

export const defaultLocale: Locale = 'en';
export const locales: Locale[] = ['en', 'es'];

export const ui = {
  en: {
    // Brand / SEO
    brandName: 'qr.crobf.tech',
    brandTagline: 'Free QR codes and barcodes, generated securely in your browser.',

    // Layout / shared
    siteTitle: 'Free QR Code & Barcode Generator',
    siteTagline:
      'Create unlimited QR codes and barcodes for free, instantly in your browser. No signup, no tracking, no server.',
    backToTools: 'All tools',

    // Home
    heroEyebrow: 'Free · Unlimited · Private',
    heroTitle1: 'Create QR codes',
    heroTitle2: 'and barcodes in seconds',
    heroDescription:
      'No accounts. No downloads. No data sent anywhere. Type your content, customize the look, and download your code as PNG, SVG, or JPEG.',
    heroCtaQr: 'Create a QR code',
    heroCtaBarcode: 'Create a barcode',

    benefitPrivacyTitle: 'Completely private',
    benefitPrivacyDesc: 'Your data never leaves your browser. We do not store, track, or transmit anything.',
    benefitFreeTitle: 'Free and unlimited',
    benefitFreeDesc: 'Generate as many codes as you need. No paywalls, no daily limits, no registration.',
    benefitExportTitle: 'Export in any format',
    benefitExportDesc: 'Download high-resolution PNG, scalable SVG, or compact JPEG for print or web.',
    benefitCustomizeTitle: 'Make it yours',
    benefitCustomizeDesc: 'Change colors, add gradients, insert a logo, and pick the exact QR style you want.',

    directoryTitle: 'Start creating',
    directoryDescription:
      'Pick a tool and get your code in seconds. Everything runs locally in your browser.',
    toolsAvailable: 'tools available',

    // Categories
    catGenerate: 'Create',
    catRead: 'Read',

    // Tool names + descriptions (home cards)
    qrGeneratorTitle: 'QR Generator',
    qrGeneratorDesc: 'Turn any link, text, phone number, or Wi-Fi details into a downloadable QR code.',
    qrScannerTitle: 'QR Scanner',
    qrScannerDesc: 'Point your camera at a QR code to read it instantly. Works entirely on your device.',
    barcodeGeneratorTitle: 'Barcode Generator',
    barcodeGeneratorDesc: 'Create standard barcodes for products, books, inventory, and packaging in seconds.',
    barcodeScannerTitle: 'Barcode Scanner',
    barcodeScannerDesc: 'Scan barcodes with your camera. No uploads, no server, no sign-up.',

    // QR page
    qrPageBreadcrumb: 'Tools / QR',
    qrPageTitle: 'Create Custom QR Codes Online',
    qrPageDescription:
      'Design, customize, and download free QR codes for links, text, phones, emails, and Wi-Fi. Private, fast, and unlimited.',

    // Barcode page
    barcodePageBreadcrumb: 'Tools / Barcode',
    barcodePageTitle: 'Create Barcodes Online (EAN, UPC, CODE128)',
    barcodePageDescription:
      'Generate standard barcodes for products, inventory, and packaging. Supports EAN, UPC, CODE128, CODE39, and more. Free and private.',

    // QR Generator component
    qrGenLabel: 'What do you want to encode?',
    qrGenPlaceholder: 'Write a link, text, phone number, Wi-Fi...',
    qrGenHelper: 'Tip: website links are the most common. Your data never leaves this page.',
    qrGenButton: 'Create QR Code',
    qrGenLoading: 'Creating...',
    qrGenError: 'Could not create the QR code. Please try with less text.',
    qrGenEmpty: 'Enter something above to create your QR code.',
    qrGenDownload: 'Download QR as image',
    qrGenAlt: 'Your generated QR code',
    qrCustomizeTitle: 'Customize',
    qrCustomizeSectionData: 'Data & Correction',
    qrCustomizeErrorCorrection: 'Error correction',
    qrCustomizeErrorCorrectionLogoHelper: 'Logo detected: minimum Q is required to keep the QR readable.',
    qrCustomizeErrorCorrectionHelper: 'Higher levels recover from damage but create denser codes.',
    qrCustomizeSectionDots: 'Dots',
    qrCustomizeDotsColor: 'Dots color',
    qrCustomizeDotsGradient: 'Dots gradient',
    qrCustomizeDotsShape: 'Dots shape',
    qrCustomizeSectionCornerSquares: 'Corner squares',
    qrCustomizeCornerSquareColor: 'Corner square color',
    qrCustomizeCornerSquareGradient: 'Corner square gradient',
    qrCustomizeCornerSquareShape: 'Corner square shape',
    qrCustomizeSectionCornerDots: 'Corner dots',
    qrCustomizeCornerDotColor: 'Corner dot color',
    qrCustomizeCornerDotShape: 'Corner dot shape',
    qrCustomizeSectionBackground: 'Background',
    qrCustomizeBackgroundColor: 'Background color',
    qrCustomizeBackgroundGradient: 'Background gradient',
    qrCustomizeSectionLogo: 'Logo',
    qrCustomizeLogoUpload: 'Center logo',
    qrCustomizeLogoChange: 'Change',
    qrCustomizeLogoClear: 'Clear',
    qrCustomizeLogoSize: 'Logo size',
    qrCustomizeLogoMargin: 'Logo margin',
    qrCustomizeLogoHideDots: 'Hide dots behind logo',
    qrCustomizeSectionSize: 'Size',
    qrCustomizeQRSize: 'QR size',
    qrCustomizeMargin: 'Margin',
    qrCustomizeFormatPng: 'PNG',
    qrCustomizeFormatSvg: 'SVG',
    qrCustomizeFormatJpeg: 'JPEG',
    qrCustomizeValidationWarning: 'The QR could not be read. Try lowering the logo size, increasing contrast, or reducing styling complexity.',

    // QR Scanner component
    qrScanTitle: 'Scan a QR Code',
    qrScanDescription: 'Use your camera to read any QR code instantly.',
    qrScanPreview: 'Camera preview will appear here',
    qrScanStart: 'Open Camera',
    qrScanStop: 'Stop Camera',
    qrScanErrorNoCamera: 'Your browser does not allow camera access.',
    qrScanErrorPermission: 'Please allow camera access to scan codes.',
    qrScanErrorGeneric: 'Could not start the camera. Try reloading the page.',
    qrScanResultLabel: 'Result',
    qrScanCopy: 'Copy result',
    qrScanCopied: 'Copied!',

    // Barcode Generator component
    barcodeGenTitle: 'Create a Barcode',
    barcodeGenLabel: 'Numbers or letters to encode',
    barcodeGenPlaceholder: 'For example: 123456789',
    barcodeGenHelper: 'Choose the right format for your use.',
    barcodeGenFormatLabel: 'Barcode type',
    barcodeGenFormatHelp: 'CODE128 works for most letters and numbers.',
    barcodeGenButton: 'Create Barcode',
    barcodeGenDownload: 'Download Barcode',
    barcodeGenError: 'Could not create the barcode. Check the format and value.',
    barcodeCustomizeTitle: 'Customize',
    barcodeCustomizeSectionFormat: 'Format',
    barcodeCustomizeSectionColors: 'Colors',
    barcodeCustomizeBarColor: 'Bar color',
    barcodeCustomizeBackground: 'Background',
    barcodeCustomizeSectionDimensions: 'Dimensions',
    barcodeCustomizeBarWidth: 'Bar width',
    barcodeCustomizeHeight: 'Height',
    barcodeCustomizeMargin: 'Margin',
    barcodeCustomizeSectionText: 'Text',
    barcodeCustomizeShowValue: 'Show value',
    barcodeCustomizeFont: 'Font',
    barcodeCustomizeFontSize: 'Font size',
    barcodeCustomizeTextPosition: 'Text position',
    barcodeCustomizeTextPositionBottom: 'Bottom',
    barcodeCustomizeTextPositionTop: 'Top',
    barcodeCustomizeFormatPng: 'PNG',
    barcodeCustomizeFormatSvg: 'SVG',

    // Barcode Scanner component
    barcodeScanTitle: 'Scan a Barcode',
    barcodeScanDescription: 'Point your camera at any barcode to read it.',
    barcodeScanPreview: 'Camera preview will appear here',
    barcodeScanStart: 'Open Camera',
    barcodeScanStop: 'Stop Camera',
    barcodeScanResultLabel: 'Code read',
    barcodeScanFormatLabel: 'Format',
    barcodeScanCopy: 'Copy code',
    barcodeScanCopied: 'Copied!',

    // Footer
    footerBrand: 'qr.crobf.tech',
    footerTagline: 'Free QR codes and barcodes, generated in your browser.',
  },

  es: {
    // Brand / SEO
    brandName: 'qr.crobf.tech',
    brandTagline: 'Códigos QR y de barras gratis, generados de forma segura en tu navegador.',

    // Layout / shared
    siteTitle: 'Generador de Códigos QR y de Barras Gratis',
    siteTagline:
      'Crea códigos QR y de barras gratis e ilimitados al instante en tu navegador. Sin registro, sin rastreo, sin servidor.',
    backToTools: 'Todas las herramientas',

    // Home
    heroEyebrow: 'Gratis · Ilimitado · Privado',
    heroTitle1: 'Crea códigos QR',
    heroTitle2: 'y de barras en segundos',
    heroDescription:
      'Sin cuentas. Sin descargas. Sin enviar datos a ningún sitio. Escribe tu contenido, personaliza el diseño y descarga tu código en PNG, SVG o JPEG.',
    heroCtaQr: 'Crear un QR',
    heroCtaBarcode: 'Crear un código de barras',

    benefitPrivacyTitle: 'Completamente privado',
    benefitPrivacyDesc: 'Tus datos nunca salen de tu navegador. No almacenamos, rastreamos ni transmitimos nada.',
    benefitFreeTitle: 'Gratis e ilimitado',
    benefitFreeDesc: 'Genera todos los códigos que necesites. Sin pagos, sin límites diarios, sin registro.',
    benefitExportTitle: 'Exporta en cualquier formato',
    benefitExportDesc: 'Descarga PNG de alta resolución, SVG escalable o JPEG compacto para web o impresión.',
    benefitCustomizeTitle: 'Hazlo tuyo',
    benefitCustomizeDesc: 'Cambia colores, añade degradados, inserta un logo y elige el estilo de QR exacto que quieres.',

    directoryTitle: 'Empieza a crear',
    directoryDescription:
      'Elige una herramienta y obtén tu código en segundos. Todo funciona localmente en tu navegador.',
    toolsAvailable: 'herramientas disponibles',

    // Categories
    catGenerate: 'Crear',
    catRead: 'Leer',

    // Tool names + descriptions
    qrGeneratorTitle: 'Generador de QR',
    qrGeneratorDesc: 'Convierte cualquier enlace, texto, teléfono o datos Wi-Fi en un código QR descargable.',
    qrScannerTitle: 'Lector de QR',
    qrScannerDesc: 'Apunta tu cámara a un QR para leerlo al instante. Funciona completamente en tu dispositivo.',
    barcodeGeneratorTitle: 'Generador de Barras',
    barcodeGeneratorDesc: 'Crea códigos de barras estándar para productos, libros, inventario y packaging en segundos.',
    barcodeScannerTitle: 'Lector de Barras',
    barcodeScannerDesc: 'Escanea códigos de barras con tu cámara. Sin subidas, sin servidor, sin registro.',

    // QR page
    qrPageBreadcrumb: 'Herramientas / QR',
    qrPageTitle: 'Crear Códigos QR Personalizados Online',
    qrPageDescription:
      'Diseña, personaliza y descarga códigos QR gratis para enlaces, textos, teléfonos, correos y Wi-Fi. Privado, rápido e ilimitado.',

    // Barcode page
    barcodePageBreadcrumb: 'Herramientas / Barras',
    barcodePageTitle: 'Crear Códigos de Barras Online (EAN, UPC, CODE128)',
    barcodePageDescription:
      'Genera códigos de barras estándar para productos, inventario y packaging. Soporta EAN, UPC, CODE128, CODE39 y más. Gratis y privado.',

    // QR Generator component
    qrGenLabel: '¿Qué quieres codificar?',
    qrGenPlaceholder: 'Escribe un enlace, texto, teléfono, Wi-Fi...',
    qrGenHelper: 'Consejo: lo más habitual es compartir un enlace. Tus datos nunca salen de esta página.',
    qrGenButton: 'Crear código QR',
    qrGenLoading: 'Creando...',
    qrGenError: 'No se pudo crear el código QR. Prueba con menos texto.',
    qrGenEmpty: 'Escribe algo arriba para crear tu código QR.',
    qrGenDownload: 'Descargar QR como imagen',
    qrGenAlt: 'Tu código QR generado',
    qrCustomizeTitle: 'Personalizar',
    qrCustomizeSectionData: 'Datos y corrección',
    qrCustomizeErrorCorrection: 'Corrección de errores',
    qrCustomizeErrorCorrectionLogoHelper: 'Logo detectado: se requiere mínimo Q para mantener el QR legible.',
    qrCustomizeErrorCorrectionHelper: 'Niveles más altos recuperan daños pero generan códigos más densos.',
    qrCustomizeSectionDots: 'Puntos',
    qrCustomizeDotsColor: 'Color de puntos',
    qrCustomizeDotsGradient: 'Gradiente de puntos',
    qrCustomizeDotsShape: 'Forma de puntos',
    qrCustomizeSectionCornerSquares: 'Cuadrados de esquina',
    qrCustomizeCornerSquareColor: 'Color de cuadrado',
    qrCustomizeCornerSquareGradient: 'Gradiente de cuadrado',
    qrCustomizeCornerSquareShape: 'Forma de cuadrado',
    qrCustomizeSectionCornerDots: 'Puntos de esquina',
    qrCustomizeCornerDotColor: 'Color de punto',
    qrCustomizeCornerDotShape: 'Forma de punto',
    qrCustomizeSectionBackground: 'Fondo',
    qrCustomizeBackgroundColor: 'Color de fondo',
    qrCustomizeBackgroundGradient: 'Gradiente de fondo',
    qrCustomizeSectionLogo: 'Logo',
    qrCustomizeLogoUpload: 'Logo central',
    qrCustomizeLogoChange: 'Cambiar',
    qrCustomizeLogoClear: 'Quitar',
    qrCustomizeLogoSize: 'Tamaño del logo',
    qrCustomizeLogoMargin: 'Margen del logo',
    qrCustomizeLogoHideDots: 'Ocultar puntos detrás del logo',
    qrCustomizeSectionSize: 'Tamaño',
    qrCustomizeQRSize: 'Tamaño del QR',
    qrCustomizeMargin: 'Margen',
    qrCustomizeFormatPng: 'PNG',
    qrCustomizeFormatSvg: 'SVG',
    qrCustomizeFormatJpeg: 'JPEG',
    qrCustomizeValidationWarning: 'No se pudo leer el QR. Prueba a reducir el logo, aumentar el contraste o simplificar el estilo.',

    // QR Scanner component
    qrScanTitle: 'Leer un QR',
    qrScanDescription: 'Usa tu cámara para leer cualquier código QR al instante.',
    qrScanPreview: 'Aquí aparecerá la vista de la cámara',
    qrScanStart: 'Abrir cámara',
    qrScanStop: 'Cerrar cámara',
    qrScanErrorNoCamera: 'Tu navegador no permite acceder a la cámara.',
    qrScanErrorPermission: 'Permite el acceso a la cámara para escanear códigos.',
    qrScanErrorGeneric: 'No se pudo encender la cámara. Prueba a recargar la página.',
    qrScanResultLabel: 'Resultado',
    qrScanCopy: 'Copiar resultado',
    qrScanCopied: '¡Copiado!',

    // Barcode Generator component
    barcodeGenTitle: 'Crear un Código de Barras',
    barcodeGenLabel: 'Números o letras a codificar',
    barcodeGenPlaceholder: 'Por ejemplo: 123456789',
    barcodeGenHelper: 'Elige el tipo adecuado según para qué lo uses.',
    barcodeGenFormatLabel: 'Tipo de código',
    barcodeGenFormatHelp: 'CODE128 sirve para la mayoría de letras y números.',
    barcodeGenButton: 'Crear Código',
    barcodeGenDownload: 'Descargar Código',
    barcodeGenError: 'No se pudo crear el código. Revisa el tipo y el valor.',
    barcodeCustomizeTitle: 'Personalizar',
    barcodeCustomizeSectionFormat: 'Formato',
    barcodeCustomizeSectionColors: 'Colores',
    barcodeCustomizeBarColor: 'Color de barras',
    barcodeCustomizeBackground: 'Fondo',
    barcodeCustomizeSectionDimensions: 'Dimensiones',
    barcodeCustomizeBarWidth: 'Ancho de barra',
    barcodeCustomizeHeight: 'Alto',
    barcodeCustomizeMargin: 'Margen',
    barcodeCustomizeSectionText: 'Texto',
    barcodeCustomizeShowValue: 'Mostrar valor',
    barcodeCustomizeFont: 'Fuente',
    barcodeCustomizeFontSize: 'Tamaño de fuente',
    barcodeCustomizeTextPosition: 'Posición del texto',
    barcodeCustomizeTextPositionBottom: 'Abajo',
    barcodeCustomizeTextPositionTop: 'Arriba',
    barcodeCustomizeFormatPng: 'PNG',
    barcodeCustomizeFormatSvg: 'SVG',

    // Barcode Scanner component
    barcodeScanTitle: 'Leer un Código de Barras',
    barcodeScanDescription: 'Apunta tu cámara a cualquier código de barras para leerlo.',
    barcodeScanPreview: 'Aquí aparecerá la vista de la cámara',
    barcodeScanStart: 'Abrir cámara',
    barcodeScanStop: 'Cerrar cámara',
    barcodeScanResultLabel: 'Código leído',
    barcodeScanFormatLabel: 'Formato',
    barcodeScanCopy: 'Copiar código',
    barcodeScanCopied: '¡Copiado!',

    // Footer
    footerBrand: 'qr.crobf.tech',
    footerTagline: 'Códigos QR y de barras gratis, generados en tu navegador.',
  },
} as const;

export type UITranslations = (typeof ui)[Locale];

export function getTranslations(locale: Locale): UITranslations {
  return ui[locale] ?? ui[defaultLocale];
}
