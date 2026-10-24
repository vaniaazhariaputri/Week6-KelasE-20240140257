/* =========================================================
   PPAW Week 6 - Fetch API, DOM, dan Event Handling
   ========================================================= */

const API_URL = "https://dummyjson.com/products";

// ---------- Elemen DOM ----------
const elStatus = document.getElementById("status");
const elDaftar = document.getElementById("daftar-produk");
const elCari = document.getElementById("cari");

const form = document.getElementById("form-pesan");
const inpNama = document.getElementById("nama");
const inpEmail = document.getElementById("email");
const selProduk = document.getElementById("pilih-produk");
const inpJumlah = document.getElementById("jumlah");
const inpCatatan = document.getElementById("catatan");
const elHitung = document.getElementById("hitung-catatan");
const elHasil = document.getElementById("hasil");

let semuaProduk = [];

/* =========================================================
   1. FETCH API - DATA PRODUK
   ========================================================= */

function tampilkanLoading() {
  elStatus.className = "status";
  elStatus.innerHTML = "";
  const spinner = document.createElement("span");
  spinner.className = "spinner";
  elStatus.append(spinner, "Memuat data produk...");
  elDaftar.innerHTML = "";
}

function tampilkanError(pesan) {
  elStatus.className = "status error-box";
  elStatus.textContent = "Data produk gagal dimuat. " + pesan;

  const tombol = document.createElement("button");
  tombol.type = "button";
  tombol.textContent = "Coba lagi";
  tombol.addEventListener("click", ambilProduk);
  elStatus.append(tombol);
}

async function ambilProduk() {
  tampilkanLoading();
  elCari.disabled = true;

  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Server membalas dengan status " + response.status + ".");
    }

    const data = await response.json();
    if (!Array.isArray(data.products) || data.products.length === 0) {
      throw new Error("Data produk kosong.");
    }

    semuaProduk = data.products;
    elStatus.textContent = "";
    renderProduk(semuaProduk);
    isiPilihanProduk(semuaProduk);
    elCari.disabled = false;
  } catch (err) {
    // err.name === "TypeError" biasanya berarti jaringan terputus
    const pesan = err.name === "TypeError"
      ? "Periksa koneksi internet kamu."
      : err.message;
    tampilkanError(pesan);
  }
}

function formatHarga(angka) {
  return "$" + Number(angka).toFixed(2);
}

function buatKartu(produk) {
  const kartu = document.createElement("article");
  kartu.className = "card";

  const gambar = document.createElement("img");
  gambar.src = produk.thumbnail;
  gambar.alt = produk.title;
  gambar.loading = "lazy";

  const isi = document.createElement("div");
  isi.className = "card-body";

  const nama = document.createElement("h3");
  nama.textContent = produk.title;

  const kategori = document.createElement("span");
  kategori.className = "kategori";
  kategori.textContent = produk.category;

  const harga = document.createElement("span");
  harga.className = "harga";
  harga.textContent = formatHarga(produk.price);

  const tombol = document.createElement("button");
  tombol.type = "button";
  tombol.textContent = "Pesan produk ini";
  tombol.addEventListener("click", () => pilihProduk(produk.id));

  isi.append(nama, kategori, harga, tombol);
  kartu.append(gambar, isi);
  return kartu;
}

function renderProduk(daftar) {
  elDaftar.innerHTML = "";

  if (daftar.length === 0) {
    elStatus.textContent = "Tidak ada produk yang cocok dengan pencarian.";
    return;
  }

  elStatus.textContent = "Menampilkan " + daftar.length + " produk.";
  const fragment = document.createDocumentFragment();
  daftar.forEach((produk) => fragment.append(buatKartu(produk)));
  elDaftar.append(fragment);
}

// Event "input": filter produk saat pengguna mengetik
elCari.addEventListener("input", () => {
  const kata = elCari.value.trim().toLowerCase();
  const hasil = semuaProduk.filter((p) => p.title.toLowerCase().includes(kata));
  renderProduk(hasil);
});

/* =========================================================
   2. FORM - DOM & EVENT HANDLING
   ========================================================= */

function isiPilihanProduk(daftar) {
  selProduk.innerHTML = "";

  const awal = document.createElement("option");
  awal.value = "";
  awal.textContent = "-- Pilih produk --";
  selProduk.append(awal);

  daftar.forEach((p) => {
    const opsi = document.createElement("option");
    opsi.value = p.id;
    opsi.textContent = p.title + " (" + formatHarga(p.price) + ")";
    selProduk.append(opsi);
  });
  selProduk.disabled = false;
}

// Event "click" pada kartu produk: isi form otomatis lalu geser ke form
function pilihProduk(id) {
  selProduk.value = id;
  validasiProduk();
  document.getElementById("pesan").scrollIntoView({ behavior: "smooth" });
  inpNama.focus({ preventScroll: true });
}

// ---------- Validasi: tiap fungsi mengembalikan true jika valid ----------

function setStatusField(input, pesanError) {
  const elError = document.getElementById("error-" + input.name);
  elError.textContent = pesanError;
  input.classList.toggle("invalid", pesanError !== "");
  input.classList.toggle("valid", pesanError === "");
  return pesanError === "";
}

function validasiNama() {
  const nilai = inpNama.value.trim();
  if (nilai === "") return setStatusField(inpNama, "Nama wajib diisi.");
  if (nilai.length < 3) return setStatusField(inpNama, "Nama minimal 3 karakter.");
  if (!/^[A-Za-z\s.'-]+$/.test(nilai)) {
    return setStatusField(inpNama, "Nama hanya boleh berisi huruf.");
  }
  return setStatusField(inpNama, "");
}

function validasiEmail() {
  const nilai = inpEmail.value.trim();
  if (nilai === "") return setStatusField(inpEmail, "Email wajib diisi.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(nilai)) {
    return setStatusField(inpEmail, "Format email tidak valid, contoh: nama@email.com.");
  }
  return setStatusField(inpEmail, "");
}

function validasiProduk() {
  if (selProduk.value === "") {
    return setStatusField(selProduk, "Pilih salah satu produk.");
  }
  return setStatusField(selProduk, "");
}

function validasiJumlah() {
  const nilai = Number(inpJumlah.value);
  if (inpJumlah.value === "") return setStatusField(inpJumlah, "Jumlah wajib diisi.");
  if (!Number.isInteger(nilai) || nilai < 1 || nilai > 10) {
    return setStatusField(inpJumlah, "Jumlah harus bilangan bulat 1 sampai 10.");
  }
  return setStatusField(inpJumlah, "");
}

// Event "input" / "change": validasi langsung saat pengguna mengisi
inpNama.addEventListener("input", validasiNama);
inpEmail.addEventListener("input", validasiEmail);
selProduk.addEventListener("change", validasiProduk);
inpJumlah.addEventListener("input", validasiJumlah);

inpCatatan.addEventListener("input", () => {
  elHitung.textContent = inpCatatan.value.length + " / 120 karakter";
});

// Event "submit": validasi semua, lalu tampilkan hasil
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const cekSemua = [validasiNama(), validasiEmail(), validasiProduk(), validasiJumlah()];
  if (cekSemua.includes(false)) {
    elHasil.hidden = true;
    form.querySelector(".invalid").focus();
    return;
  }

  const produk = semuaProduk.find((p) => String(p.id) === selProduk.value);
  const jumlah = Number(inpJumlah.value);
  tampilkanHasil({
    nama: inpNama.value.trim(),
    email: inpEmail.value.trim(),
    produk: produk.title,
    jumlah,
    total: produk.price * jumlah,
    catatan: inpCatatan.value.trim(),
  });

  form.reset();
  form.querySelectorAll(".valid, .invalid").forEach((el) => el.classList.remove("valid", "invalid"));
  elHitung.textContent = "0 / 120 karakter";
});

function tampilkanHasil(data) {
  elHasil.innerHTML = "";

  const judul = document.createElement("h3");
  judul.textContent = "Pesanan berhasil dikirim, terima kasih " + data.nama + "!";

  const daftar = document.createElement("ul");
  const baris = [
    "Email: " + data.email,
    "Produk: " + data.produk,
    "Jumlah: " + data.jumlah,
    "Total harga: " + formatHarga(data.total),
  ];
  if (data.catatan) baris.push("Catatan: " + data.catatan);

  baris.forEach((teks) => {
    const li = document.createElement("li");
    li.textContent = teks;
    daftar.append(li);
  });

  elHasil.append(judul, daftar);
  elHasil.hidden = false;
  elHasil.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// ---------- Mulai ----------
ambilProduk();