import { animate } from 'motion/mini'

// Semua gerakan halaman diatur dari satu file, biar kalau nanti terasa
// kelewatan tinggal dikurangi di sini — bukan berburu ke belasan komponen.
//
// KENAPA motion/mini, BUKAN motion PENUH:
// Paket penuh membawa mesin animasi JavaScript sendiri (~23 KB brotli) supaya
// bisa spring fisika sungguhan dan callback tiap frame. Halaman ini nggak
// butuh keduanya. motion/mini menyetir Web Animations API bawaan browser,
// jadi animasinya jalan di compositor — lebih ringan DAN lebih mulus waktu
// halaman sibuk. inView & parallax-nya dibikin sendiri; masing-masing cuma
// belasan baris, jauh lebih murah daripada mengimpor modulnya.
//
// Patokan: gerakan harus punya alasan. Reveal menuntun mata, stagger memberi
// urutan baca, parallax memberi kedalaman. Nggak ada yang bergerak cuma buat
// pamer — buat app keuangan, halaman yang sibuk bikin orang ragu.

/** Easing yang sedikit melewati target lalu balik — meniru rasa "mendarat"
 *  ala spring, tanpa ongkos mesin fisika. */
const PEGAS = [0.34, 1.32, 0.64, 1] as const
const DURASI = 0.62

const kurangiGerak = window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Munculkan semua yang disembunyikan CSS — dipakai saat mode kurangi gerak. */
const tampilkanSemua = () => {
  document.querySelectorAll<HTMLElement>('[data-reveal], [data-stagger] > *').forEach(tetapkanAkhir)
}

/**
 * Tetapkan keadaan ISTIRAHAT elemen ke "terlihat" SEBELUM animasinya jalan.
 *
 * Wajib, dan ini halus: Web Animations API secara bawaan nggak menahan nilai
 * akhir (fill: none). Begitu animasi selesai, elemen balik ke gaya aslinya —
 * yang di sini opacity:0 dari CSS. Hasilnya konten berkedip muncul lalu
 * hilang lagi. Menetapkan gaya inline duluan bikin keadaan akhirnya benar,
 * dan animasi cuma jadi jembatan menuju ke situ.
 */
const tetapkanAkhir = (el: HTMLElement) => {
  el.style.opacity = '1'
  el.style.transform = 'none'
}

/**
 * Pasang penangan gulir yang aman.
 *
 * KENAPA BUKAN pola "flag + requestAnimationFrame" yang biasa dipakai:
 * pola itu menandai `menunggu = true`, menjadwalkan rAF, lalu membersihkan
 * flag-nya DI DALAM rAF. Kalau tab pindah ke latar belakang tepat setelah
 * frame dijadwalkan, rAF-nya nggak pernah jalan — dan flag-nya terkunci
 * selamanya. Semua gulir sesudahnya diabaikan diam-diam, animasinya mati
 * tanpa satu pun error. Sudah kejadian di halaman ini.
 *
 * Gantinya: kerjakan langsung di pendengar pasif, dilewati kalau posisinya
 * nggak berubah. Dua pembacaan tata letak per gulir itu murah, dan pendengar
 * pasif nggak pernah menghambat gulir.
 */
const daftarGulir = (kerjakan: () => void) => {
  let terakhir = -1
  const jalan = () => {
    if (window.scrollY === terakhir) return
    terakhir = window.scrollY
    kerjakan()
  }
  addEventListener('scroll', jalan, { passive: true })
  addEventListener('resize', kerjakan, { passive: true })
  kerjakan()
}

/** Jalankan sesuatu sekali, saat elemennya masuk layar. */
const saatTerlihat = (
  target: Iterable<Element>,
  aksi: (el: HTMLElement) => void,
  ambang = 0.15,
) => {
  const pengamat = new IntersectionObserver(
    (entri) => {
      for (const e of entri) {
        if (!e.isIntersecting) continue
        pengamat.unobserve(e.target)
        aksi(e.target as HTMLElement)
      }
    },
    { threshold: ambang, rootMargin: '0px 0px -6% 0px' },
  )
  for (const el of target) pengamat.observe(el)
}

if (kurangiGerak) {
  tampilkanSemua()
} else {
  // 1) Reveal per elemen
  saatTerlihat(document.querySelectorAll('[data-reveal]'), (el) => {
    tetapkanAkhir(el)
    animate(
      el,
      { opacity: [0, 1], transform: ['translateY(24px)', 'none'] },
      { duration: DURASI, easing: PEGAS },
    )
  })

  // 2) Stagger — anak grid muncul berurutan, bukan barengan. Ini yang bikin
  //    mata punya urutan baca, bukan diserbu sekaligus.
  saatTerlihat(
    document.querySelectorAll('[data-stagger]'),
    (wadah) => {
      const anak = Array.from(wadah.children) as HTMLElement[]
      anak.forEach((el, i) => {
        tetapkanAkhir(el)
        animate(
          el,
          { opacity: [0, 1], transform: ['translateY(26px)', 'none'] },
          { duration: DURASI, easing: PEGAS, delay: i * 0.06 },
        )
      })
    },
    0.1,
  )

  // 3) Parallax latar hero — bergerak lebih lambat dari teksnya. Itu yang
  //    bikin halaman terasa punya kedalaman, bukan selembar kertas.
  //    Dipasang manual + rAF supaya nggak menghitung ulang tiap event gulir.
  const glow = document.querySelector<HTMLElement>('[data-parallax="glow"]')
  const hero = document.querySelector<HTMLElement>('[data-hero]')
  if (glow && hero) {
    const perbarui = () => {
      const lewat = Math.min(Math.max(window.scrollY, 0), hero.offsetHeight)
      glow.style.transform = `translate3d(0, ${lewat * 0.28}px, 0)`
    }
    daftarGulir(perbarui)
  }

  // 4) Tahapan "Cara Pakai" yang TERIKAT ke gulir.
  //    Bedanya dengan reveal: reveal muncul sekali lalu selesai — digulir
  //    balik nggak terjadi apa-apa. Di sini kemajuannya dihitung dari posisi
  //    section, jadi maju-mundur ikut bergerak. Itu yang bikin terasa
  //    dikendalikan, bukan ditonton.
  const tahapan = document.querySelector<HTMLElement>('[data-tahapan]')
  if (tahapan && innerWidth >= 1024) {
    const baris = Array.from(tahapan.querySelectorAll<HTMLElement>('[data-tahap]'))
    const layar = Array.from(tahapan.querySelectorAll<HTMLElement>('[data-layar]'))
    let aktifTerakhir = -1

    const setAktif = (idx: number) => {
      if (idx === aktifTerakhir) return
      aktifTerakhir = idx

      baris.forEach((li, i) => {
        const aktif = i === idx
        li.style.borderColor = aktif ? 'rgba(2,72,193,0.25)' : 'transparent'
        li.style.background = aktif ? '#fff' : 'transparent'
        li.style.boxShadow = aktif ? '0 2px 14px rgba(17,24,53,0.07)' : 'none'

        const angka = li.querySelector<HTMLElement>('[data-tahap-angka]')
        if (angka) {
          angka.style.background = aktif ? '#F8D613' : 'transparent'
          angka.style.borderColor = aktif ? '#F8D613' : '#D8DCE6'
          angka.style.color = aktif ? '#111835' : '#5B6478'
        }
        const isi = li.querySelector<HTMLElement>('[data-tahap-isi]')
        if (isi) isi.style.opacity = aktif ? '1' : '0.45'
      })

      layar.forEach((s, i) => {
        const aktif = i === idx
        s.style.opacity = aktif ? '1' : '0'
        s.style.transform = aktif ? 'none' : 'translateY(14px)'
        s.style.pointerEvents = aktif ? 'auto' : 'none'
      })
    }

    const hitungTahap = () => {
      const r = tahapan.getBoundingClientRect()
      const totalGulir = tahapan.offsetHeight - innerHeight
      if (totalGulir <= 0) return setAktif(0)
      // 0 saat section mulai menempel, 1 saat mau lepas
      const maju = Math.min(Math.max(-r.top / totalGulir, 0), 0.999)
      setAktif(Math.floor(maju * baris.length))
    }

    daftarGulir(hitungTahap)
  }

  // 5) Tombol magnetik — CTA menarik kursor sedikit waktu didekati.
  //    Maksimal 6px: cukup buat terasa hidup, nggak sampai terasa mainan.
  //    Cuma buat perangkat bermouse; di layar sentuh nggak ada gunanya.
  if (matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((tombol) => {
      const KUAT = 6
      tombol.addEventListener('pointermove', (e) => {
        const r = tombol.getBoundingClientRect()
        const x = ((e.clientX - r.left) / r.width - 0.5) * KUAT * 2
        const y = ((e.clientY - r.top) / r.height - 0.5) * KUAT * 2
        tombol.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`
      })
      tombol.addEventListener('pointerleave', () => {
        animate(tombol, { transform: 'translate(0px, 0px)' }, { duration: 0.4, easing: PEGAS })
      })
    })
  }
}
