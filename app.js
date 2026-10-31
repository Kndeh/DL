(function () {
  'use strict';

  var SVGNS = 'http://www.w3.org/2000/svg';

  function $(id) { return document.getElementById(id); }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    var k;
    if (attrs) {
      for (k in attrs) {
        if (k === 'text') n.textContent = attrs[k];
        else if (k === 'class') n.className = attrs[k];
        else n.setAttribute(k, attrs[k]);
      }
    }
    if (kids) kids.forEach(function (c) { n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  function sv(tag, attrs, kids) {
    var n = document.createElementNS(SVGNS, tag);
    var k;
    if (attrs) {
      for (k in attrs) {
        if (k === 'text') n.textContent = attrs[k];
        else if (k === 'class') n.setAttribute('class', attrs[k]);
        else n.setAttribute(k, attrs[k]);
      }
    }
    if (kids) kids.forEach(function (c) { n.appendChild(c); });
    return n;
  }
  function num(n, d) {
    if (typeof n !== 'number' || !isFinite(n)) return String(n);
    return String(Number(n.toFixed(d === undefined ? 3 : d)));
  }
  function on(id, ev, fn) { var n = $(id); if (n) n.addEventListener(ev, fn); }
  function setText(id, s) { var n = $(id); if (n) n.textContent = s; }
  function lines(container, arr) {
    clear(container);
    arr.forEach(function (s) { container.appendChild(el('p', { text: s })); });
  }
  function pathFrom(pts) {
    return pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' ');
  }
  function mse(a, b) {
    var s = 0, i;
    for (i = 0; i < a.length; i++) s += (a[i] - b[i]) * (a[i] - b[i]);
    return s / a.length;
  }

  function frame(svg, o) {
    clear(svg);
    svg.setAttribute('viewBox', '0 0 ' + o.w + ' ' + o.h);
    var pw = o.w - o.l - o.r, ph = o.h - o.t - o.b;
    function sx(v) { return o.l + (v - o.x0) / (o.x1 - o.x0) * pw; }
    function sy(v) { return o.h - o.b - (v - o.y0) / (o.y1 - o.y0) * ph; }
    o.yt.forEach(function (v) {
      svg.appendChild(sv('line', { x1: o.l, x2: o.w - o.r, y1: sy(v), y2: sy(v), 'class': 'grid' }));
      svg.appendChild(sv('text', { x: o.l - 6, y: sy(v) + 4, 'text-anchor': 'end', text: o.yf ? o.yf(v) : String(v) }));
    });
    o.xt.forEach(function (v) {
      svg.appendChild(sv('line', { x1: sx(v), x2: sx(v), y1: o.h - o.b, y2: o.h - o.b + 4, 'class': 'axis' }));
      svg.appendChild(sv('text', { x: sx(v), y: o.h - o.b + 16, 'text-anchor': 'middle', text: String(v) }));
    });
    svg.appendChild(sv('line', { x1: o.l, x2: o.l, y1: o.t, y2: o.h - o.b, 'class': 'axis' }));
    svg.appendChild(sv('line', { x1: o.l, x2: o.w - o.r, y1: o.h - o.b, y2: o.h - o.b, 'class': 'axis' }));
    if (o.xl) svg.appendChild(sv('text', { x: o.l + pw / 2, y: o.h - 4, 'text-anchor': 'middle', text: o.xl }));
    if (o.yl) svg.appendChild(sv('text', { x: o.l, y: o.t - 6, text: o.yl }));
    return { sx: sx, sy: sy };
  }

  /* ---------- data: checklist and quiz ---------- */

  var CHECKLIST = {
    s1: [
      'Bisa jelasin kenapa model linear gagal di XOR (tidak linearly separable)',
      'Hafal rumus perceptron: ŷ = sign(wᵀx + b)',
      'Tahu bentuk boundary: garis (2D), bidang (3D), hyperplane (n-D)',
      'Tahu kenapa perceptron atau sigmoid + threshold tetap boundary lurus',
      'Bisa sebut enam limitasi linear model',
      'Tahu kenapa layer linear yang ditumpuk tanpa activation tetap linear',
      'Bisa jelasin fixed basis function (fitur x², x³) dan keterbatasannya',
      'Bisa bandingin fitur manual vs learned features',
      'Bisa jelasin cara MLP memperbaiki: hidden layer, activation, fitur hierarkis',
      'Bisa sebut isi Universal Approximation Theorem',
      'Hafal tabel kata kunci soal → jawaban',
      'Sudah coba tiga mode di widget XOR',
      'Quiz topik 1 selesai'
    ],
    s2: [
      'Bisa tulis update rule gradient descent, arti η, dan alasan tanda minus',
      'Bisa bedain batch, SGD, mini-batch',
      'Hafal tabel optimizer: SGD, Momentum, RMSProp, Adam (ide, plus, minus, kapan)',
      'Tahu efek LR terlalu tinggi dan terlalu rendah, plus schedule (step, exponential, cosine, reduce on plateau)',
      'Bisa jelasin saturasi, vanishing gradient, dan exploding activations karena init',
      'Tahu Xavier vs He vs uniform dan kapan dipakai',
      'Hafal range activation (sigmoid, tanh, ReLU, Leaky ReLU, softmax, linear)',
      'Bisa jelasin dying ReLU dan solusinya',
      'Bisa sebut tanda overfitting',
      'Bisa jelasin L2, L1, dropout, augmentation, early stopping (subbab Regularization)',
      'Tahu dropout dan augmentation hanya aktif saat training',
      'Bisa bedain train, validation, test',
      'Bisa hitung accuracy, precision, recall, F1, MSE, MAE, R² pakai calculator',
      'Tahu jebakan imbalance 95% dan solusinya',
      'Hafal tabel gejala → diagnosis → tindakan',
      'Bisa tulis jawaban essay: CNN, train loss 0,05, validation loss naik dari epoch 10',
      'Sudah coba widget gradient descent dan optimizer',
      'Quiz topik 2 selesai'
    ],
    s3: [
      'Hafal O = (W − F + 2P) / S + 1 dan versi non-persegi',
      'Bisa jelasin dari mana rumus output muncul (hitung posisi kernel)',
      'Tahu kenapa P = (F − 1)/2 menjaga ukuran saat S = 1',
      'Tahu channel output = jumlah filter K',
      'Bisa hitung parameter conv: (F_h·F_w·C_in + 1)·K dan jelasin kenapa begitu',
      'Tahu kenapa parameter tidak bergantung ukuran gambar (shared weights)',
      'Bisa jelasin receptive field dan kenapa VGG pakai kernel 3×3',
      'Tahu pooling tidak punya parameter belajar',
      'Bisa hitung flatten dan parameter FC',
      'Bisa ulang contoh kisi-kisi (28×28×10 dan 760) tanpa lihat',
      'Sudah coba preset LeNet di kalkulator (total 6582)',
      'Tahu beda feature extraction vs fine-tuning (latar)',
      'Quiz topik 3 selesai'
    ],
    s4: [
      'Bisa jelasin GAN sebagai permainan dua pemain dengan target equilibrium',
      'Bisa tulis L_D dan L_G, dan artinya',
      'Bisa baca tabel kondisi loss (D kecil/G besar, D besar/G kecil, seimbang)',
      'Hafal urutan update: real → noise → fake (detach) → update D → freeze D → update G',
      'Bisa jelasin kenapa fake di G step dikasih label 1',
      'Bisa sebut empat masalah training GAN beserta penyebab dan solusinya',
      'Hafal lima tips training GAN dari slide dan alasannya',
      'Bisa jelasin mode collapse dengan contoh',
      'Tahu FID (makin kecil makin baik), IS (makin tinggi makin baik), visual inspection',
      'Tahu DCGAN, StyleGAN, conditional GAN secara singkat',
      'Bisa tulis kerangka essay training GAN terbaik',
      'Quiz topik 4 selesai'
    ],
    s5: [
      'Bisa jelasin z = Wx + b, a = σ(z) dan komponen MLP',
      'Bisa sebut kegunaan MLP (tabular, klasifikasi, regresi, UAT, MNIST sekitar 97%)',
      'Bisa jelasin keterbatasan MLP untuk gambar dan solusinya (CNN)',
      'Bisa pilih output layer, activation, loss untuk regresi, biner, multiclass',
      'Bisa tulis rumus MSE, MAE, BCE, cross entropy',
      'Tahu kapan MAE lebih cocok dari MSE',
      'Tahu CrossEntropyLoss sudah termasuk softmax',
      'Bisa diagnosis underfitting vs overfitting dari angka train dan validation',
      'Tahu cara tangani class imbalance dan metrik yang cocok',
      'Tahu kenapa scaling fitur penting (tambahan)',
      'Sudah hitung softmax dan cross entropy di widget',
      'Quiz topik 5 selesai'
    ],
    s6: [
      'Bisa gambar encoder, latent, decoder beserta loss-nya',
      'Bisa bedain tipe vs bentuk arsitektur',
      'Bisa jawab: apakah autoencoder harus simetris',
      'Bisa jelasin undercomplete vs overcomplete dan risikonya',
      'Hafal empat tipe: ide, loss, pemakaian',
      'Tahu denoising: input berisik, target bersih',
      'Bisa jelasin z = μ + σ·ε dan loss VAE',
      'Bisa pasangkan kata kunci soal dengan tipe',
      'Hafal kerangka jawaban essay sensor pabrik',
      'Bisa sebut jebakan umum dan solusinya',
      'Bisa hitung parameter autoencoder FC pakai widget',
      'Quiz topik 6 selesai'
    ]
  };

  var QUIZ = {
    s1: [
      { q: 'Kenapa single-layer perceptron gagal di XOR?',
        o: ['Learning rate terlalu kecil', 'XOR tidak linearly separable dan perceptron cuma bisa bikin garis lurus', 'Datanya terlalu banyak', 'Activation-nya ReLU'],
        a: 1, e: 'S01 slide 9 dan S03 slide 21: perceptron hanya menggambar garis lurus, XOR tidak bisa dipisah satu garis.' },
      { q: 'Kamu tumpuk 5 layer Linear tanpa activation. Hasilnya?',
        o: ['Setara satu layer linear', 'Bisa belajar XOR', 'Jadi universal approximator', 'Pasti lebih akurat'],
        a: 0, e: 'Tambahan: W₂(W₁x) = (W₂W₁)x. Nonlinearity dari activation yang bikin depth berguna (S03 slide 22).' },
      { q: 'Model linear dikasih fitur manual x² dan x³. Apa keterbatasan utamanya dibanding learned features?',
        o: ['Loss tidak bisa dihitung', 'Selalu overfit', 'Fitur dirancang manual dan kaku, tergantung keahlian manusia, susah di-scale ke data kompleks', 'Model jadi tidak bisa dilatih'],
        a: 2, e: 'Dari catatan: fixed basis functions bergantung domain knowledge dan gagal generalisasi saat variasi baru muncul. Kombinasi manual juga meledak kalau fiturnya banyak.' },
      { q: 'Universal Approximation Theorem menyatakan apa?',
        o: ['MLP dengan satu hidden layer bisa aproksimasi fungsi kontinu apa pun', 'MLP selalu mencapai akurasi 100%', 'Linear model cukup untuk semua data', 'Butuh minimal 100 layer'],
        a: 0, e: 'S01 slide 12. Di praktik, model yang lebih dalam lebih efisien.' },
      { q: 'Dari widget XOR: berapa skor maksimal satu garis lurus pada XOR?',
        o: ['4 dari 4', '3 dari 4', '2 dari 4', 'Tergantung learning rate'],
        a: 1, e: 'Satu garis bisa benar di 3 titik, tidak pernah 4. Itu bukti visual bahwa XOR tidak linearly separable.' }
    ],
    s2: [
      { q: 'Training loss terus turun, validation loss mulai naik. Apa yang terjadi dan apa solusinya?',
        o: ['Underfitting, tambah epoch', 'Overfitting, pakai early stopping atau regularisasi', 'LR terlalu kecil', 'Normal, lanjut saja'],
        a: 1, e: 'S02 slide 20 dan 25: validation loss naik adalah tanda overfit. Stop saat val loss naik, atau tambah L2 dan dropout.' },
      { q: 'Loss meledak (diverge) di awal training. Tersangka pertama?',
        o: ['Dropout terlalu kecil', 'Batch terlalu kecil', 'Metrik salah', 'Learning rate terlalu tinggi'],
        a: 3, e: 'S02 slide 12: LR terlalu tinggi bikin loss diverge. Coba di widget optimizer.' },
      { q: 'Initialization yang cocok untuk jaringan ReLU?',
        o: ['Xavier', 'He', 'Semua nol', 'L2'],
        a: 1, e: 'S02 slide 17: He untuk ReLU, Xavier untuk sigmoid/tanh.' },
      { q: 'Dropout dan data augmentation dipakai kapan?',
        o: ['Hanya saat training', 'Hanya saat test', 'Training dan test', 'Hanya epoch pertama'],
        a: 0, e: 'S02 slide 22 dan 23: augmentation hanya di fase training. Dropout aktif saat training, semua neuron aktif saat evaluasi (catatan).' },
      { q: 'Dataset 99 negatif dan 1 positif. Model prediksi semua negatif, accuracy 99%. Kesimpulan?',
        o: ['Model sangat bagus', 'Pasti overfit', 'Belum tentu bagus, cek recall dan F1', 'Tambah dropout'],
        a: 2, e: 'S02 slide 27 dan S03 slide 24: metrik harus tahan class imbalance. Accuracy bisa menipu.' },
      { q: 'Menurut slide, optimizer mana yang jadi default terbaik untuk kebanyakan tugas?',
        o: ['SGD', 'RMSProp', 'Momentum', 'Adam'],
        a: 3, e: 'S02 slide 11. SGD kalau mau kontrol lebih, RMSProp sering untuk RNN, Momentum bagus untuk problem convex.' },
      { q: 'λ pada L2 dibuat sangat besar. Risikonya?',
        o: ['Underfitting', 'Vanishing gradient', 'Mode collapse', 'Dying ReLU'],
        a: 0, e: 'Catatan: λ terlalu besar bikin bobot ditekan terlalu kuat, model jadi terlalu sederhana.' }
    ],
    s3: [
      { q: 'Input 28×28×1, 6 filter 5×5, S = 1, P = 0. Output dan parameter?',
        o: ['24×24×6 dan 156 parameter', '28×28×6 dan 150 parameter', '24×24×6 dan 150 parameter', '23×23×6 dan 156 parameter'],
        a: 0, e: 'O = (28 − 5)/1 + 1 = 24. Parameter = (5×5×1 + 1) × 6 = 156. Opsi 150 lupa bias.' },
      { q: 'Input 32×32×3, F = 3, S = 1, P = 1, K = 16. Output?',
        o: ['30×30×16', '32×32×16', '32×32×3', '34×34×16'],
        a: 1, e: 'O = (32 − 3 + 2)/1 + 1 = 32. Channel = K = 16. Ini same padding.' },
      { q: 'Max pooling 2×2 stride 2 pada 28×28×6. Output dan parameter?',
        o: ['14×14×6 dan 0 parameter', '14×14×1 dan 0 parameter', '14×14×6 dan 24 parameter', '28×28×6 dan 0 parameter'],
        a: 0, e: 'O = (28 − 2)/2 + 1 = 14. Channel tidak berubah. Pooling tidak punya parameter belajar.' },
      { q: 'Conv 3×3, input 16 channel, 32 filter. Jumlah parameter?',
        o: ['4608', '4640', '288', '4672'],
        a: 1, e: '(3×3×16 + 1) × 32 = 145 × 32 = 4640. Opsi 4608 lupa bias.' },
      { q: 'Input 224×224, F = 3, S = 2, P = 1. Ukuran spatial output?',
        o: ['111', '113', '112', '224'],
        a: 2, e: '(224 − 3 + 2)/2 + 1 = 111,5 + 1. Dibulatkan ke bawah jadi 111, lalu + 1 = 112 (aturan floor itu tambahan).' },
      { q: 'Conv layer yang sama dipakai untuk input 32×32 lalu 64×64. Jumlah parameter conv-nya?',
        o: ['Jadi 2 kali lipat', 'Jadi 4 kali lipat', 'Berkurang', 'Tidak berubah'],
        a: 3, e: 'Parameter hanya bergantung pada F, C_in, dan K (shared weights). Yang berubah ukuran output.' },
      { q: 'Efek stride yang lebih besar?',
        o: ['Output lebih besar', 'Output lebih kecil', 'Parameter bertambah', 'Padding otomatis'],
        a: 1, e: 'S04 slide 18: higher stride = smaller output.' }
    ],
    s4: [
      { q: 'Saat melatih D, label apa yang dipakai untuk real dan fake?',
        o: ['Real 0, fake 1', 'Real 1, fake 1', 'Real 1, fake 0', 'Real 0, fake 0'],
        a: 2, e: 'S07 slide 11: loss_fn(D(real), 1) + loss_fn(D(fake.detach()), 0).' },
      { q: 'Saat melatih G, label apa untuk fake?',
        o: ['1, karena G mau D bilang real', '0, karena sampelnya palsu', 'Tidak pakai label', '0,5'],
        a: 0, e: 'S07 slide 11: loss_G = loss_fn(D(fake), 1).' },
      { q: 'Apa itu mode collapse?',
        o: ['D berhenti belajar', 'Loss jadi NaN', 'G hanya menghasilkan variasi sampel yang terbatas', 'Dataset terlalu kecil'],
        a: 2, e: 'S07 slide 12. Coba geser slider di widget mode collapse.' },
      { q: 'Mana yang BUKAN saran slide untuk training GAN?',
        o: ['LeakyReLU', 'Label smoothing', 'Pantau FID atau IS', 'Pakai sigmoid di layer terakhir D'],
        a: 3, e: 'S07 slide 13: hindari sigmoid di layer terakhir D, pakai BCEWithLogits.' },
      { q: 'D menjadi terlalu kuat. Masalah apa yang disebut slide?',
        o: ['Mode collapse', 'Vanishing gradients', 'Overfitting', 'Dying ReLU'],
        a: 1, e: 'S07 slide 12: vanishing gradients, D too strong.' },
      { q: 'Kenapa evaluasi GAN dianggap sulit?',
        o: ['Tidak ada likelihood, jadi dipakai FID, IS, dan visual inspection', 'Karena tidak punya loss', 'Karena data tanpa label', 'Karena G terlalu kecil'],
        a: 0, e: 'S07 slide 12 dan 18.' },
      { q: 'Di widget: D(G(z)) = 0,95. Artinya?',
        o: ['D yakin sampel itu fake', 'D hampir ketipu, L_G kecil', 'G gagal total', 'D belum dilatih'],
        a: 1, e: 'D(G(z)) tinggi berarti D bilang fake itu real. L_G = −log D(G(z)) kecil.' }
    ],
    s5: [
      { q: 'Prediksi harga rumah. Output layer dan loss yang cocok?',
        o: ['Linear(hidden, 1) tanpa activation, MSE atau MAE', 'Linear(hidden, 1) + Sigmoid, BCE', 'Linear(hidden, 2) + Softmax, CrossEntropy', 'ReLU saja tanpa linear'],
        a: 0, e: 'S03 slide 10: regresi, 1 neuron, tanpa activation, MSELoss atau L1Loss.' },
      { q: 'Klasifikasi 5 kelas di PyTorch. Apa yang benar?',
        o: ['Tambah Softmax lalu pakai CrossEntropyLoss', 'Output logit mentah ke CrossEntropyLoss', 'Pakai MSELoss', 'Pakai satu neuron output'],
        a: 1, e: 'S03 slide 12: CrossEntropyLoss sudah mencakup log-softmax + NLL. Softmax tambahan bikin double softmax.' },
      { q: 'Data punya banyak outlier dan kamu tidak mau loss terlalu terpengaruh. Pilih?',
        o: ['MSE', 'BCE', 'MAE', 'Cross entropy'],
        a: 2, e: 'Catatan: MAE lebih tahan outlier. MSE menghukum error besar lebih berat.' },
      { q: 'Train accuracy 99%, validation accuracy 70%. Diagnosis?',
        o: ['Underfitting', 'Overfitting', 'Class imbalance pasti', 'Model sudah ideal'],
        a: 1, e: 'Gap besar antara train dan validation adalah gejala overfitting. Solusi: L2, dropout, augmentation, early stopping.' },
      { q: 'Train accuracy 60%, validation accuracy 58%. Diagnosis?',
        o: ['Overfitting', 'Data bocor', 'Underfitting', 'Imbalance'],
        a: 2, e: 'Tambahan: kedua error sama-sama tinggi dan gap kecil, model terlalu sederhana atau kurang dilatih.' },
      { q: 'Data 95% kelas A dan 5% kelas B. Langkah yang tepat?',
        o: ['Cukup lihat accuracy', 'Hapus kelas B', 'Pakai class weights atau sampling, evaluasi dengan F1, precision, recall', 'Naikkan learning rate'],
        a: 2, e: 'S03 slide 24: class weights atau sampling, pilih metrik hati-hati.' },
      { q: 'Fitur umur (0 sampai 100) dan gaji (jutaan) dipakai bersama tanpa diubah. Masalahnya?',
        o: ['Skala beda bisa bikin training lambat atau tidak stabil, perlu normalisasi', 'Tidak ada masalah', 'Harus pakai MAE', 'Harus pakai dropout'],
        a: 0, e: 'Tambahan: scaling fitur praktik standar. Hitung statistiknya dari data train saja.' }
    ],
    s6: [
      { q: 'Pabrik mau deteksi sensor rusak tanpa data berlabel. Tipe dan cara deteksinya?',
        o: ['VAE, lihat KL divergence saja', 'Vanilla (atau denoising kalau berisik), latih di data normal, anomali = reconstruction error di atas threshold', 'Sparse, hapus neuron aktif', 'Bukan autoencoder karena tanpa label'],
        a: 1, e: 'Catatan kerangka essay: unsupervised, latih hanya data normal, threshold reconstruction error.' },
      { q: 'Gambar scan berbintik, mau dibersihkan. Tipe paling cocok?',
        o: ['Vanilla', 'Sparse', 'VAE', 'Denoising'],
        a: 3, e: 'Denoising: input diberi noise, target tetap bersih (S06 slide 15).' },
      { q: 'Mau generate sampel baru dan interpolasi halus antar kelas. Tipe?',
        o: ['VAE', 'Denoising', 'Sparse', 'Vanilla'],
        a: 0, e: 'S06 slide 21: latent berupa distribusi, kontinu, bisa di-sample.' },
      { q: 'Latent lebih besar dari input, mau cegah copy dan dapat fitur interpretable. Tipe?',
        o: ['Vanilla', 'Sparse', 'VAE', 'PCA'],
        a: 1, e: 'Sparse: penalti L1 pada latent (L_total = L_recon + λ|z|₁), boleh overcomplete.' },
      { q: 'Apakah autoencoder harus simetris?',
        o: ['Harus, kalau tidak error', 'Tidak harus, tapi output decoder wajib sama dimensi dengan input', 'Hanya encoder yang harus simetris', 'Simetris hanya untuk VAE'],
        a: 1, e: 'Catatan: simetri adalah kebiasaan ("typically" di slide). Dimensi output decoder wajib sama dengan input.' },
      { q: 'Mana yang menggambarkan BENTUK ARSITEKTUR, bukan tipe?',
        o: ['Denoising', 'Sparse', 'Undercomplete', 'VAE'],
        a: 2, e: 'Undercomplete dan overcomplete menggambarkan ukuran latent vs input. Denoising, sparse, VAE adalah tipe.' },
      { q: 'Output autoencoder untuk piksel di rentang [0, 1]. Yang tepat?',
        o: ['ReLU di output', 'Tanpa activation', 'Sigmoid di output', 'Softmax di output'],
        a: 2, e: 'S06 slide 31: lupa clamp output. Pakai Sigmoid untuk piksel [0, 1]. Loss bisa BCE atau MSE (catatan).' },
      { q: 'Latent dibuat terlalu besar pada vanilla AE. Akibatnya?',
        o: ['Cuma menyalin input tanpa belajar apa-apa', 'Loss pasti NaN', 'Jadi generative', 'Jadi supervised'],
        a: 0, e: 'S06 slide 31: latent space too large, model hanya copy input. Solusi: latent lebih kecil, sparse, atau denoising.' }
    ]
  };

  /* ---------- extra quiz items (Notion merge and deeper explanations) ---------- */

  var QUIZ_EXTRA = {
    s1: [
      { q: 'Perceptron memakai sigmoid lalu threshold 0,5. Bentuk decision boundary-nya?',
        o: ['Tetap lurus, karena σ(z) ≥ 0,5 sama dengan z ≥ 0', 'Melengkung seperti huruf S', 'Berbentuk lingkaran', 'Tergantung learning rate'],
        a: 0, e: 'Notion: threshold tetap atas z yang linear. Tambahan: σ(0) = 0,5 dan σ naik terus, jadi batas σ(z) = 0,5 persis batas wᵀx + b = 0.' },
      { q: 'Model linear dengan 3 fitur. Bentuk decision boundary-nya?',
        o: ['Garis lurus', 'Bidang datar', 'Permukaan melengkung', 'Titik'],
        a: 1, e: 'Notion: 2D garis lurus, 3D bidang datar, n-D hyperplane.' },
      { q: 'Soal: "regresi linear untuk data berbentuk kurva". Diagnosis dan solusi?',
        o: ['Overfitting, tambah dropout', 'Underfitting, pakai fitur non-linear atau MLP', 'Learning rate terlalu tinggi', 'Data bocor'],
        a: 1, e: 'Notion: model linear terlalu sederhana untuk datanya, error di training pun sudah tinggi (underfit). Solusi: fitur non-linear atau MLP.' },
      { q: 'Layer 1: W₁ = [[1, 2], [0, 1]]. Layer 2: W₂ = [2, 1]. Keduanya tanpa activation. Input x = (3, 1). Output?',
        o: ['11', '10', '13', '21'],
        a: 0, e: 'W₁x = (5, 1), lalu W₂(W₁x) = 2·5 + 1·1 = 11. Sama dengan (W₂W₁)x = [2, 5]·(3, 1) = 11. Dua layer linear = satu layer linear.' },
      { q: 'XOR dengan MLP: h₁ = OR(x₁, x₂), h₂ = AND(x₁, x₂), y = step(h₁ − h₂ − 0,5). Untuk input (1, 1), outputnya?',
        o: ['1', '0', '0,5', 'Tidak terdefinisi'],
        a: 1, e: 'h₁ = 1, h₂ = 1, z = 1 − 1 − 0,5 = −0,5, jadi y = 0. XOR(1, 1) memang 0.' },
      { q: 'Kenapa hidden layer tanpa activation tidak menolong memisahkan XOR?',
        o: ['Karena jumlah neuron kurang', 'Karena komposisi fungsi linear tetap linear', 'Karena XOR butuh label', 'Karena bias tidak dipakai'],
        a: 1, e: 'Notion: tumpukan linear tetap linear. Activation non-linear yang mematahkan sifat itu.' }
    ],
    s2: [
      { q: 'L(θ) = θ², gradien 2θ. Mulai θ = 3, η = 0,1. Nilai θ setelah satu update gradient descent?',
        o: ['2,4', '2,7', '3,6', '0,3'],
        a: 0, e: 'Gradien = 2·3 = 6. θ = 3 − 0,1·6 = 2,4. Opsi 3,6 adalah hasil kalau tandanya salah (plus).' },
      { q: 'Kenapa update rule memakai tanda minus (θ ← θ − η ∇θ L)?',
        o: ['Supaya bobot selalu negatif', 'Gradien menunjuk arah loss naik, jadi kita bergerak berlawanan', 'Supaya learning rate positif', 'Hanya konvensi tanpa alasan'],
        a: 1, e: 'Notion: gradien menunjuk arah naik, update dengan minus agar bergerak ke arah turun.' },
      { q: 'Dengan sigmoid, bobot awal sangat besar. Gradien di layer awal hampir nol. Diagnosis?',
        o: ['Dying ReLU', 'Saturasi dan vanishing gradient', 'Overfitting', 'Class imbalance'],
        a: 1, e: 'Notion: bobot besar melempar input ke ujung datar sigmoid (saturasi), turunannya hampir nol, layer awal berhenti belajar. Solusi: init He atau Xavier, ReLU atau variannya.' },
      { q: 'Leaky ReLU dengan pengali 0,01. Input −10 menghasilkan?',
        o: ['0', '−0,1', '−10', '0,1'],
        a: 1, e: 'Notion: −10 × 0,01 = −0,1. ReLU biasa akan memberi 0 dan gradiennya 0 (dying ReLU).' },
      { q: 'Bobot w = (3, −4), λ = 0,01. Penalti L2 (λΣw²) yang ditambahkan ke loss?',
        o: ['0,07', '0,25', '0,01', '2,5'],
        a: 1, e: 'Σw² = 9 + 16 = 25. Penalti = 0,01 × 25 = 0,25. Opsi 0,07 adalah penalti L1 (λΣ|w| = 0,01 × 7).' },
      { q: 'TP = 40, FP = 10, FN = 20, TN = 930. Recall?',
        o: ['0,8', '0,6667', '0,97', '0,7273'],
        a: 1, e: 'Recall = TP / (TP + FN) = 40 / 60 = 0,6667. 0,8 adalah precision, 0,97 accuracy, 0,7273 F1.' },
      { q: 'Error prediksi regresi: 1, 1, 1, 10. MSE dan MAE?',
        o: ['MSE 25,75 dan MAE 3,25', 'MSE 3,25 dan MAE 25,75', 'MSE 13 dan MAE 13', 'MSE 103 dan MAE 3'],
        a: 0, e: 'MSE = (1 + 1 + 1 + 100) / 4 = 25,75. MAE = 13 / 4 = 3,25. Outlier mendominasi MSE, makanya MAE lebih tahan outlier.' },
      { q: 'Apa itu "reduce on plateau" pada learning rate schedule?',
        o: ['LR dinaikkan tiap epoch', 'LR diturunkan ketika loss sudah tidak membaik', 'LR diacak', 'LR diturunkan mengikuti kurva cosinus'],
        a: 1, e: 'Notion: reduce on plateau = turun ketika loss sudah tidak membaik. Cosine annealing adalah yang mengikuti kurva cosinus.' },
      { q: 'Inverted dropout p = 0,5. Aktivasi [1, 2, 3, 4], mask [1, 0, 1, 0]. Hasil saat training?',
        o: ['[1, 0, 3, 0]', '[2, 0, 6, 0]', '[0,5, 0, 1,5, 0]', '[1, 2, 3, 4]'],
        a: 1, e: 'Tambahan: nilai yang dipertahankan dikali 1/(1 − p) = 2, jadi [2, 0, 6, 0]. Saat evaluasi semua neuron aktif tanpa penyesuaian.' },
      { q: 'Sebagian neuron ReLU tidak pernah update lagi. Diagnosis dan tindakan?',
        o: ['Underfitting, perbesar model', 'Dying ReLU, pakai Leaky ReLU atau PReLU dan kecilkan learning rate', 'Mode collapse', 'Class imbalance, pakai F1'],
        a: 1, e: 'Notion: dying ReLU. Pemicu umum learning rate terlalu besar. Neuron mati tidak bisa pulih sendiri.' },
      { q: 'Training loss turun sampai 0,05, validation loss naik sejak epoch 10. Mana jawaban terbaik?',
        o: ['Naikkan learning rate', 'Overfitting: early stopping sekitar epoch 10 dengan checkpoint terbaik, augmentation, dropout atau L2', 'Underfitting: tambah layer', 'Hapus validation set'],
        a: 1, e: 'Kerangka essay Notion: diagnosis overfitting, penyebab model terlalu kompleks atau data sedikit, solusi early stopping, augmentation hanya di training, dropout 0,2 sampai 0,5 atau L2, evaluasi dengan validation dan test.' }
    ],
    s3: [
      { q: 'Conv dengan F = 7, S = 1. Padding P supaya ukuran spatial output sama dengan input?',
        o: ['2', '3', '4', '7'],
        a: 1, e: 'W − F + 2P + 1 = W → 2P = F − 1 = 6 → P = 3. (tambahan: P = (F − 1)/2)' },
      { q: 'Tiga conv 3×3, stride 1, ditumpuk. Receptive field satu neuron di layer ketiga?',
        o: ['3×3', '5×5', '7×7', '9×9'],
        a: 2, e: 'RF = 1 + n(F − 1) = 1 + 3·2 = 7. Itu sebabnya VGG memakai conv 3×3 bertumpuk.' },
      { q: 'Layer FC setelah flatten 400 ke 10 neuron. Jumlah parameter?',
        o: ['4000', '4010', '410', '400'],
        a: 1, e: 'in × out + out = 400 × 10 + 10 = 4010. Opsi 4000 lupa bias.' },
      { q: 'Input 28 (tinggi) × 40 (lebar) × 1, conv 3×3, K = 4, S = 1, P = 0. Output?',
        o: ['26 × 38 × 4', '38 × 26 × 4', '26 × 26 × 4', '28 × 40 × 4'],
        a: 0, e: 'O_h = (28 − 3)/1 + 1 = 26, O_w = (40 − 3)/1 + 1 = 38. Hitung tinggi dan lebar terpisah.' },
      { q: 'Gaya LeNet: 32×32×1 → conv 5×5 K = 6 → pool 2×2 S = 2 → conv 5×5 K = 16. Ukuran output conv kedua?',
        o: ['14 × 14 × 16', '10 × 10 × 16', '12 × 12 × 16', '5 × 5 × 16'],
        a: 1, e: 'Setelah conv pertama 28×28×6, pool jadi 14×14×6. Conv kedua: (14 − 5)/1 + 1 = 10, channel = 16 → 10 × 10 × 16.' },
      { q: 'Kenapa conv jauh lebih hemat parameter daripada FC untuk gambar?',
        o: ['Karena tidak ada bias', 'Karena kernel yang sama dipakai ulang di semua posisi (shared weights)', 'Karena pakai ReLU', 'Karena stride selalu 1'],
        a: 1, e: 'S04 slide 7 dan tambahan: contoh 32×32×3 → 28×28×10 butuh 760 parameter dengan conv, sekitar 24 juta dengan FC.' }
    ],
    s4: [
      { q: 'D(x) = 0,9 dan D(G(z)) = 0,3. Berapa L_G = −ln D(G(z))?',
        o: ['1,204', '0,357', '0,105', '0,462'],
        a: 0, e: '−ln 0,3 = 1,204. 0,357 adalah bagian fake dari L_D (−ln 0,7), 0,105 adalah −ln 0,9, 0,462 adalah L_D total.' },
      { q: 'Loss D tinggi dan loss G kecil. Apa artinya?',
        o: ['Kondisi ideal', 'G mendominasi, D lemah dan sering tertipu. Tanda bahaya', 'D terlalu kuat', 'Training selesai'],
        a: 1, e: 'Notion: G sukses besar menipu D, risiko mode collapse atau kegagalan GAN. Kebalikannya (D kecil, G tinggi) berarti D terlalu kuat.' },
      { q: 'Urutan update yang benar dalam satu iterasi?',
        o: ['Update G, lalu update D', 'Real batch, noise, fake (detach), update D saja, freeze D, update G saja', 'Update D dan G bersamaan dengan satu loss', 'Noise saja, tanpa data real'],
        a: 1, e: 'Notion dan S07 slide 11: D dulu dengan real dan fake yang di-detach, lalu G dengan D di-freeze.' },
      { q: 'Metrik evaluasi GAN mana yang makin KECIL makin baik?',
        o: ['IS', 'FID', 'Accuracy D', 'Keduanya'],
        a: 1, e: 'FID makin kecil makin baik (jarak distribusi). IS makin tinggi makin baik.' },
      { q: 'Kenapa saat update G, fake dikasih label 1?',
        o: ['Karena fake sebenarnya real', 'Karena G ingin D menilai fake sebagai real', 'Karena D di-freeze', 'Supaya loss nol'],
        a: 1, e: 'S07 slide 11: loss_G = loss_fn(D(fake), 1). Bentuk non-saturating juga memberi gradien kuat saat D(G(z)) kecil.' },
      { q: 'D(x) = D(G(z)) = 0,5. Berapa L_D?',
        o: ['0,693', '1,386', '0', '2,303'],
        a: 1, e: '−ln 0,5 − ln(1 − 0,5) = 0,693 + 0,693 = 1,386 (2 ln 2). Itu titik equilibrium teoretis (tambahan).' },
      { q: 'Kamu ingin mengontrol kelas output (misal "kucing" atau "anjing"). Pakai apa?',
        o: ['DCGAN', 'StyleGAN', 'Conditional GAN', 'Mini-batch discrimination'],
        a: 2, e: 'S07 slide 17 dan Notion: conditional GAN, label diberikan ke G dan D. StyleGAN untuk mengontrol gaya.' },
      { q: 'Solusi mode collapse menurut Notion?',
        o: ['Perbesar learning rate', 'Mini-batch discrimination atau WGAN', 'Hapus batch normalization', 'Pakai ReLU'],
        a: 1, e: 'Notion: mini-batch discrimination (D diberi informasi keragaman batch) dan WGAN.' }
    ],
    s5: [
      { q: 'Logit akhir 0,3 pada klasifikasi biner dengan sigmoid. Probabilitas ŷ ≈?',
        o: ['0,5744', '0,3', '0,7408', '0,6'],
        a: 0, e: 'σ(0,3) = 1 / (1 + e^(−0,3)) = 1 / 1,7408 = 0,5744. Threshold 0,5 → kelas 1.' },
      { q: 'MLP 2 → 2 → 1 (dengan bias). Jumlah parameter?',
        o: ['6', '9', '7', '12'],
        a: 1, e: '(2·2 + 2) + (2·1 + 1) = 6 + 3 = 9.' },
      { q: 'MLP MNIST 784 → 128 → 10 (dengan bias). Jumlah parameter?',
        o: ['101.770', '100.480', '102.400', '784.128'],
        a: 0, e: '784·128 + 128 = 100.480, ditambah 128·10 + 10 = 1.290, total 101.770.' },
      { q: 'BCE untuk y = 1 dan ŷ = 0,1. Loss ≈?',
        o: ['0,105', '2,303', '0,9', '0'],
        a: 1, e: '−ln 0,1 = 2,3026. Yakin tapi salah, loss besar. Kalau ŷ = 0,9, loss = 0,105.' },
      { q: 'Logit (2,0; 1,0; 0,1), kelas benar = kelas 1. Cross entropy ≈?',
        o: ['0,417', '0,659', '1,417', '0,242'],
        a: 0, e: 'Softmax p₁ = 7,389 / 11,2125 = 0,659. CE = −ln 0,659 = 0,417.' },
      { q: 'Apa keterbatasan MLP untuk gambar?',
        o: ['Tidak bisa dilatih', 'Tidak memahami struktur spasial, parameter membengkak, rentan overfit', 'Tidak punya activation', 'Hanya bisa regresi'],
        a: 1, e: 'Notion dan S04 slide 6. Solusinya CNN.' },
      { q: 'Spam 2% dari 1000 email. Model selalu menjawab "bukan spam". Accuracy dan recall spam?',
        o: ['98% dan 0', '98% dan 98%', '2% dan 0', '100% dan 100%'],
        a: 0, e: 'Accuracy = 980 / 1000 = 0,98. Recall = 0 / 20 = 0. Accuracy menipu di data imbalance.' },
      { q: 'Akurasi MLP pada MNIST menurut slide (S01 slide 25) kira-kira?',
        o: ['50%', '97%', '100%', '75%'],
        a: 1, e: 'S01 slide 25 dan Notion: MLP sekitar 97% akurasi pada MNIST.' }
    ],
    s6: [
      { q: 'x = (0,2; 0,8; 0,5), rekonstruksi x̂ = (0,3; 0,6; 0,5). MSE?',
        o: ['0,0167', '0,05', '0,15', '0,1667'],
        a: 0, e: 'Selisih kuadrat 0,01 + 0,04 + 0 = 0,05, dibagi n = 3 → 0,0167. Opsi 0,05 lupa dibagi n.' },
      { q: 'Pada denoising autoencoder, loss dibandingkan dengan apa?',
        o: ['Input berisik', 'Input bersih', 'Label kelas', 'Noise-nya saja'],
        a: 1, e: 'S06 slide 15 dan 16: loss = mse_loss(output, x), x adalah input bersih. Input ke model: x + noise.' },
      { q: 'Di kode VAE, logvar = ln 0,04. std = exp(0,5 · logvar) bernilai?',
        o: ['0,2', '0,04', '0,02', '0,4'],
        a: 0, e: 'exp(0,5 · ln 0,04) = √0,04 = 0,2. Encoder mengeluarkan log-variance, std dihitung dari situ.' },
      { q: 'Sparse AE: z = (0; 0,5; 0; −0,3; 0), λ = 0,1. Penalti λ|z|₁?',
        o: ['0,08', '0,02', '0,8', '0,034'],
        a: 0, e: '|z|₁ = 0,5 + 0,3 = 0,8, dikali λ 0,1 = 0,08.' },
      { q: 'Parameter autoencoder FC 784 → 128 → 32 → 128 → 784 (dengan bias)?',
        o: ['209.968', '419.120', '100.480', '200.000'],
        a: 0, e: '100.480 + 4.128 + 4.224 + 101.136 = 209.968. Angka 419.120 untuk versi 256 hidden.' },
      { q: 'z = μ + σ·ε dengan μ = 0,5, σ = 0,2, ε = −1. Nilai z?',
        o: ['0,3', '0,7', '0,5', '−0,1'],
        a: 0, e: 'z = 0,5 + 0,2 × (−1) = 0,3.' },
      { q: 'Mean error normal 0,016, std 0,004. Threshold anomali mean + 3·std (tambahan)?',
        o: ['0,028', '0,02', '0,012', '0,048'],
        a: 0, e: '0,016 + 3 × 0,004 = 0,028. Error di atas threshold dianggap anomali.' }
    ]
  };
  /* rotate the options of extra items so the right answer is not always in the same slot */
  Object.keys(QUIZ_EXTRA).forEach(function (k) {
    QUIZ_EXTRA[k].forEach(function (it, i) {
      var r = (i * 3 + k.charCodeAt(1)) % it.o.length;
      it.o = it.o.map(function (_, j) { return it.o[(j + r) % it.o.length]; });
      it.a = (it.a - r + it.o.length) % it.o.length;
    });
    QUIZ[k] = QUIZ[k].concat(QUIZ_EXTRA[k]);
  });

  /* ---------- progress and checklist ---------- */

  var KEY = 'uts-dl-materi-checked-v2';
  var state = {};

  function loadState() {
    try {
      var raw = localStorage.getItem(KEY);
      var o = raw ? JSON.parse(raw) : {};
      return (o && typeof o === 'object' && !Array.isArray(o)) ? o : {};
    } catch (e) { return {}; }
  }
  function saveState() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage blocked */ }
  }

  function updateProgress() {
    var total = 0, done = 0, sec, items;
    for (sec in CHECKLIST) {
      items = CHECKLIST[sec];
      var d = 0, i;
      for (i = 0; i < items.length; i++) if (state['cl-' + sec + '-' + i]) d++;
      total += items.length;
      done += d;
      var c = document.querySelector('[data-count="' + sec + '"]');
      if (c) c.textContent = d + '/' + items.length;
      var cc = document.querySelector('[data-clcount="' + sec + '"]');
      if (cc) cc.textContent = d + ' dari ' + items.length + ' sudah dicentang.';
    }
    var pct = total ? Math.round(done / total * 100) : 0;
    $('bar-fill').style.width = pct + '%';
    $('bar').setAttribute('aria-valuenow', String(pct));
    $('progress-text').textContent = done + ' / ' + total + ' (' + pct + '%)';
  }

  function initChecklists() {
    state = loadState();
    var sec;
    for (sec in CHECKLIST) {
      var ul = document.querySelector('[data-checklist="' + sec + '"]');
      if (!ul) continue;
      CHECKLIST[sec].forEach(function (text, i) {
        var id = 'cl-' + this + '-' + i;
        var cb = el('input', { type: 'checkbox', id: id });
        cb.checked = state[id] === true;
        cb.addEventListener('change', function () {
          if (cb.checked) state[id] = true; else delete state[id];
          saveState();
          updateProgress();
        });
        ul.appendChild(el('li', null, [cb, el('label', { 'for': id, text: text })]));
      }, sec);
    }
    on('reset-progress', 'click', function () {
      if (window.confirm('Reset semua centang checklist?')) {
        state = {};
        saveState();
        document.querySelectorAll('ul.checklist input').forEach(function (cb) { cb.checked = false; });
        updateProgress();
      }
    });
    updateProgress();
  }

  function initNav() {
    var nav = $('nav');
    var secs = document.querySelectorAll('section.topic');
    var links = [];
    secs.forEach(function (s) {
      var a = el('a', { href: '#' + s.id }, [s.getAttribute('data-title') || s.id]);
      if (CHECKLIST[s.id]) a.appendChild(el('span', { 'class': 'count', 'data-count': s.id, text: '0/0' }));
      nav.appendChild(a);
      links.push({ a: a, id: s.id, node: s });
    });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            links.forEach(function (l) { l.a.classList.toggle('active', l.id === en.target.id); });
          }
        });
      }, { rootMargin: '-30% 0px -60% 0px' });
      links.forEach(function (l) { io.observe(l.node); });
    }
  }

  /* ---------- quiz ---------- */

  function renderQuiz(box) {
    var items = QUIZ[box.getAttribute('data-quiz')] || [];
    var answered = 0, correct = 0;
    clear(box);
    var score = el('p', { 'class': 'quiz-score', 'aria-live': 'polite' });
    function updateScore() {
      score.textContent = 'Skor: ' + correct + ' benar dari ' + answered + ' dijawab (total ' + items.length + ' soal).';
    }
    items.forEach(function (it, qi) {
      var fb = el('p', { 'class': 'quiz-fb', 'aria-live': 'polite' });
      var opts = el('div', { 'class': 'quiz-opts' });
      var btns = [];
      it.o.forEach(function (label, oi) {
        var b = el('button', { type: 'button', text: String.fromCharCode(65 + oi) + '. ' + label });
        b.addEventListener('click', function () {
          btns.forEach(function (x, xi) {
            x.disabled = true;
            if (xi === it.a) x.classList.add('right');
          });
          answered++;
          fb.textContent = '';
          if (oi === it.a) {
            correct++;
            fb.appendChild(el('strong', { text: 'Bener. ' }));
          } else {
            b.classList.add('wrong');
            fb.appendChild(el('strong', { text: 'Belum tepat. Jawaban: ' + String.fromCharCode(65 + it.a) + '. ' }));
          }
          fb.appendChild(document.createTextNode(it.e));
          updateScore();
        });
        btns.push(b);
        opts.appendChild(b);
      });
      box.appendChild(el('div', { 'class': 'quiz-q' }, [el('p', { 'class': 'q', text: (qi + 1) + '. ' + it.q }), opts, fb]));
    });
    var again = el('button', { type: 'button', 'class': 'ghost', text: 'Ulangi quiz' });
    again.addEventListener('click', function () { renderQuiz(box); });
    updateScore();
    box.appendChild(score);
    box.appendChild(again);
  }

  function initQuiz() {
    document.querySelectorAll('[data-quiz]').forEach(renderQuiz);
  }

  /* ---------- 1. XOR ---------- */

  function initXor() {
    var svg = $('xor-plot');
    if (!svg) return;
    var GATES = { and: [0, 0, 0, 1], or: [0, 1, 1, 1], xor: [0, 1, 1, 0] };
    var PTS = [[0, 0], [0, 1], [1, 0], [1, 1]];
    var CELLS = 30, SZ = 10;
    var cells = [];
    var ptLayer;
    var ids = ['w1', 'w2', 'b', 'w3'];

    function X(x) { return 10 + (x + 0.5) / 2 * 300; }
    function Y(y) { return 310 - (y + 0.5) / 2 * 300; }
    function val(k) { return parseFloat($('xor-' + k).value); }

    function predict(mode, x1, x2, w) {
      if (mode === 'mlp') {
        var h1 = (x1 + x2 - 0.5) >= 0 ? 1 : 0;
        var h2 = (x1 + x2 - 1.5) >= 0 ? 1 : 0;
        return { y: (h1 - h2 - 0.5) >= 0 ? 1 : 0, h1: h1, h2: h2 };
      }
      var s = w.w1 * x1 + w.w2 * x2 + w.b + (mode === 'feat' ? w.w3 * x1 * x2 : 0);
      return { y: s >= 0 ? 1 : 0 };
    }
    function weights() { return { w1: val('w1'), w2: val('w2'), b: val('b'), w3: val('w3') }; }

    function build() {
      clear(svg);
      var i, j;
      for (j = 0; j < CELLS; j++) {
        for (i = 0; i < CELLS; i++) {
          var r = sv('rect', { x: 10 + i * SZ, y: 10 + j * SZ, width: SZ, height: SZ, 'class': 'cell0' });
          svg.appendChild(r);
          cells.push(r);
        }
      }
      [0, 1].forEach(function (v) {
        svg.appendChild(sv('line', { x1: X(v), x2: X(v), y1: 10, y2: 310, 'class': 'grid' }));
        svg.appendChild(sv('line', { x1: 10, x2: 310, y1: Y(v), y2: Y(v), 'class': 'grid' }));
      });
      svg.appendChild(sv('rect', { x: 10, y: 10, width: 300, height: 300, fill: 'none', 'class': 'axis' }));
      svg.appendChild(sv('text', { x: 160, y: 318, 'text-anchor': 'middle', text: 'x1' }));
      svg.appendChild(sv('text', { x: 4, y: 160, text: 'x2' }));
      ptLayer = sv('g');
      svg.appendChild(ptLayer);
    }

    function update() {
      var mode = $('xor-mode').value;
      if (mode === 'mlp') $('xor-gate').value = 'xor';
      $('xor-gate').disabled = mode === 'mlp';
      ids.forEach(function (k) { $('xor-' + k).disabled = mode === 'mlp'; });
      $('xor-w3-wrap').hidden = mode !== 'feat';
      ids.forEach(function (k) { setText('xor-' + k + '-o', num(val(k), 1)); });

      var gate = $('xor-gate').value;
      var target = GATES[gate];
      var w = weights();
      var i, j;
      for (j = 0; j < CELLS; j++) {
        for (i = 0; i < CELLS; i++) {
          var x1 = -0.5 + (i + 0.5) * (2 / CELLS);
          var x2 = 1.5 - (j + 0.5) * (2 / CELLS);
          cells[j * CELLS + i].setAttribute('class', predict(mode, x1, x2, w).y ? 'cell1' : 'cell0');
        }
      }
      clear(ptLayer);
      var score = 0;
      var rows = [];
      PTS.forEach(function (p, idx) {
        var pr = predict(mode, p[0], p[1], w);
        var ok = pr.y === target[idx];
        if (ok) score++;
        var cls = 'pt' + (ok ? '' : ' bad');
        var shape = target[idx] ? sv('circle', { cx: X(p[0]), cy: Y(p[1]), r: 9, 'class': cls }) :
          sv('rect', { x: X(p[0]) - 8, y: Y(p[1]) - 8, width: 16, height: 16, 'class': cls });
        ptLayer.appendChild(shape);
        ptLayer.appendChild(sv('text', { x: X(p[0]) + 12, y: Y(p[1]) - 10, 'class': 'lbl', text: '(' + p[0] + ',' + p[1] + ')' }));
        rows.push([p[0], p[1], target[idx], pr, ok]);
      });

      var table = $('xor-table');
      clear(table);
      var head = ['x1', 'x2', 'target'];
      if (mode === 'mlp') head.push('h1', 'h2');
      head.push('prediksi', 'benar?');
      table.appendChild(el('thead', null, [el('tr', null, head.map(function (h) { return el('th', { text: h }); }))]));
      var tb = el('tbody');
      rows.forEach(function (r) {
        var cs = [r[0], r[1], r[2]];
        if (mode === 'mlp') cs.push(r[3].h1, r[3].h2);
        cs.push(r[3].y, r[4] ? 'ya' : 'tidak');
        tb.appendChild(el('tr', null, cs.map(function (c) { return el('td', { text: String(c) }); })));
      });
      table.appendChild(tb);

      var msg;
      if (score === 4) msg = 'Semua benar.' + (mode === 'lin' ? ' Untuk gate ini satu garis lurus cukup (linearly separable).' : '');
      else if (mode === 'lin' && gate === 'xor') msg = 'Maksimal 3 dari 4 untuk satu garis lurus. Itu inti limitasi linear model: XOR tidak linearly separable.';
      else msg = 'Masih ada yang salah. Geser bobot atau klik brute force.';
      lines($('xor-score'), ['Skor: ' + score + ' dari 4 benar.', msg]);
    }

    function brute() {
      var mode = $('xor-mode').value;
      if (mode === 'mlp') return;
      var target = GATES[$('xor-gate').value];
      var vals = [], v;
      for (v = -3; v <= 3.0001; v += 0.5) vals.push(Math.round(v * 2) / 2);
      var w3vals = mode === 'feat' ? vals : [0];
      var best = -1, bw = null;
      vals.forEach(function (a) {
        vals.forEach(function (b) {
          vals.forEach(function (c) {
            w3vals.forEach(function (d) {
              if (best === 4) return;
              var w = { w1: a, w2: b, b: c, w3: d };
              var s = 0;
              PTS.forEach(function (p, idx) { if (predict(mode, p[0], p[1], w).y === target[idx]) s++; });
              if (s > best) { best = s; bw = w; }
            });
          });
        });
      });
      ids.forEach(function (k) { $('xor-' + k).value = String(bw[k]); });
      update();
      var extra = $('xor-score');
      extra.appendChild(el('p', { text: 'Brute force (grid -3 sampai 3, langkah 0.5): skor terbaik ' + best + ' dari 4.' }));
    }

    build();
    ['xor-gate', 'xor-mode'].forEach(function (id) { on(id, 'change', update); });
    ids.forEach(function (k) { on('xor-' + k, 'input', update); });
    on('xor-brute', 'click', brute);
    on('xor-reset', 'click', function () {
      $('xor-w1').value = '1'; $('xor-w2').value = '1'; $('xor-b').value = '-0.5'; $('xor-w3').value = '0';
      update();
    });
    update();
  }

  /* ---------- 2a. Optimizer ---------- */

  function initOpt() {
    var svg = $('opt-plot');
    if (!svg) return;
    var STEPS = 60;

    function lrAt(sched, lr0, t) {
      if (sched === 'step') return lr0 * Math.pow(0.5, Math.floor(t / 15));
      if (sched === 'exp') return lr0 * Math.pow(0.95, t);
      if (sched === 'cos') return lr0 * 0.5 * (1 + Math.cos(Math.PI * t / STEPS));
      return lr0;
    }
    function loss(x, y) { return 0.5 * (x * x + 10 * y * y); }

    function simulate(algo, lr0, sched) {
      var x = 4, y = 1, vx = 0, vy = 0, sx = 0, sy2 = 0, mx = 0, my = 0;
      var out = [loss(x, y)], t, lr, gx, gy, mh, vh, bx, by;
      for (t = 1; t <= STEPS; t++) {
        if (out[out.length - 1] > 1e12) { out.push(1e12); continue; }
        lr = lrAt(sched, lr0, t - 1);
        gx = x; gy = 10 * y;
        if (algo === 'sgd') {
          x -= lr * gx; y -= lr * gy;
        } else if (algo === 'mom') {
          vx = 0.9 * vx + gx; vy = 0.9 * vy + gy;
          x -= lr * vx; y -= lr * vy;
        } else if (algo === 'rms') {
          sx = 0.99 * sx + 0.01 * gx * gx; sy2 = 0.99 * sy2 + 0.01 * gy * gy;
          x -= lr * gx / (Math.sqrt(sx) + 1e-8); y -= lr * gy / (Math.sqrt(sy2) + 1e-8);
        } else {
          mx = 0.9 * mx + 0.1 * gx; my = 0.9 * my + 0.1 * gy;
          sx = 0.999 * sx + 0.001 * gx * gx; sy2 = 0.999 * sy2 + 0.001 * gy * gy;
          mh = 1 - Math.pow(0.9, t); vh = 1 - Math.pow(0.999, t);
          bx = Math.sqrt(sx / vh) + 1e-8; by = Math.sqrt(sy2 / vh) + 1e-8;
          x -= lr * (mx / mh) / bx; y -= lr * (my / mh) / by;
        }
        var L = loss(x, y);
        out.push(isFinite(L) ? Math.min(L, 1e12) : 1e12);
      }
      return out;
    }

    function update() {
      var lr = Math.pow(10, parseFloat($('opt-lr').value));
      setText('opt-lr-o', num(lr, 4));
      var algo = $('opt-algo').value, sched = $('opt-sched').value;
      var L = simulate(algo, lr, sched);
      var f = frame(svg, { w: 480, h: 240, l: 44, r: 12, t: 22, b: 30, x0: 0, x1: STEPS, y0: -6, y1: 4,
        xt: [0, 10, 20, 30, 40, 50, 60], yt: [-6, -4, -2, 0, 2, 4], yf: function (v) { return '1e' + v; }, xl: 'step', yl: 'loss (skala log)' });
      var pts = L.map(function (v, i) {
        var lg = Math.log(Math.max(v, 1e-12)) / Math.LN10;
        return [f.sx(i), f.sy(Math.max(-6, Math.min(4, lg)))];
      });
      svg.appendChild(sv('path', { d: pathFrom(pts), 'class': 'cur' }));
      var first = L[0], last = L[L.length - 1];
      var verdict;
      if (last > first) verdict = 'Diverge: loss malah naik. Learning rate terlalu tinggi untuk setup ini.';
      else if (last > 0.1 * first) verdict = 'Konvergen lambat: loss turun tapi masih jauh dari minimum. Learning rate terlalu rendah, atau butuh lebih banyak step.';
      else verdict = 'Konvergen: loss turun jauh dari nilai awal.';
      var arr = ['η = ' + num(lr, 4) + '. Loss awal ' + num(first, 2) + ', loss akhir ' + (last >= 1e12 ? 'meledak (lebih dari 1e12)' : num(last, 6)) + '.', verdict];
      if (algo === 'sgd' && sched === 'none') arr.push('Batas stabil SGD pada fungsi ini: η < 2 / 10 = 0.2 (kurva y punya curvature 10). Tambahan, dihitung dari fungsi mainan.');
      if (algo === 'rms' || algo === 'adam') arr.push('RMSProp dan Adam menskala langkah per parameter, jadi dengan η besar loss bisa berosilasi di sekitar minimum alih-alih meledak.');
      lines($('opt-read'), arr);
    }

    ['opt-algo', 'opt-sched'].forEach(function (id) { on(id, 'change', update); });
    on('opt-lr', 'input', update);
    update();
  }

  /* ---------- 2b. Overfitting ---------- */

  function initOver() {
    var svg = $('over-plot');
    if (!svg) return;
    var E = 60;

    function curves(cap, reg) {
      var tr, va;
      if (cap === 'low') {
        var d = reg ? 0.08 : 0, dv = reg ? 0.06 : 0;
        tr = function (e) { return 0.55 + d + 0.45 * Math.exp(-e / 10); };
        va = function (e) { return 0.6 + dv + 0.45 * Math.exp(-e / 10); };
      } else if (cap === 'mid') {
        tr = function (e) { return (reg ? 0.15 : 0.12) + 0.88 * Math.exp(-e / 10); };
        va = function (e) { return 0.2 + 0.8 * Math.exp(-e / 10) + (reg ? 0.00001 : 0.00003) * e * e; };
      } else {
        var fl = reg ? 0.1 : 0.03, a = reg ? 0.00008 : 0.0003;
        tr = function (e) { return fl + (1 - fl) * Math.exp(-e / 10); };
        va = function (e) { return 0.3 + 0.7 * Math.exp(-e / 10) + a * e * e; };
      }
      return { tr: tr, va: va };
    }

    function update() {
      var cap = $('over-cap').value, reg = $('over-reg').checked;
      var pat = parseInt($('over-pat').value, 10);
      setText('over-pat-o', String(pat));
      var c = curves(cap, reg);
      var f = frame(svg, { w: 480, h: 240, l: 40, r: 12, t: 22, b: 30, x0: 0, x1: E, y0: 0, y1: 1.5,
        xt: [0, 10, 20, 30, 40, 50, 60], yt: [0, 0.5, 1, 1.5], xl: 'epoch', yl: 'loss' });
      var e, trp = [], vap = [], best = Infinity, bestE = 0, stopE = null;
      for (e = 0; e <= E; e++) {
        var v = c.va(e);
        trp.push([f.sx(e), f.sy(c.tr(e))]);
        vap.push([f.sx(e), f.sy(v)]);
        if (v < best) { best = v; bestE = e; }
        if (stopE === null && e - bestE >= pat) stopE = e;
      }
      var bestAll = Infinity, bestAllE = 0;
      for (e = 0; e <= E; e++) { if (c.va(e) < bestAll) { bestAll = c.va(e); bestAllE = e; } }
      svg.appendChild(sv('path', { d: pathFrom(trp), 'class': 'alt' }));
      svg.appendChild(sv('path', { d: pathFrom(vap), 'class': 'cur' }));
      svg.appendChild(sv('line', { x1: f.sx(bestAllE), x2: f.sx(bestAllE), y1: 22, y2: 210, 'class': 'mark' }));
      svg.appendChild(sv('text', { x: f.sx(bestAllE) + 4, y: 34, text: 'val min' }));
      if (stopE !== null) {
        svg.appendChild(sv('line', { x1: f.sx(stopE), x2: f.sx(stopE), y1: 22, y2: 210, 'class': 'thin' }));
        svg.appendChild(sv('text', { x: f.sx(stopE) + 4, y: 48, text: 'stop' }));
      }
      svg.appendChild(sv('text', { x: 300, y: 18, text: 'garis putus = train, garis tebal = validation' }));

      var trEnd = c.tr(E), rise = c.va(E) - bestAll;
      var diag;
      if (trEnd > 0.4) diag = 'Underfitting: train dan validation sama-sama tinggi. Model terlalu sederhana atau kurang dilatih.';
      else if (rise > 0.1) diag = 'Overfitting: train terus turun, validation naik setelah epoch ' + bestAllE + '.';
      else diag = 'Fit cukup pas: train dan validation turun bersama dengan gap kecil.';
      var arr = [diag, 'Validation loss terendah di epoch ' + bestAllE + ' (' + num(bestAll, 3) + ').'];
      if (stopE !== null) arr.push('Early stopping dengan patience ' + pat + ' berhenti di epoch ' + stopE + ', lalu pakai bobot terbaik dari epoch ' + bestAllE + ' (checkpoint).');
      else arr.push('Dengan patience ' + pat + ', early stopping tidak terpicu dalam ' + E + ' epoch karena validation loss masih membaik.');
      if (reg && cap === 'high') arr.push('Regularisasi aktif: kenaikan validation loss lebih landai, train loss sedikit lebih tinggi.');
      if (reg && cap === 'low') arr.push('Regularisasi di model yang sudah underfit malah memperburuk. Ini alasan λ terlalu besar bikin underfitting.');
      lines($('over-read'), arr);
    }

    ['over-cap', 'over-reg'].forEach(function (id) { on(id, 'change', update); });
    on('over-pat', 'input', update);
    update();
  }

  /* ---------- 2c. Metrics ---------- */

  function initMetrics() {
    function nonneg(id) {
      var s = $(id).value.trim();
      if (!/^\d+$/.test(s)) return NaN;
      return Number(s);
    }
    function cls() {
      var tp = nonneg('m-tp'), fp = nonneg('m-fp'), fn = nonneg('m-fn'), tn = nonneg('m-tn');
      var out = $('m-out');
      if ([tp, fp, fn, tn].some(function (v) { return !isFinite(v); })) {
        lines(out, ['Isi TP, FP, FN, TN dengan bilangan bulat 0 atau lebih.']);
        return;
      }
      var total = tp + fp + fn + tn;
      function ratio(a, b) { return b === 0 ? null : a / b; }
      var acc = ratio(tp + tn, total), pr = ratio(tp, tp + fp), rc = ratio(tp, tp + fn);
      var f1 = (pr === null || rc === null || pr + rc === 0) ? null : 2 * pr * rc / (pr + rc);
      function show(v) { return v === null ? 'tidak terdefinisi (bagi nol)' : num(v, 4); }
      lines(out, [
        'Accuracy = (TP + TN) / total = ' + (tp + tn) + ' / ' + total + ' = ' + show(acc),
        'Precision = TP / (TP + FP) = ' + tp + ' / ' + (tp + fp) + ' = ' + show(pr),
        'Recall = TP / (TP + FN) = ' + tp + ' / ' + (tp + fn) + ' = ' + show(rc),
        'F1 = 2·P·R / (P + R) = ' + show(f1)
      ]);
    }
    function parseList(s) {
      var parts = s.split(',').map(function (x) { return x.trim(); }).filter(function (x) { return x !== ''; });
      var nums = parts.map(Number);
      if (!nums.length || nums.length > 1000 || nums.some(function (v) { return !isFinite(v); })) return null;
      return nums;
    }
    function reg() {
      var y = parseList($('r-y').value), p = parseList($('r-p').value), out = $('r-out');
      if (!y || !p) { lines(out, ['Isi angka dipisah koma, misal 3, 5, 2.5.']); return; }
      if (y.length !== p.length) { lines(out, ['Jumlah y (' + y.length + ') dan ŷ (' + p.length + ') harus sama.']); return; }
      var n = y.length, i, se = 0, ae = 0, mean = 0, tot = 0;
      for (i = 0; i < n; i++) { se += (y[i] - p[i]) * (y[i] - p[i]); ae += Math.abs(y[i] - p[i]); mean += y[i]; }
      mean /= n;
      for (i = 0; i < n; i++) tot += (y[i] - mean) * (y[i] - mean);
      lines(out, [
        'MSE = (1/n) Σ (y − ŷ)² = ' + num(se, 4) + ' / ' + n + ' = ' + num(se / n, 4),
        'MAE = (1/n) Σ |y − ŷ| = ' + num(ae, 4) + ' / ' + n + ' = ' + num(ae / n, 4),
        'R² = 1 − SS_res / SS_tot = ' + (tot === 0 ? 'tidak terdefinisi (semua y sama)' : '1 − ' + num(se, 4) + ' / ' + num(tot, 4) + ' = ' + num(1 - se / tot, 4))
      ]);
    }
    ['m-tp', 'm-fp', 'm-fn', 'm-tn'].forEach(function (id) { on(id, 'input', cls); });
    ['r-y', 'r-p'].forEach(function (id) { on(id, 'input', reg); });
    cls(); reg();
  }

  /* ---------- 3. CNN calculator ---------- */

  function initCnn() {
    if (!$('cnn-add')) return;
    var specs = [];

    function readInt(id, min) {
      var s = $(id).value.trim();
      if (!/^\d+$/.test(s)) return NaN;
      var v = Number(s);
      return v >= min ? v : NaN;
    }
    function shapeStr(s) { return s.flat ? String(s.c) : s.h + ' × ' + s.w + ' × ' + s.c; }

    function dimLine(label, inSize, f, p, s) {
      var n = inSize - f + 2 * p;
      var base = '(' + inSize + ' − ' + f + ' + 2×' + p + ') / ' + s;
      if (n % s === 0) return label + ' = ' + base + ' + 1 = ' + (n / s + 1);
      var q = Math.floor(n / s);
      return label + ' = ' + base + ' + 1. Hasil bagi ' + num(n / s, 2) + ', dibulatkan ke bawah jadi ' + q + ' (aturan floor, tambahan), lalu + 1 = ' + (q + 1);
    }

    function applyLayer(shape, sp) {
      var steps = [];
      var res = { steps: steps, params: 0, name: '', out: null, err: null };
      if (sp.type === 'conv' || sp.type === 'pool') {
        if (shape.flat) { res.err = 'Layer ini butuh input gambar (H × W × C), bukan hasil Flatten.'; return res; }
        var nw = shape.w - sp.fw + 2 * sp.p, nh = shape.h - sp.fh + 2 * sp.p;
        if (nw < 0 || nh < 0) { res.err = 'Kernel (' + sp.fh + '×' + sp.fw + ') lebih besar dari input setelah padding (' + (shape.h + 2 * sp.p) + '×' + (shape.w + 2 * sp.p) + ').'; return res; }
        var ow = Math.floor(nw / sp.s) + 1, oh = Math.floor(nh / sp.s) + 1;
        steps.push('Rumus: O = (input − F + 2P) / S + 1');
        steps.push(dimLine('Lebar O_w', shape.w, sp.fw, sp.p, sp.s));
        steps.push(dimLine('Tinggi O_h', shape.h, sp.fh, sp.p, sp.s));
        if (sp.type === 'conv') {
          steps.push('Channel output = jumlah filter K = ' + sp.k);
          steps.push('Output = ' + oh + ' × ' + ow + ' × ' + sp.k);
          var wts = sp.fh * sp.fw * shape.c;
          steps.push('Weights per filter = F_h × F_w × C_in = ' + sp.fh + ' × ' + sp.fw + ' × ' + shape.c + ' = ' + wts);
          steps.push('Parameter per filter = ' + wts + ' + 1 bias = ' + (wts + 1));
          steps.push('Total parameter = ' + (wts + 1) + ' × ' + sp.k + ' = ' + ((wts + 1) * sp.k));
          res.params = (wts + 1) * sp.k;
          res.name = 'Conv ' + sp.fh + '×' + sp.fw + ', K=' + sp.k + ', S=' + sp.s + ', P=' + sp.p;
          res.out = { h: oh, w: ow, c: sp.k, flat: false };
        } else {
          steps.push('Channel tetap = ' + shape.c);
          steps.push('Output = ' + oh + ' × ' + ow + ' × ' + shape.c);
          steps.push('Parameter pooling = 0 (tidak ada yang dipelajari)');
          res.name = (sp.ptype === 'avg' ? 'Avg' : 'Max') + ' pool ' + sp.fh + '×' + sp.fw + ', S=' + sp.s + ', P=' + sp.p;
          res.out = { h: oh, w: ow, c: shape.c, flat: false };
        }
      } else if (sp.type === 'flatten') {
        if (shape.flat) { res.err = 'Input sudah flat.'; return res; }
        var n = shape.h * shape.w * shape.c;
        steps.push('Flatten = H × W × C = ' + shape.h + ' × ' + shape.w + ' × ' + shape.c + ' = ' + n);
        res.name = 'Flatten';
        res.out = { h: 1, w: 1, c: n, flat: true };
      } else {
        if (!shape.flat) { res.err = 'Fully connected butuh input flat. Tambah layer Flatten dulu.'; return res; }
        var wt = shape.c * sp.units;
        steps.push('Weights = in × out = ' + shape.c + ' × ' + sp.units + ' = ' + wt);
        steps.push('Bias = out = ' + sp.units);
        steps.push('Total parameter = ' + wt + ' + ' + sp.units + ' = ' + (wt + sp.units));
        res.params = wt + sp.units;
        res.name = 'FC ' + shape.c + ' → ' + sp.units;
        res.out = { h: 1, w: 1, c: sp.units, flat: true };
      }
      return res;
    }

    function readSpec() {
      var type = $('cnn-type').value;
      var sp = { type: type, ptype: $('cnn-ptype').value };
      var bad = [];
      function f(id, min, label) { var v = readInt(id, min); if (isNaN(v)) bad.push(label); return v; }
      if (type === 'conv') sp.k = f('cnn-k', 1, 'jumlah filter');
      if (type === 'conv' || type === 'pool') {
        sp.fh = f('cnn-fh', 1, 'kernel tinggi'); sp.fw = f('cnn-fw', 1, 'kernel lebar');
        sp.s = f('cnn-s', 1, 'stride'); sp.p = f('cnn-p', 0, 'padding');
      }
      if (type === 'fc') sp.units = f('cnn-units', 1, 'neuron output');
      return { sp: sp, bad: bad };
    }

    function showErr(msg) {
      var e = $('cnn-err');
      e.hidden = !msg;
      e.textContent = msg || '';
    }

    function render() {
      var h = readInt('cnn-h', 1), w = readInt('cnn-w', 1), c = readInt('cnn-c', 1);
      var steps = $('cnn-steps'), table = $('cnn-table');
      clear(steps); clear(table);
      if (isNaN(h) || isNaN(w) || isNaN(c)) { showErr('Input H, W, C harus bilangan bulat 1 atau lebih.'); return; }
      var shape = { h: h, w: w, c: c, flat: false };
      var rows = [['Input', shapeStr(shape), '-']];
      var total = 0, i, notice = '';
      for (i = 0; i < specs.length; i++) {
        var r = applyLayer(shape, specs[i]);
        if (r.err) {
          notice = 'Layer ' + (i + 1) + ' tidak valid dengan input ini (' + r.err + ') dan dihapus dari stack.';
          specs = specs.slice(0, i);
          break;
        }
        shape = r.out; total += r.params;
        rows.push([r.name, shapeStr(shape), String(r.params)]);
      }
      table.appendChild(el('thead', null, [el('tr', null, ['#', 'Layer', 'Output', 'Parameter'].map(function (t) { return el('th', { text: t }); }))]));
      var tb = el('tbody');
      rows.forEach(function (r, idx) {
        tb.appendChild(el('tr', null, [el('td', { text: String(idx) }), el('td', { text: r[0] }), el('td', { text: r[1] }), el('td', { 'class': 'num', text: r[2] })]));
      });
      tb.appendChild(el('tr', null, [el('td', { text: '' }), el('th', { text: 'Total parameter' }), el('td', { text: '' }), el('th', { 'class': 'num', text: String(total) })]));
      table.appendChild(tb);

      var rs = readSpec();
      if (rs.bad.length) { showErr(notice || ('Isi dengan bilangan bulat valid: ' + rs.bad.join(', ') + '.')); return; }
      var pr = applyLayer(shape, rs.sp);
      if (pr.err) { showErr(notice ? notice + ' ' + pr.err : pr.err); return; }
      showErr(notice);
      pr.steps.forEach(function (s) { steps.appendChild(el('li', { text: s })); });
    }

    function syncFields() {
      var t = $('cnn-type').value;
      document.querySelectorAll('[data-for]').forEach(function (n) {
        n.hidden = n.getAttribute('data-for').split(' ').indexOf(t) < 0;
      });
      render();
    }
    function setInput(h, w, c) { $('cnn-h').value = h; $('cnn-w').value = w; $('cnn-c').value = c; }
    function setForm(o) {
      $('cnn-type').value = o.type;
      if (o.k) $('cnn-k').value = o.k;
      if (o.fh) { $('cnn-fh').value = o.fh; $('cnn-fw').value = o.fw; }
      if (o.s) $('cnn-s').value = o.s;
      if (o.p !== undefined) $('cnn-p').value = o.p;
      if (o.units) $('cnn-units').value = o.units;
      if (o.ptype) $('cnn-ptype').value = o.ptype;
    }

    on('cnn-add', 'click', function () {
      var rs = readSpec();
      if (rs.bad.length) { showErr('Isi dengan bilangan bulat valid: ' + rs.bad.join(', ') + '.'); return; }
      var h = readInt('cnn-h', 1), w = readInt('cnn-w', 1), c = readInt('cnn-c', 1);
      if (isNaN(h) || isNaN(w) || isNaN(c)) { showErr('Input H, W, C harus bilangan bulat 1 atau lebih.'); return; }
      var shape = { h: h, w: w, c: c, flat: false }, i;
      for (i = 0; i < specs.length; i++) shape = applyLayer(shape, specs[i]).out;
      var r = applyLayer(shape, rs.sp);
      if (r.err) { showErr(r.err); return; }
      specs.push(rs.sp);
      render();
    });
    on('cnn-undo', 'click', function () { specs.pop(); render(); });
    on('cnn-reset', 'click', function () { specs = []; render(); });
    ['cnn-h', 'cnn-w', 'cnn-c', 'cnn-k', 'cnn-fh', 'cnn-fw', 'cnn-s', 'cnn-p', 'cnn-units', 'cnn-ptype'].forEach(function (id) { on(id, 'input', render); });
    on('cnn-type', 'change', syncFields);

    document.querySelectorAll('[data-preset]').forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-preset');
        specs = [];
        if (k === 'kisi') {
          setInput(32, 32, 3);
          setForm({ type: 'conv', k: 10, fh: 5, fw: 5, s: 1, p: 0 });
        } else if (k === 'slide') {
          setInput(7, 7, 1);
          setForm({ type: 'conv', k: 1, fh: 3, fw: 3, s: 2, p: 1 });
        } else {
          setInput(32, 32, 1);
          specs = [
            { type: 'conv', k: 6, fh: 5, fw: 5, s: 1, p: 0, ptype: 'max' },
            { type: 'pool', fh: 2, fw: 2, s: 2, p: 0, ptype: 'max' },
            { type: 'conv', k: 16, fh: 5, fw: 5, s: 1, p: 0, ptype: 'max' },
            { type: 'pool', fh: 2, fw: 2, s: 2, p: 0, ptype: 'max' },
            { type: 'flatten' },
            { type: 'fc', units: 10 }
          ];
          setForm({ type: 'fc', units: 10 });
        }
        syncFields();
      });
    });
    syncFields();
  }

  /* ---------- 3b. Transfer learning ---------- */

  function initTl() {
    var row = $('tl-row');
    if (!row) return;
    var blocks = ['Conv block 1', 'Conv block 2', 'Conv block 3 (lebih dalam)', 'Classifier head (baru)'];
    function show(mode) {
      clear(row);
      blocks.forEach(function (b, i) {
        var train = i === 3 || (mode === 'ft' && i === 2);
        row.appendChild(el('div', { 'class': 'block ' + (train ? 'train' : 'frozen') }, [el('strong', { text: b }), train ? 'dilatih' : 'frozen']));
      });
      $('tl-fe').className = mode === 'fe' ? '' : 'ghost';
      $('tl-ft').className = mode === 'ft' ? '' : 'ghost';
      $('tl-text').textContent = mode === 'fe' ?
        'Feature extraction: bekukan semua layer pretrained, ganti classifier head, latih head saja.' :
        'Fine-tuning: mulai dari bobot pretrained, buka (unfreeze) layer yang lebih dalam bertahap, pakai learning rate lebih kecil.';
    }
    on('tl-fe', 'click', function () { show('fe'); });
    on('tl-ft', 'click', function () { show('ft'); });
    show('fe');
  }

  /* ---------- 4a. GAN losses ---------- */

  function initGan() {
    var svg = $('gan-plot');
    if (!svg) return;
    function update() {
      var dx = parseFloat($('gan-dx').value), dg = parseFloat($('gan-dg').value);
      setText('gan-dx-o', dx.toFixed(2));
      setText('gan-dg-o', dg.toFixed(2));
      var real = -Math.log(dx), fake = -Math.log(1 - dg), ld = real + fake, lg = -Math.log(dg);
      setText('gan-m1', num(real, 3)); setText('gan-m2', num(fake, 3)); setText('gan-m3', num(ld, 3)); setText('gan-m4', num(lg, 3));
      $('gan-b1').style.width = Math.min(100, real / 5 * 100) + '%';
      $('gan-b2').style.width = Math.min(100, fake / 5 * 100) + '%';
      $('gan-b3').style.width = Math.min(100, ld / 10 * 100) + '%';
      $('gan-b4').style.width = Math.min(100, lg / 5 * 100) + '%';

      var f = frame(svg, { w: 400, h: 240, l: 40, r: 12, t: 22, b: 32, x0: 0, x1: 1, y0: 0, y1: 5,
        xt: [0, 0.25, 0.5, 0.75, 1], yt: [0, 1, 2, 3, 4, 5], xl: 'D(G(z))', yl: 'loss' });
      var a = [], b = [], p;
      for (p = 0.01; p <= 0.9901; p += 0.01) {
        a.push([f.sx(p), f.sy(Math.min(5, -Math.log(p)))]);
        b.push([f.sx(p), f.sy(Math.min(5, -Math.log(1 - p)))]);
      }
      svg.appendChild(sv('path', { d: pathFrom(a), 'class': 'cur' }));
      svg.appendChild(sv('path', { d: pathFrom(b), 'class': 'alt' }));
      svg.appendChild(sv('line', { x1: f.sx(dg), x2: f.sx(dg), y1: 22, y2: 208, 'class': 'mark' }));
      svg.appendChild(sv('circle', { cx: f.sx(dg), cy: f.sy(Math.min(5, lg)), r: 5, 'class': 'pt acc' }));
      svg.appendChild(sv('circle', { cx: f.sx(dg), cy: f.sy(Math.min(5, fake)), r: 5, 'class': 'pt' }));
      svg.appendChild(sv('text', { x: 52, y: 40, 'class': 'lbl', text: 'garis tebal: L_G' }));
      svg.appendChild(sv('text', { x: 230, y: 40, 'class': 'lbl', text: 'garis putus: L_D bagian fake' }));

      var msg;
      if (dg < 0.3) msg = 'D hampir pasti bilang fake. D sedang menang, L_G besar (' + num(lg, 2) + '). Menurut slide, D yang terlalu kuat menyebabkan vanishing gradients.';
      else if (dg > 0.7) msg = 'D hampir ketipu. G sedang menang: L_G kecil (' + num(lg, 2) + '), tapi bagian fake dari L_D besar (' + num(fake, 2) + '), jadi D akan dilatih keras untuk membalas.';
      else msg = 'Posisi relatif seimbang, tarik tambang antara L_G dan L_D belum berat sebelah. Itu kondisi yang dicari dari training yang sehat (tambahan).';
      lines($('gan-read'), [msg, 'Dua kurva berpotongan di D(G(z)) = 0.5: pada titik itu −ln(0.5) sama dengan −ln(1 − 0.5).']);
    }
    ['gan-dx', 'gan-dg'].forEach(function (id) { on(id, 'input', update); });
    update();
  }

  /* ---------- 4b. Mode collapse ---------- */

  function initMode() {
    var svg = $('mode-plot');
    if (!svg) return;
    var seed = 12345;
    function rnd() { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }
    function gauss() { return Math.sqrt(-2 * Math.log(1 - rnd())) * Math.cos(2 * Math.PI * rnd()); }
    var centers = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
    var real = [], gen = [], i, j;
    for (j = 0; j < 4; j++) for (i = 0; i < 60; i++) real.push([centers[j][0] + 0.22 * gauss(), centers[j][1] + 0.22 * gauss()]);
    for (j = 0; j < 4; j++) { gen.push([]); for (i = 0; i < 240; i++) gen[j].push([centers[j][0] + 0.2 * gauss(), centers[j][1] + 0.2 * gauss()]); }
    function X(x) { return 20 + (x + 2) / 4 * 280; }
    function Y(y) { return 300 - (y + 2) / 4 * 280; }
    function update() {
      var k = parseInt($('mode-k').value, 10);
      setText('mode-k-o', String(k));
      clear(svg);
      svg.appendChild(sv('rect', { x: 20, y: 20, width: 280, height: 280, fill: 'none', 'class': 'axis' }));
      real.forEach(function (p) { svg.appendChild(sv('circle', { cx: X(p[0]), cy: Y(p[1]), r: 2.5, 'class': 'real' })); });
      var per = Math.floor(240 / k), m, n;
      for (m = 0; m < k; m++) for (n = 0; n < Math.floor(per / 4); n++) {
        var p = gen[m][n];
        svg.appendChild(sv('circle', { cx: X(p[0]), cy: Y(p[1]), r: 4, 'class': 'gen' }));
      }
      var msg = k === 4 ? 'G mencakup semua 4 mode. Variasi sampel mirip data real.' :
        'G hanya mencakup ' + k + ' dari 4 mode (' + (k * 25) + '%). Ini mode collapse: variasi terbatas. Deteksinya lewat visual inspection dan FID/IS (S07 slide 13, 18).';
      lines($('mode-read'), [msg]);
    }
    on('mode-k', 'input', update);
    update();
  }

  /* ---------- 5. MLP ---------- */

  function initHead() {
    var table = $('head-table');
    if (!table) return;
    function update() {
      var task = $('head-task').value;
      var cval = $('head-c').value.trim();
      var c = /^\d+$/.test(cval) ? Number(cval) : NaN;
      $('head-c-wrap').hidden = task !== 'multi';
      var cc = (isNaN(c) || c < 3 || c > 1000) ? 'C' : String(c);
      var rows, note;
      if (task === 'reg') {
        rows = [['Output layer', 'nn.Linear(hidden_dim, 1)'], ['Activation akhir', 'Tidak ada (atau ReLU kalau nilai tidak boleh negatif)'],
          ['Loss', 'MSELoss atau L1Loss (MAE)'], ['Metrik', 'MSE, MAE, R²']];
        note = 'MSE menghukum error besar lebih berat dan sensitif outlier. MAE lebih tahan outlier dengan gradien konstan.';
      } else if (task === 'bin') {
        rows = [['Output layer', 'nn.Linear(hidden_dim, 1)'], ['Activation akhir', 'Sigmoid'],
          ['Loss', 'BCELoss atau BCEWithLogitsLoss (lebih disarankan)'], ['Metrik', 'Accuracy, Precision, Recall, F1, AUC']];
        note = 'Pakai threshold untuk menentukan kelas. Tambahan: kalau pakai BCEWithLogitsLoss, sigmoid sudah ada di dalam loss, jadi model cukup mengeluarkan logit.';
      } else {
        rows = [['Output layer', 'nn.Linear(hidden_dim, ' + cc + ')'], ['Activation akhir', 'Softmax (sudah implisit di dalam loss)'],
          ['Loss', 'CrossEntropyLoss (log-softmax + NLL)'], ['Metrik', 'Accuracy, F1, AUC']];
        note = 'Kirim logit mentah ke CrossEntropyLoss. Jangan tambah Softmax sendiri sebelum loss ini.';
      }
      clear(table);
      var tb = el('tbody');
      rows.forEach(function (r) { tb.appendChild(el('tr', null, [el('th', { text: r[0] }), el('td', { text: r[1] })])); });
      table.appendChild(tb);
      $('head-note').textContent = note;
    }
    on('head-task', 'change', update);
    on('head-c', 'input', update);
    update();
  }

  function initCe() {
    if (!$('ce-steps')) return;
    function update() {
      var z = ['ce-z1', 'ce-z2', 'ce-z3'].map(function (id) { return Number($(id).value); });
      var box = $('ce-steps');
      clear(box);
      var raw = ['ce-z1', 'ce-z2', 'ce-z3'].map(function (id) { return $(id).value.trim(); });
      if (z.some(function (v, i) { return raw[i] === '' || !isFinite(v) || Math.abs(v) > 700; })) {
        box.appendChild(el('li', { text: 'Isi tiga logit dengan angka (nilai mutlak maksimal 700).' }));
        return;
      }
      var t = parseInt($('ce-true').value, 10);
      var mx = Math.max.apply(null, z);
      var e = z.map(function (v) { return Math.exp(v - mx); });
      var sum = e[0] + e[1] + e[2];
      var p = e.map(function (v) { return v / sum; });
      var out = [
        'Logit: z = [' + z.map(function (v) { return num(v, 3); }).join(', ') + ']',
        'exp(zᵢ − max) = [' + e.map(function (v) { return num(v, 4); }).join(', ') + '] (dikurangi max supaya angka aman, tambahan)',
        'Jumlah = ' + num(sum, 4),
        'Softmax pᵢ = exp / jumlah = [' + p.map(function (v) { return num(v, 4); }).join(', ') + ']',
        'Cek: p1 + p2 + p3 = ' + num(p[0] + p[1] + p[2], 4),
        'Kelas benar = kelas ' + (t + 1) + ', p = ' + num(p[t], 4),
        'CE = −ln(p benar) = −ln(' + num(p[t], 4) + ') = ' + num(-Math.log(p[t]), 4)
      ];
      out.forEach(function (s) { box.appendChild(el('li', { text: s })); });
    }
    ['ce-z1', 'ce-z2', 'ce-z3'].forEach(function (id) { on(id, 'input', update); });
    on('ce-true', 'change', update);
    update();
  }

  function initDiag() {
    if (!$('diag-out')) return;
    function update() {
      var tr = parseInt($('diag-tr').value, 10), va = parseInt($('diag-va').value, 10);
      setText('diag-tr-o', String(tr)); setText('diag-va-o', String(va));
      var gap = va - tr, arr;
      if (tr > 20) {
        arr = ['Diagnosis: underfitting (error train sendiri masih tinggi, ' + tr + '%).',
          'Coba: model lebih besar atau dalam, training lebih lama, fitur lebih baik, kurangi regularisasi (tambahan).'];
      } else if (gap > 10) {
        arr = ['Diagnosis: overfitting (gap validation dikurangi train = ' + gap + ' poin).',
          'Coba: L2, dropout, data augmentation, early stopping (S02), atau tambah data.'];
      } else {
        arr = ['Diagnosis: fit cukup pas (train ' + tr + '%, validation ' + va + '%, gap ' + gap + ' poin).',
          'Kalau datanya imbalance, cek juga recall dan F1, bukan cuma error total.'];
      }
      lines($('diag-out'), arr);
    }
    ['diag-tr', 'diag-va'].forEach(function (id) { on(id, 'input', update); });
    update();
  }

  function initImb() {
    if (!$('imb-cm')) return;
    function update() {
      var pct = parseInt($('imb-p').value, 10), N = 1000;
      setText('imb-p-o', String(pct));
      var m = Math.round(N * pct / 100), tn = N - m;
      var cm = $('imb-cm');
      clear(cm);
      [['', 'h'], ['Prediksi positif', 'h'], ['Prediksi negatif', 'h'],
        ['Aktual positif (minoritas)', 'h'], ['TP = 0', ''], ['FN = ' + m, ''],
        ['Aktual negatif', 'h'], ['FP = 0', ''], ['TN = ' + tn, 'hit']].forEach(function (c) {
        cm.appendChild(el('div', { 'class': c[1], text: c[0] }));
      });
      lines($('imb-out'), [
        'Accuracy = ' + tn + ' / ' + N + ' = ' + num(tn / N * 100, 1) + '%',
        'Recall minoritas = 0 / ' + m + ' = 0',
        'Precision = 0 / 0 = tidak terdefinisi',
        'F1 = 0',
        'Accuracy kelihatan bagus, padahal model tidak menemukan satu pun kasus minoritas.'
      ]);
    }
    on('imb-p', 'input', update);
    update();
  }

  /* ---------- 6. Autoencoder ---------- */

  function initAe() {
    var svg = $('ae-plot');
    if (!svg) return;
    var N = 16, i, k;
    var clean = [], noise = [];
    var seed = 777;
    function rnd() { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }
    for (i = 0; i < N; i++) {
      clean.push(Math.sin(2 * Math.PI * i / N) + 0.6 * Math.sin(2 * Math.PI * 3 * i / N) + 0.3 * Math.sin(2 * Math.PI * 6 * i / N));
      noise.push(rnd() * 2 - 1);
    }
    function a(kk) { return kk === 0 ? Math.sqrt(1 / N) : Math.sqrt(2 / N); }
    function dct(x) {
      var c = [], kk, n, s;
      for (kk = 0; kk < N; kk++) {
        s = 0;
        for (n = 0; n < N; n++) s += x[n] * Math.cos(Math.PI * (n + 0.5) * kk / N);
        c.push(a(kk) * s);
      }
      return c;
    }
    function idct(c, keep) {
      var x = [], n, kk, s;
      for (n = 0; n < N; n++) {
        s = 0;
        for (kk = 0; kk < Math.min(keep, N); kk++) s += a(kk) * c[kk] * Math.cos(Math.PI * (n + 0.5) * kk / N);
        x.push(s);
      }
      return x;
    }
    function update() {
      k = parseInt($('ae-k').value, 10);
      var amp = parseFloat($('ae-n').value);
      setText('ae-k-o', String(k)); setText('ae-n-o', amp.toFixed(2));
      var input = clean.map(function (v, idx) { return v + amp * noise[idx]; });
      var rec = idct(dct(input), k);
      var f = frame(svg, { w: 480, h: 240, l: 36, r: 12, t: 22, b: 30, x0: 0, x1: 15, y0: -3, y1: 3,
        xt: [0, 5, 10, 15], yt: [-3, -2, -1, 0, 1, 2, 3], xl: 'indeks sampel', yl: 'nilai' });
      function line(arr, cls) { svg.appendChild(sv('path', { d: pathFrom(arr.map(function (v, idx) { return [f.sx(idx), f.sy(v)]; })), 'class': cls })); }
      line(clean, 'alt'); line(input, 'thin'); line(rec, 'cur');
      var eIn = mse(rec, input), eClean = mse(rec, clean), nIn = mse(input, clean);
      var shape = k < N ? 'Undercomplete (k = ' + k + ' < 16): latent lebih kecil dari input, rasio kompresi ' + num(N / k, 2) + ' kali.' :
        (k === N ? 'Latent sama dengan input (k = 16).' : 'Overcomplete (k = ' + k + ' > 16): latent lebih besar dari input. Di ilustrasi ini tetap 16 koefisien karena informasi tidak bertambah.');
      var arr = [shape,
        'Error rekonstruksi vs input (MSE) = ' + num(eIn, 4) + '. Vs sinyal bersih = ' + num(eClean, 4) + '. Noise input vs bersih = ' + num(nIn, 4) + '.'];
      if (k >= N) arr.push('Rekonstruksi sama persis dengan input, termasuk noise. Ini "copy": tidak ada yang dipelajari. Makanya overcomplete perlu sparse atau denoising.');
      else if (amp > 0 && eClean < nIn) arr.push('Rekonstruksi lebih dekat ke sinyal bersih daripada input berisik. Ini efek denoising dari bottleneck (di denoising AE sungguhan, target tetap input bersih).');
      else if (eIn > 0.15) arr.push('Latent terlalu kecil: detail sinyal hilang, error rekonstruksi tinggi.');
      else arr.push('Latent cukup untuk menangkap bentuk utama sinyal.');
      lines($('ae-read'), arr);
    }
    ['ae-k', 'ae-n'].forEach(function (id) { on(id, 'input', update); });
    update();
  }

  function initAep() {
    var table = $('aep-table');
    if (!table) return;
    function update() {
      var parts = $('aep-in').value.split(',').map(function (s) { return s.trim(); });
      var err = $('aep-err');
      clear(table);
      var ok = parts.length >= 2 && parts.length <= 12 && parts.every(function (s) { return /^\d{1,6}$/.test(s) && Number(s) >= 1; });
      if (!ok) {
        err.hidden = false;
        err.textContent = 'Isi 2 sampai 12 bilangan bulat positif (maks 6 digit), dipisah koma.';
        clear($('aep-read'));
        return;
      }
      err.hidden = true;
      var s = parts.map(Number), total = 0, i;
      table.appendChild(el('thead', null, [el('tr', null, ['Layer', 'in → out', 'Weights', 'Bias', 'Parameter'].map(function (t) { return el('th', { text: t }); }))]));
      var tb = el('tbody');
      for (i = 0; i < s.length - 1; i++) {
        var w = s[i] * s[i + 1], p = w + s[i + 1];
        total += p;
        tb.appendChild(el('tr', null, [el('td', { text: 'FC ' + (i + 1) }), el('td', { text: s[i] + ' → ' + s[i + 1] }),
          el('td', { 'class': 'num', text: String(w) }), el('td', { 'class': 'num', text: String(s[i + 1]) }), el('td', { 'class': 'num', text: String(p) })]));
      }
      tb.appendChild(el('tr', null, [el('th', { text: 'Total' }), el('td'), el('td'), el('td'), el('th', { 'class': 'num', text: String(total) })]));
      table.appendChild(tb);
      var latent = Math.min.apply(null, s), input = s[0], last = s[s.length - 1];
      var sym = s.every(function (v, idx) { return v === s[s.length - 1 - idx]; });
      lines($('aep-read'), [
        'Latent (layer tersempit) = ' + latent + ', input = ' + input + ': ' + (latent < input ? 'undercomplete.' : 'overcomplete atau sama (risiko copy).'),
        'Output decoder ' + last + (last === input ? ' sama dengan input: valid.' : ' beda dari input: tidak valid, output decoder wajib sama dimensi dengan input.'),
        'Bentuknya ' + (sym ? 'simetris. Umum, tapi tidak wajib.' : 'tidak simetris. Boleh, simetri hanya kebiasaan.')
      ]);
    }
    on('aep-in', 'input', update);
    update();
  }

  /* ---------- lookup widgets: keyword and symptom tables ---------- */

  var LOOKUP = {
    kw: [
      { k: '"tidak bisa dipisah garis lurus", "XOR", "tidak linearly separable"', a: ['Linear model gagal.', 'Gunakan MLP dengan hidden layer dan aktivasi non-linear.'] },
      { k: '"perceptron" + data non-linear', a: ['Perceptron hanya membuat satu garis, sehingga gagal.', 'Butuh multi-layer.'] },
      { k: '"decision boundary melengkung / kompleks"', a: ['Stack layer + aktivasi non-linear (MLP).'] },
      { k: '"gambar", "teks", "audio", "pola abstrak"', a: ['Relasi bersifat non-linear, linear model tidak cukup.', 'Pakai deep learning (fitur hierarkis).'] },
      { k: '"tambah layer tapi tanpa aktivasi"', a: ['Tetap linear, karena komposisi linear = linear.'] },
      { k: '"cukup satu hidden layer?"', a: ['Secara teori cukup (Universal Approximation Theorem).', 'Tetapi model yang lebih dalam lebih efisien.'] },
      { k: '"regresi linear untuk data berbentuk kurva"', a: ['Underfitting.', 'Solusinya fitur non-linear atau MLP.'] },
      { k: '"perceptron + sigmoid" / "threshold"', a: ['Boundary tetap lurus.', 'Sigmoid saja tidak mengubah bentuk boundary.'] }
    ],
    sym2: [
      { k: 'Training loss turun, validation loss naik', d: 'Overfitting', t: 'L2, dropout, data augmentation, early stopping.' },
      { k: 'Loss tinggi di training dan validation', d: 'Underfitting (tambahan)', t: 'Model lebih besar, kurangi λ, latih lebih lama.' },
      { k: 'Loss naik turun liar atau divergen', d: 'Learning rate terlalu tinggi', t: 'Kecilkan learning rate, pakai schedule.' },
      { k: 'Loss turun sangat lambat', d: 'Learning rate terlalu rendah', t: 'Naikkan learning rate, pakai schedule.' },
      { k: 'Gradien di layer awal hampir nol', d: 'Vanishing gradient / saturasi', t: 'Inisialisasi He atau Xavier, pakai ReLU atau variannya.' },
      { k: 'Sebagian neuron ReLU tidak pernah update', d: 'Dying ReLU', t: 'Leaky ReLU atau PReLU, kecilkan learning rate.' },
      { k: 'Akurasi tinggi, tetapi model hanya menebak kelas mayoritas', d: 'Class imbalance', t: 'Class weights atau sampling, ukur dengan F1 atau recall.' },
      { k: 'Regresi: ingin model yang tidak terlalu terpengaruh outlier', d: 'Pilih loss yang tahan outlier', t: 'MAE.' },
      { k: 'Regresi: ingin sangat menghukum error besar', d: 'Pilih loss sensitif', t: 'MSE.' },
      { k: 'Butuh training stabil dan cepat sebagai default', d: 'Pilih optimizer adaptif', t: 'Adam.' },
      { k: 'Butuh kontrol penuh dan regularisasi eksplisit', d: 'Pilih optimizer sederhana', t: 'SGD.' },
      { k: 'Dataset kecil, banyak kemungkinan hafal', d: 'Risiko overfit tinggi', t: 'Augmentation, dropout, early stopping.' }
    ],
    sym4: [
      { k: 'Hasil G mirip-mirip, kurang variasi', d: 'Mode collapse', t: 'Mini-batch discrimination, WGAN.' },
      { k: 'Loss berosilasi terus, tidak konvergen', d: 'Non-convergence', t: 'Kecilkan learning rate.' },
      { k: 'Loss D sangat kecil, G tidak belajar', d: 'Vanishing gradients (D terlalu kuat)', t: 'Label smoothing, non-saturating loss, LeakyReLU.' },
      { k: 'Loss D dan G seimbang, hasil realistis', d: 'Kondisi ideal', t: 'Lanjut evaluasi dengan FID dan IS.' },
      { k: 'Ingin mengontrol kelas output (misal "kucing" atau "anjing")', d: 'Perlu kondisi tambahan', t: 'Conditional GAN: label diberikan ke G dan D.' },
      { k: 'Ingin mengontrol gaya atau variasi visual', d: 'Perlu kontrol gaya', t: 'StyleGAN.' }
    ]
  };

  function initLookups() {
    function setup(selId, outId, items, render) {
      var sel = $(selId);
      if (!sel || !$(outId)) return;
      clear(sel);
      items.forEach(function (it, i) { sel.appendChild(el('option', { value: String(i), text: it.k })); });
      function show() {
        var it = items[parseInt(sel.value, 10)];
        if (it) lines($(outId), render(it));
      }
      sel.addEventListener('change', show);
      show();
    }
    setup('kw-sel', 'kw-out', LOOKUP.kw, function (it) { return it.a; });
    ['sym2', 'sym4'].forEach(function (p) {
      setup(p + '-sel', p + '-out', LOOKUP[p], function (it) {
        return ['Diagnosis: ' + it.d, 'Tindakan: ' + it.t];
      });
    });
  }

  /* ---------- 2d. Gradient descent step by step ---------- */

  function initGd() {
    var table = $('gd-table');
    if (!table) return;
    function update() {
      var eta = parseFloat($('gd-eta').value);
      var plus = $('gd-sign').value === 'plus';
      setText('gd-eta-o', eta.toFixed(2));
      var th = 3, rows = [], t, g;
      for (t = 0; t <= 6; t++) {
        g = 2 * th;
        rows.push([t, th, g, th * th]);
        th = plus ? th + eta * g : th - eta * g;
      }
      clear(table);
      table.appendChild(el('thead', null, [el('tr', null, ['Step', 'θ', 'Gradien 2θ', 'Loss θ²'].map(function (h) { return el('th', { text: h }); }))]));
      var tb = el('tbody');
      rows.forEach(function (r) {
        tb.appendChild(el('tr', null, [el('td', { text: String(r[0]) }), el('td', { text: num(r[1], 4) }), el('td', { text: num(r[2], 4) }), el('td', { text: num(r[3], 4) })]));
      });
      table.appendChild(tb);
      var first = rows[0][3], last = rows[6][3], msg;
      if (plus) msg = 'Tanda plus: θ bergerak naik gunung, loss membesar dari ' + num(first, 2) + ' ke ' + num(last, 2) + '. Itu alasan update memakai minus.';
      else if (last > first) msg = 'Diverge: faktor per step = 1 − 2η = ' + num(1 - 2 * eta, 2) + ', besarnya lebih dari 1, jadi |θ| membesar. Learning rate terlalu tinggi.';
      else if (last > 0.1 * first) msg = 'Turun tapi pelan: faktor per step = 1 − 2η = ' + num(1 - 2 * eta, 2) + '. Learning rate terlalu rendah untuk 6 step.';
      else msg = 'Konvergen: faktor per step = 1 − 2η = ' + num(1 - 2 * eta, 2) + ', loss turun dari ' + num(first, 2) + ' ke ' + num(last, 6) + '.';
      lines($('gd-read'), [msg, 'Rumus mainan ini θ ← (1 − 2η)θ stabil kalau |1 − 2η| < 1, yaitu 0 < η < 1 (tambahan).']);
    }
    on('gd-eta', 'input', update);
    on('gd-sign', 'change', update);
    update();
  }

  /* ---------- 3c. Receptive field ---------- */

  function initRf() {
    if (!$('rf-out')) return;
    function update() {
      var n = parseInt($('rf-n').value, 10), f = parseInt($('rf-f').value, 10);
      var cs = $('rf-c').value.trim(), c = /^\d+$/.test(cs) ? Number(cs) : NaN;
      setText('rf-n-o', String(n));
      if (isNaN(c) || c < 1 || c > 4096) { lines($('rf-out'), ['Isi channel C dengan bilangan bulat 1 sampai 4096.']); return; }
      var rf = 1 + n * (f - 1);
      var stacked = n * f * f * c * c, single = rf * rf * c * c;
      var arr = [
        'Receptive field = 1 + n·(F − 1) = 1 + ' + n + '·(' + f + ' − 1) = ' + rf + ' × ' + rf,
        'Parameter ' + n + ' layer ' + f + '×' + f + ' = ' + n + ' · ' + f + '·' + f + '·' + c + '·' + c + ' = ' + stacked,
        'Parameter satu layer ' + rf + '×' + rf + ' dengan receptive field sama = ' + rf + '·' + rf + '·' + c + '·' + c + ' = ' + single
      ];
      if (n === 1) arr.push('Dengan n = 1 keduanya sama, tidak ada penghematan.');
      else arr.push('Tumpukan hemat ' + num((1 - stacked / single) * 100, 1) + '% parameter, dan ada ' + n + ' kali ReLU di antaranya.');
      lines($('rf-out'), arr);
    }
    ['rf-n', 'rf-c'].forEach(function (id) { on(id, 'input', update); });
    on('rf-f', 'change', update);
    update();
  }

  /* ---------- 4c. GAN update order ---------- */

  function initGanFlow() {
    var row = $('gf-row');
    if (!row) return;
    var STEPS = [
      { t: 'Ambil batch data real. Label untuk D: 1.', d: false, g: false },
      { t: 'Buat noise acak z, masukkan ke G, hasilnya fake. Label untuk D: 0.', d: false, g: false },
      { t: 'Hitung loss D dari real dan fake.detach(), lalu update hanya bobot D.', d: true, g: false },
      { t: 'Freeze bobot D. Hitung loss G dari D(fake) dengan label 1.', d: false, g: false },
      { t: 'Update hanya bobot G. Iterasi selesai, ulangi dari batch real berikutnya.', d: false, g: true }
    ];
    var idx = 0;
    var NAMES = ['Data real', 'Noise z → G → fake', 'Discriminator D', 'Generator G'];
    function show() {
      var s = STEPS[idx];
      clear(row);
      var states = [
        { c: 'frozen', l: idx === 0 ? 'dipakai di langkah ini' : 'sudah diambil' },
        { c: 'frozen', l: idx === 1 ? 'dipakai di langkah ini' : (idx > 1 ? 'sudah dibuat' : 'belum') },
        { c: s.d ? 'train' : 'frozen', l: s.d ? 'dilatih' : (idx >= 3 ? 'frozen' : 'tidak diupdate') },
        { c: s.g ? 'train' : 'frozen', l: s.g ? 'dilatih' : 'tidak diupdate' }
      ];
      NAMES.forEach(function (n, i) {
        row.appendChild(el('div', { 'class': 'block ' + states[i].c }, [el('strong', { text: n }), states[i].l]));
      });
      $('gf-text').textContent = s.t;
      $('gf-step').textContent = 'Langkah ' + (idx + 1) + ' dari ' + STEPS.length;
      $('gf-prev').disabled = idx === 0;
      $('gf-next').textContent = idx === STEPS.length - 1 ? 'Ulangi dari awal' : 'Langkah berikutnya';
    }
    on('gf-prev', 'click', function () { if (idx > 0) { idx--; show(); } });
    on('gf-next', 'click', function () { idx = idx === STEPS.length - 1 ? 0 : idx + 1; show(); });
    show();
  }

  /* ---------- boot ---------- */

  function boot() {
    initNav();
    initChecklists();
    initQuiz();
    initXor();
    initLookups();
    initGd();
    initOpt();
    initOver();
    initMetrics();
    initCnn();
    initRf();
    initTl();
    initGan();
    initGanFlow();
    initMode();
    initHead();
    initCe();
    initDiag();
    initImb();
    initAe();
    initAep();
    updateProgress();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
