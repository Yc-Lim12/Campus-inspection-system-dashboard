const pdpa = 'https://www.pdp.gov.my/en/akta709/';
const wcag = 'https://www.w3.org/TR/WCAG21/';

export const policySections = [
  {
    id: 'privacy',
    title: 'Privacy Notice',
    titleMs: 'Notis Privasi',
    en: {
      demo: 'This demo uses sample inspection data. It stores display preferences in your browser and your selected demo role in the current tab. Signing out clears the demo session. Leave the optional login fields blank or use sample details.',
      blocks: [
        {
          title: 'What we plan to collect',
          text: 'This notice covers the Campus Inspection Robot demo and the proposed live system. Sunway’s approval of the live privacy notice and its review of the applicable requirements under Malaysia’s Personal Data Protection Act 2010 (Act 709) are pending.',
          items: [
            ['Account details', 'Name, Sunway email address, and facility staff or administrator role.'],
            ['Activity records', 'Sign-in times, alert acknowledgments and updates, and confirmed robot commands.'],
            ['Inspection data', 'Checkpoint photos, sensor readings, timestamps, and checkpoint locations.'],
          ],
        },
        {
          title: 'Where the information comes from and what is required',
          text: 'The proposed system uses staff account details from Sunway, creates activity records when staff use the dashboard, and receives inspection data from the robot. A verified staff account and assigned role are required for live staff access. Asking the AI assistant questions is optional. Campus visitors do not need a dashboard account to report a privacy concern.',
        },
        {
          title: 'What we do not collect',
          text: 'The planned system excludes audio recording, face recognition, and individual identification or tracking. A person may still appear incidentally in a checkpoint photo. The Camera and Image Policy describes how those photos are handled.',
          link: ['Camera and Image Policy', '#legal/camera'],
        },
        {
          title: 'Why we use it',
          text: 'Inspection data helps staff identify facility hazards, route alerts, prepare patrol reports, and compare conditions across visits. Activity records show who reviewed an alert or confirmed a robot command.',
        },
        {
          title: 'Who can see it',
          text: 'Access is planned for authorised facility staff and administrators according to their role. Data is for facility operations and is excluded from sale or marketing. The proposed external recipient is an approved AI provider. Any other provider that would handle personal data must be identified in the live notice before that data is shared.',
          link: ['AI Assistant Notice', '#legal/ai'],
        },
        {
          title: 'How we plan to protect it',
          text: 'Live deployment requires authenticated sessions, server-side role checks, and encrypted connections. If the system manages passwords directly, it must store salted password hashes. The sample roles in this demo preview the interface only.',
        },
        {
          title: 'How long we keep it',
          text: 'The retention periods for photos, sensor readings, activity logs, and backups are pending Sunway’s approval. Before launch, the live notice should state when each period begins, when records are deleted, and how deletion is checked. Removing staff access ends the ability to sign in. Existing records follow the approved retention schedule.',
        },
        {
          title: 'Your rights',
          text: 'Use the privacy contact to ask for access to or correction of your personal data. You can also report a photo concern or ask how processing can be limited. Give enough information to locate the record, such as the date and checkpoint. Use the approved contact channel for any identity verification.',
          link: ['Contact', '#legal/contact'],
        },
        { link: ['Malaysia’s Personal Data Protection Act 2010 (Act 709)', pdpa] },
      ],
    },
    ms: {
      demo: 'Demo ini menggunakan data pemeriksaan contoh. Keutamaan paparan disimpan dalam pelayar dan peranan demo disimpan dalam tab semasa. Log keluar menamatkan sesi demo. Biarkan ruang log masuk pilihan kosong atau gunakan butiran contoh.',
      blocks: [
        {
          title: 'Data yang dirancang untuk dikumpul',
          text: 'Notis ini meliputi demo Robot Pemeriksaan Kampus dan sistem sebenar yang dicadangkan. Kelulusan notis privasi bagi sistem sebenar oleh Sunway dan semakan keperluan yang terpakai di bawah Akta Perlindungan Data Peribadi 2010 (Akta 709) masih belum selesai.',
          items: [
            ['Butiran akaun', 'Nama, alamat e-mel Sunway dan peranan sebagai staf fasiliti atau pentadbir.'],
            ['Rekod aktiviti', 'Masa log masuk, pengesahan penerimaan dan kemas kini amaran serta arahan robot yang disahkan.'],
            ['Data pemeriksaan', 'Foto pusat pemeriksaan, bacaan penderia, cap masa dan lokasi pusat pemeriksaan.'],
          ],
        },
        {
          title: 'Sumber maklumat dan butiran yang diperlukan',
          text: 'Sistem yang dicadangkan menggunakan butiran akaun staf daripada Sunway, menjana rekod aktiviti apabila staf menggunakan papan pemuka dan menerima data pemeriksaan daripada robot. Akaun staf yang disahkan dan peranan yang ditetapkan diperlukan untuk akses kepada sistem sebenar. Staf boleh memilih sama ada hendak menggunakan pembantu AI. Pelawat kampus boleh melaporkan kebimbangan privasi tanpa akaun papan pemuka.',
        },
        {
          title: 'Data yang tidak dikumpul',
          text: 'Sistem yang dirancang tidak merakam audio, menggunakan pengecaman wajah, mengenal pasti individu atau menjejaki mereka. Seseorang mungkin terakam secara tidak sengaja dalam foto pemeriksaan. Dasar Kamera dan Imej menerangkan cara foto tersebut dikendalikan.',
          link: ['Dasar Kamera dan Imej', '#legal/camera'],
        },
        {
          title: 'Tujuan penggunaan',
          text: 'Data membantu staf mengenal pasti bahaya, menyalurkan amaran, menyediakan laporan rondaan dan membandingkan keadaan antara lawatan. Rekod aktiviti menunjukkan siapa yang menyemak amaran atau mengesahkan arahan robot.',
        },
        {
          title: 'Pihak yang boleh mengakses data',
          text: 'Akses dirancang untuk staf fasiliti dan pentadbir yang diberi kuasa mengikut peranan. Data digunakan untuk operasi fasiliti dan tidak dijual atau digunakan untuk pemasaran. Pihak luar yang dicadangkan ialah penyedia AI yang diluluskan. Penyedia lain yang akan mengendalikan data peribadi perlu dikenal pasti dalam notis sistem sebenar sebelum data dikongsi.',
          link: ['Notis Pembantu AI', '#legal/ai'],
        },
        {
          title: 'Cara data akan dilindungi',
          text: 'Penggunaan sebenar memerlukan sesi yang disahkan, semakan peranan pada pelayan dan sambungan yang disulitkan. Jika sistem mengurus kata laluan, sistem mesti menyimpan cincangan kata laluan yang ditambah nilai rawak. Peranan contoh dalam demo ini hanya menunjukkan antara muka.',
        },
        {
          title: 'Tempoh penyimpanan',
          text: 'Tempoh penyimpanan foto, bacaan penderia, log aktiviti dan sandaran masih menunggu kelulusan Sunway. Sebelum sistem dilancarkan, notis penggunaan sebenar perlu menyatakan bila setiap tempoh bermula, bila rekod dipadam dan cara pemadaman disahkan. Penamatan akses staf menghentikan keupayaan log masuk. Rekod sedia ada mengikut jadual penyimpanan yang diluluskan.',
        },
        {
          title: 'Hak anda',
          text: 'Gunakan saluran hubungan privasi untuk memohon akses kepada data peribadi anda atau pembetulan data tersebut. Anda juga boleh melaporkan kebimbangan tentang foto atau bertanya cara mengehadkan pemprosesan. Berikan maklumat yang mencukupi untuk mencari rekod, seperti tarikh dan pusat pemeriksaan. Gunakan saluran hubungan yang diluluskan jika pengesahan identiti diperlukan.',
          link: ['Hubungi Kami', '#legal/contact'],
        },
        { link: ['Akta Perlindungan Data Peribadi 2010 (Akta 709)', pdpa] },
      ],
    },
  },
  {
    id: 'camera',
    title: 'Camera and Image Policy',
    titleMs: 'Dasar Kamera dan Imej',
    en: {
      demo: 'The demo displays an illustration. Simulating a photo request changes the displayed timestamp. The physical camera and microphone are not connected.',
      blocks: [
        {
          title: 'When photos can be taken',
          items: [
            'The proposed robot takes still photos while stopped at approved checkpoints. The camera is aimed at walls, ceilings, or floors for hazard detection and is disabled in no-camera zones.',
            'An authorised staff member may request one still photo from the front camera at an approved location. The request should record the staff account, time, and checkpoint. The system provides no live video stream or audio.',
            'The LED status ring shows when the robot is active. Staff must follow posted camera restrictions and local instructions.',
          ],
        },
        {
          title: 'How we handle images',
          text: 'If a recognisable person is accidentally captured during live deployment, staff should discard the photo or redact identifying details before it is saved to the inspection record. If you think you were photographed, give the approximate time and location to the privacy contact so staff can locate the image. Photos follow the approved retention schedule.',
          link: ['Contact about a photo', '#legal/contact'],
        },
      ],
    },
    ms: {
      demo: 'Demo ini memaparkan ilustrasi. Permintaan foto simulasi mengubah cap masa pada skrin. Kamera dan mikrofon sebenar tidak disambungkan.',
      blocks: [
        {
          title: 'Bila foto boleh diambil',
          items: [
            'Robot yang dicadangkan mengambil foto pegun apabila berhenti di pusat pemeriksaan yang diluluskan. Kamera dihalakan ke dinding, siling atau lantai untuk pengesanan bahaya dan dinyahaktifkan di zon larangan kamera.',
            'Staf yang diberi kuasa boleh meminta satu foto pegun daripada kamera hadapan di lokasi yang diluluskan. Permintaan merekodkan akaun staf, masa dan pusat pemeriksaan. Sistem ini tidak menyediakan siaran video langsung atau audio.',
            'Gelang LED menunjukkan robot sedang aktif. Staf mesti mematuhi tanda larangan kamera dan arahan di lokasi.',
          ],
        },
        {
          title: 'Cara imej dikendalikan',
          text: 'Jika seseorang yang boleh dikenal pasti terakam secara tidak sengaja semasa operasi sebenar, staf perlu membuang foto tersebut atau menyembunyikan butiran pengenalan sebelum foto disimpan dalam rekod pemeriksaan. Jika anda rasa anda mungkin terakam, berikan anggaran masa dan lokasi melalui saluran privasi supaya staf boleh mencari imej tersebut. Foto mengikut jadual penyimpanan yang diluluskan.',
          link: ['Hubungi kami tentang foto', '#legal/contact'],
        },
      ],
    },
  },
  {
    id: 'ai',
    title: 'AI Assistant Notice',
    titleMs: 'Notis Pembantu AI',
    en: {
      demo: 'The demo shows a sample conversation. It sends no questions, images, or records to an AI provider and issues no robot commands.',
      blocks: [
        {
          title: 'Answers and data shared',
          items: [
            'AI answers can be incomplete or wrong. Check the original inspection record, reading, or photo before acting on an answer.',
            'If an external provider is approved, the proposed assistant may send the question and the minimum approved record fields needed to answer it, such as the checkpoint, hazard category, or reading. The proposed system must check questions for personal or confidential details before sending them and block requests that contain those details. Keep account details, staff activity logs, and checkpoint photos out of provider requests.',
            'Do not enter names, contact details, or confidential material. If the provider connection is unavailable, staff can use the dashboard’s inspection records to check findings directly.',
          ],
        },
        {
          title: 'Command confirmation',
          text: 'The proposed assistant can offer three commands: start a patrol, go to a predefined checkpoint, and return to the start point. An authorised staff member must confirm the command and check that it is safe before it can run.',
          link: ['Robot Safety', '#legal/safety'],
        },
      ],
    },
    ms: {
      demo: 'Demo ini memaparkan perbualan contoh. Demo tidak menghantar soalan, imej atau rekod kepada penyedia AI dan tidak mengeluarkan arahan robot.',
      blocks: [
        {
          title: 'Jawapan dan data yang dikongsi',
          items: [
            'Jawapan AI mungkin tidak lengkap atau salah. Semak rekod pemeriksaan, bacaan atau foto asal sebelum mengambil tindakan.',
            'Jika penyedia luar diluluskan, pembantu yang dicadangkan boleh menghantar soalan dan medan rekod yang diluluskan serta diperlukan, seperti pusat pemeriksaan, kategori bahaya atau bacaan. Sistem yang dicadangkan mesti menyemak soalan sebelum menghantarnya dan menyekat permintaan yang mengandungi maklumat peribadi atau sulit. Jangan sertakan butiran akaun, log aktiviti staf atau foto pusat pemeriksaan dalam permintaan kepada penyedia.',
            'Jangan masukkan nama, butiran hubungan atau bahan sulit. Jika sambungan kepada penyedia tidak tersedia, staf boleh menyemak hasil pemeriksaan terus dalam rekod pada papan pemuka.',
          ],
        },
        {
          title: 'Pengesahan arahan',
          text: 'Pembantu yang dicadangkan boleh menawarkan tiga arahan: mulakan rondaan, pergi ke pusat pemeriksaan yang ditetapkan dan kembali ke tempat mula. Staf yang diberi kuasa mesti mengesahkan arahan dan memastikan keadaan selamat sebelum arahan dilaksanakan.',
          link: ['Keselamatan Robot', '#legal/safety'],
        },
      ],
    },
  },
  {
    id: 'terms',
    title: 'Terms of Use',
    titleMs: 'Terma Penggunaan',
    en: {
      demo: 'Use the dashboard with sample data for project demonstration. Sample incident updates are cleared on sign-out or reload.',
      blocks: [{
        title: 'Rules for campus use',
        items: [
          'Only authorised Sunway facility staff and administrators may use a live account. Keep your account private and use the system for facility inspection and maintenance.',
          'Use inspection findings alongside manual safety checks and the existing reporting process. Follow departmental rules for sharing inspection records.',
          'Sending a robot into an unsafe area or sharing restricted records outside authorised channels may result in access being suspended under Sunway’s rules.',
        ],
      }],
    },
    ms: {
      demo: 'Gunakan papan pemuka dengan data contoh untuk demonstrasi projek. Kemas kini insiden contoh dipadam daripada sesi apabila anda log keluar atau memuat semula halaman.',
      blocks: [{
        title: 'Peraturan penggunaan di kampus',
        items: [
          'Hanya staf fasiliti dan pentadbir Sunway yang diberi kuasa boleh menggunakan akaun sebenar. Jangan kongsi akaun anda dan gunakan sistem untuk pemeriksaan serta penyelenggaraan fasiliti.',
          'Gunakan hasil pemeriksaan bersama pemeriksaan keselamatan manual dan proses pelaporan sedia ada. Ikut peraturan jabatan untuk perkongsian rekod pemeriksaan.',
          'Menghantar robot ke kawasan yang tidak selamat atau berkongsi rekod terhad melalui saluran yang tidak dibenarkan boleh menyebabkan akses digantung mengikut peraturan Sunway.',
        ],
      }],
    },
  },
  {
    id: 'safety',
    title: 'Robot Safety',
    titleMs: 'Keselamatan Robot',
    en: {
      demo: 'The demo controls cannot move or stop a real robot.',
      blocks: [{
        title: 'When operating a connected robot',
        items: [
          'Confirm movement only after checking that the route is clear and permitted for the robot.',
          'In an emergency, use the physical emergency stop when you can reach it safely and follow the on-site procedure. The dashboard Stop robot control can send a stop request when the robot is connected.',
          'Keep people clear of moving parts. Do not ride on, push, or deliberately block the robot.',
        ],
      }],
    },
    ms: {
      demo: 'Kawalan demo tidak boleh menggerakkan atau menghentikan robot sebenar.',
      blocks: [{
        title: 'Semasa mengendalikan robot yang disambungkan',
        items: [
          'Sahkan pergerakan hanya selepas memeriksa bahawa laluan bebas daripada halangan dan dibenarkan untuk robot.',
          'Dalam kecemasan, gunakan butang henti kecemasan fizikal jika boleh dicapai dengan selamat dan ikuti prosedur di lokasi. Kawalan Hentikan Robot pada papan pemuka boleh menghantar arahan berhenti apabila robot disambungkan.',
          'Jauhkan orang daripada bahagian yang bergerak. Jangan menaiki, menolak atau sengaja menghalang robot.',
        ],
      }],
    },
  },
  {
    id: 'accessibility',
    title: 'Accessibility Statement',
    titleMs: 'Pernyataan Kebolehcapaian',
    en: {
      demo: 'The demo includes keyboard navigation, labelled controls, theme settings, and support for the system’s reduced-motion setting on this page.',
      blocks: [{
        title: 'Accessibility target',
        text: 'WCAG 2.1 Level AA is the target for deployment. Testing should cover keyboard and screen-reader use, text enlargement, contrast, and status labels that are readable without relying on colour. If you encounter a barrier, contact the project team and tell us which page or action was affected.',
        link: ['Web Content Accessibility Guidelines (WCAG) 2.1', wcag],
      }],
    },
    ms: {
      demo: 'Demo menyediakan navigasi papan kekunci, kawalan berlabel dan tetapan tema. Halaman ini mematuhi tetapan pengurangan gerakan pada peranti.',
      blocks: [{
        title: 'Sasaran kebolehcapaian',
        text: 'WCAG 2.1 Tahap AA ialah sasaran pelaksanaan. Ujian perlu meliputi penggunaan papan kekunci dan pembaca skrin, pembesaran teks, kontras dan label status yang boleh dibaca tanpa bergantung pada warna. Jika anda menghadapi masalah, hubungi pasukan projek dan nyatakan halaman atau tindakan yang terjejas.',
        link: ['Garis Panduan Kebolehcapaian Kandungan Web (WCAG) 2.1', wcag],
      }],
    },
  },
  {
    id: 'contact',
    title: 'Contact',
    titleMs: 'Hubungi Kami',
    en: {
      demo: 'For a question about this demo, contact the project team through the course supervisor.',
      blocks: [{
        title: 'Campus privacy and operating questions',
        text: 'The proposed referral point is the system administrator or the Facility Management department at Sunway College. The designated data controller and official privacy address are pending confirmation. When reporting an image concern, provide the approximate time, location, and a brief description. Avoid sending the image itself or identity documents through an unapproved channel.',
      }],
    },
    ms: {
      demo: 'Untuk pertanyaan tentang demo ini, hubungi pasukan projek melalui penyelia kursus.',
      blocks: [{
        title: 'Pertanyaan privasi dan operasi kampus',
        text: 'Saluran rujukan yang dicadangkan ialah pentadbir sistem atau Jabatan Pengurusan Fasiliti di Sunway College. Pengawal data yang ditetapkan dan alamat rasmi untuk pertanyaan privasi masih menunggu pengesahan. Jika anda melaporkan kebimbangan tentang imej, berikan anggaran masa, lokasi dan penerangan ringkas. Elakkan menghantar imej atau dokumen pengenalan melalui saluran yang tidak diluluskan.',
      }],
    },
  },
];
